var async = require('async')
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

  request.post(COLLECTION_URL, {form: requestData}, function (err, resp, body) {
    if (err) {
      return cb(err)
    }

    var data = null
    try {
      data = JSON.parse(body)
    } catch (e) {
      return cb(new Error('Error parsing response from Steam Workshop'))
    }

    if (!data || !data.response || !data.response.collectiondetails) {
      return cb(new Error('No data found'))
    }

    cb(null, data.response.collectiondetails)
  })
}

SteamWorkshop.prototype.getPublishedFileDetails = function (ids, cb) {
  ids = SteamWorkshop.ensureArray(ids)
  var requestData = SteamWorkshop.prepareFilesData(ids)

  request.post(FILE_URL, {form: requestData}, function (err, resp, body) {
    if (err) {
      return cb(err)
    }

    var data = null
    try {
      data = JSON.parse(body)
    } catch (e) {
      return cb(new Error('Error parsing response from Steam Workshop'))
    }

    if (!data || !data.response || !data.response.publishedfiledetails) {
      return cb(new Error('No data found'))
    }

    cb(null, data.response.publishedfiledetails)
  })
}

SteamWorkshop.prototype.queryFiles = function (query, cb) {
  request.get(QUERY_FILES_URL, {qs: query}, function (err, resp, body) {
    if (err) {
      return cb(err)
    }

    var data = null
    try {
      data = JSON.parse(body)
    } catch (e) {
      return cb(new Error('Error parsing response from Steam Workshop'))
    }

    if (!data || !data.response || !data.response.publishedfiledetails) {
      return cb(new Error('No data found'))
    }

    cb(null, data.response.publishedfiledetails)
  })
}

/* Actual file download */

SteamWorkshop.prototype.saveFileToDisk = function (file, folder, cb) {
  var f = fs.createWriteStream(path.join(folder, file.filename))
    .on('error', function (err) {
      cb(err)
    })
    .on('finish', function () {
      cb()
    })

  request(file.file_url)
    .on('error', function (err) {
      cb(err)
    })
    .pipe(f)
}

SteamWorkshop.prototype.saveFilesToDisk = function (files, folder, cb) {
  var self = this

  async.map(files, function (file, done) {
    if (!file.file_url) {
      done()
    } else {
      self.saveFileToDisk(file, folder, done)
    }
  }, function (err, results) {
    cb(err)
  })
}

/*
 * Download multiple files from Steam Workshop
 */
SteamWorkshop.prototype.downloadFiles = function (ids, cb) {
  var self = this

  self.getPublishedFileDetails(ids, function (err, files) {
    if (err) {
      cb(err)
    } else {
      self.saveFilesToDisk(files, self.folder, function (err) {
        cb(err, files)
      })
    }
  })
}

/*
 * Download single file from Steam Workshop
 */
SteamWorkshop.prototype.downloadFile = function (id, cb) {
  this.downloadFiles([id], cb)
}

/*
 * Download multiple collections from Steam Workshop
 */
SteamWorkshop.prototype.downloadCollections = function (ids, cb) {
  var self = this

  self.getCollectionDetails(ids, function (err, response) {
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

    if (err) {
      cb(err)
    } else {
      self.downloadFiles(fileIds, cb)
    }
  })
}

/*
 * Download single collection from Steam Workshop
 */
SteamWorkshop.prototype.downloadCollection = function (id, cb) {
  this.downloadCollections([id], cb)
}

module.exports = SteamWorkshop
