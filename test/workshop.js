require('should')
var SteamWorkshop = require('../src/workshop')

describe('SteamWorkshop', function () {
  describe('ensureArray', function () {
    it('should change number to array of number', function () {
      var arr = SteamWorkshop.ensureArray(123)
      arr.should.eql([123])
    })

    it('should change string to array of string', function () {
      var arr = SteamWorkshop.ensureArray('123')
      arr.should.eql(['123'])
    })

    it('should retain array of number', function () {
      var arr = SteamWorkshop.ensureArray([123])
      arr.should.eql([123])
    })

    it('should retain array of numbers', function () {
      var arr = SteamWorkshop.ensureArray([123, 456])
      arr.should.eql([123, 456])
    })

    it('should retain array of string', function () {
      var arr = SteamWorkshop.ensureArray(['123', '456'])
      arr.should.eql(['123', '456'])
    })
  })

  describe('prepareCollectionData', function () {
    it('should set single id correctly', function () {
      var data = SteamWorkshop.prepareCollectionData([123])
      data.publishedfileids.should.eql([123])
      data.collectioncount.should.eql(1)
    })

    it('should set multiple ids correctly', function () {
      var data = SteamWorkshop.prepareCollectionData([123, 456])
      data.publishedfileids.should.eql([123, 456])
      data.collectioncount.should.eql(2)
    })
  })

  describe('prepareFileData', function () {
    it('should set single id correctly', function () {
      SteamWorkshop.prepareFilesData([123]).publishedfileids.should.eql([123])
    })

    it('should set multiple ids correctly', function () {
      var data = SteamWorkshop.prepareFilesData([123, 456])
      data.publishedfileids.should.eql([123, 456])
      data.itemcount.should.eql(2)
    })
  })
})
