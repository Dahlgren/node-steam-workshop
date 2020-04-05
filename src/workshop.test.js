var assert = require('assert').strict
var SteamWorkshop = require('./workshop')

describe('SteamWorkshop', function () {
  describe('ensureArray', function () {
    it('should change number to array of number', function () {
      var arr = SteamWorkshop.ensureArray(123)
      assert.deepEqual(arr, [123])
    })

    it('should change string to array of string', function () {
      var arr = SteamWorkshop.ensureArray('123')
      assert.deepEqual(arr, ['123'])
    })

    it('should retain array of number', function () {
      var arr = SteamWorkshop.ensureArray([123])
      assert.deepEqual(arr, [123])
    })

    it('should retain array of numbers', function () {
      var arr = SteamWorkshop.ensureArray([123, 456])
      assert.deepEqual(arr, [123, 456])
    })

    it('should retain array of string', function () {
      var arr = SteamWorkshop.ensureArray(['123', '456'])
      assert.deepEqual(arr, ['123', '456'])
    })
  })

  describe('prepareCollectionData', function () {
    it('should set single id correctly', function () {
      var data = SteamWorkshop.prepareCollectionData([123])
      assert.deepEqual(data.publishedfileids, [123])
      assert.deepEqual(data.collectioncount, 1)
    })

    it('should set multiple ids correctly', function () {
      var data = SteamWorkshop.prepareCollectionData([123, 456])
      assert.deepEqual(data.publishedfileids, [123, 456])
      assert.deepEqual(data.collectioncount, 2)
    })
  })

  describe('prepareFileData', function () {
    it('should set single id correctly', function () {
      var data = SteamWorkshop.prepareFilesData([123])
      assert.deepEqual(data.publishedfileids, [123])
    })

    it('should set multiple ids correctly', function () {
      var data = SteamWorkshop.prepareFilesData([123, 456])
      assert.deepEqual(data.publishedfileids, [123, 456])
      assert.deepEqual(data.itemcount, 2)
    })
  })
})
