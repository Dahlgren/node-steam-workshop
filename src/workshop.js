var fs = require('fs')
var path = require('path')
var request = require('request')

var FILE_URL = 'https://api.steampowered.com/ISteamRemoteStorage/GetPublishedFileDetails/v1/'
var COLLECTION_URL = 'https://api.steampowered.com/ISteamRemoteStorage/GetCollectionDetails/v1/'
var QUERY_FILES_URL = 'https://api.steampowered.com/IPublishedFileService/QueryFiles/v1/'

var SteamWorkshop = function (folder) {
  this.folder = folder
}

/* Prepare request payload */

SteamWorkshop.ensureArray = function (arr) {
  if (Array.isArray(arr)) {
    return arr
  }

  return [arr]
}

SteamWorkshop.prepareCollectionData = function (ids) {
  return {
    format: 'json',
    collectioncount: ids.length,
    publishedfileids: ids
  }
}

SteamWorkshop.prepareFilesData = function (ids) {
  return {
    format: 'json',
    itemcount: ids.length,
    publishedfileids: ids
  }
}

/* Load data from Steam Workshop API */

SteamWorkshop.prototype.getCollectionDetails = function (ids, cb) {
  ids = SteamWorkshop.ensureArray(ids)
  var requestData = SteamWorkshop.prepareCollectionData(ids)

  return new Promise(function (resolve, reject) {
    request.post(COLLECTION_URL, { form: requestData, json: true }, function (err, resp, data) {
      if (err) {
        throw err
      }

      if (!data || !data.response || !data.response.collectiondetails) {
        throw new Error('No data found')
      }

      if (cb) {
        cb(null, data.response.collectiondetails)
      }

      return resolve(data.response.collectiondetails)
    })
  }).catch(function (err) {
    if (cb) {
      cb(err)
    } else {
      throw err
    }
  })
}

SteamWorkshop.prototype.getPublishedFileDetails = function (ids, cb) {
  ids = SteamWorkshop.ensureArray(ids)
  var requestData = SteamWorkshop.prepareFilesData(ids)

  return new Promise(function (resolve, reject) {
    request.post(FILE_URL, { form: requestData, json: true }, function (err, resp, data) {
      if (err) {
        throw err
      }

      if (!data || !data.response || !data.response.publishedfiledetails) {
        throw new Error('No data found')
      }

      if (cb) {
        cb(null, data.response.publishedfiledetails)
      }

      return resolve(data.response.publishedfiledetails)
    })
  }).catch(function (err) {
    if (cb) {
      cb(err)
    } else {
      throw err
    }
  })
}

SteamWorkshop.prototype.queryFiles = function (query, cb) {
  return new Promise(function (resolve, reject) {
    request.get(QUERY_FILES_URL, { json: true, qs: query }, function (err, resp, data) {
      if (err) {
        throw err
      }

      if (!data || !data.response || !data.response.publishedfiledetails) {
        throw new Error('No data found')
      }

      if (cb) {
        cb(null, data.response.publishedfiledetails)
      }

      return resolve(data.response.publishedfiledetails)
    })
  }).catch(function (err) {
    if (cb) {
      cb(err)
    } else {
      throw err
    }
  })
}

/* Actual file download */

SteamWorkshop.prototype.saveFileToDisk = function (file, folder) {
  var folderPath = path.join(folder, path.dirname(file.filename))
  var filePath = path.join(folder, file.filename)

  return new Promise(function (resolve, reject) {
    fs.mkdir(folderPath, { recursive: true }, function (err) {
      if (err) {
        return reject(err)
      }

      var f = fs.createWriteStream(filePath)
        .on('error', function (err) {
          reject(err)
        })
        .on('finish', function () {
          resolve()
        })

      request(file.file_url)
        .on('error', function (err) {
          reject(err)
        })
        .pipe(f)
    })
  })
}

SteamWorkshop.prototype.saveFilesToDisk = function (files, folder, cb) {
  var self = this

  return Promise.all(files.map(function (file) {
    if (!file.file_url) {
      return
    }

    return self.saveFileToDisk(file, folder)
  })).then(function (results) {
    if (cb) {
      cb(results)
    }

    return results
  }).catch(function (err) {
    if (cb) {
      return cb(err)
    }

    throw err
  })
}

/*
 * Download multiple files from Steam Workshop
 */
SteamWorkshop.prototype.downloadFiles = function (ids, cb) {
  var self = this

  return self.getPublishedFileDetails(ids)
    .then(function (files) {
      return self.saveFilesToDisk(files, self.folder)
        .then(function () {
          return files
        })
    })
    .catch(function (err) {
      if (cb) {
        cb(err)
      } else {
        throw err
      }
    })
}

/*
 * Download single file from Steam Workshop
 */
SteamWorkshop.prototype.downloadFile = function (id, cb) {
  return this.downloadFiles([id], cb)
}

/*
 * Download multiple collections from Steam Workshop
 */
SteamWorkshop.prototype.downloadCollections = function (ids, cb) {
  var self = this

  return self.getCollectionDetails(ids)
    .then(function (response) {
      var fileIds = response.map(function (collection) {
        if (!collection.children) {
          return []
        }

        return collection.children.map(function (file) {
          return file.publishedfileid
        })
      }).reduce(function (a, b) {
        return a.concat(b)
      })

      return self.downloadFiles(fileIds, cb)
    })
    .catch(function (err) {
      if (cb) {
        cb(err)
      } else {
        throw err
      }
    })
}

/*
 * Download single collection from Steam Workshop
 */
SteamWorkshop.prototype.downloadCollection = function (id, cb) {
  return this.downloadCollections([id], cb)
}

module.exports = SteamWorkshop
