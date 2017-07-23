require('should')
var SteamWorkshop = require('../src/workshop')

describe('SteamWorkshop', function () {
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
