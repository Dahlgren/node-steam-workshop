var async = require('async')
var fs = require('fs')
var path = require('path')
var request = require('request')

var FILE_URL = 'http://api.steampowered.com/ISteamRemoteStorage/GetPublishedFileDetails/v0001/'
var COLLECTION_URL = 'http://api.steampowered.com/ISteamRemoteStorage/GetCollectionDetails/v0001/'

var SteamWorkshop = function (folder) {
  this.folder = folder
}

/* Prepare request payload */

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

SteamWorkshop.prototype.loadCollectionData = function (requestData, cb) {
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

    var fileIds = data.response.collectiondetails.map(function (collection) {
      if (!collection.children) {
        return []
      }

      return collection.children.map(function (file) {
        return file.publishedfileid
      })
    }).reduce(function (a, b) {
      return a.concat(b)
    })
    cb(null, fileIds)
  })
}

SteamWorkshop.prototype.loadFilesData = function (requestData, cb) {
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

    var files = data.response.publishedfiledetails
    cb(null, files)
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

  self.loadFilesData(SteamWorkshop.prepareFilesData(ids), function (err, files) {
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

  self.loadCollectionData(SteamWorkshop.prepareCollectionData(ids), function (err, fileIds) {
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
