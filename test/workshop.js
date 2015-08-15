var should = require('should');
var SteamWorkshop = require('../src/workshop');

describe('SteamWorkshop', function () {
  describe('prepareCollectionData', function () {
    it('should set single id correctly', function (done) {
      var data = SteamWorkshop.prepareCollectionData([123]);
      data.publishedfileids.should.eql([123]);
      data.collectioncount.should.eql(1);
      done();
    });

    it('should set multiple ids correctly', function (done) {
      var data = SteamWorkshop.prepareCollectionData([123, 456]);
      data.publishedfileids.should.eql([123, 456]);
      data.collectioncount.should.eql(2);
      done();
    });
  });

  describe('prepareFileData', function() {
    it('should set single id correctly', function (done) {
      SteamWorkshop.prepareFilesData([123]).publishedfileids.should.eql([123]);
      done();
    });

    it('should set multiple ids correctly', function (done) {
      var data = SteamWorkshop.prepareFilesData([123, 456]);
      data.publishedfileids.should.eql([123, 456]);
      data.itemcount.should.eql(2);
      done();
    });
  });
});
