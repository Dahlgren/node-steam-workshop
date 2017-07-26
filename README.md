# Steam Workshop

[![Build Status](https://travis-ci.org/Dahlgren/node-steam-workshop.svg)](http://travis-ci.org/Dahlgren/node-steam-workshop)
[![Dependency Status](https://david-dm.org/Dahlgren/node-steam-workshop.png)](https://david-dm.org/Dahlgren/node-steam-workshop)

Download files and collections from Steam Workshop

## Module

Install module

> npm install steam-workshop

Require the module in your code and create a new Workshop object.
It requires one argument for the output folder where downloaded files will be saved.

```javascript
var SteamWorkshop = require('steam-workshop');
var steamWorkshop = new SteamWorkshop(outputFolder);
```

### SteamWorkshop Methods

#### downloadFile(fileId, callback(err, files))

Download a file to your output folder.
Takes a string or integer as argument.

#### downloadFiles(fileIds, callback(err, files))

Download files to your output folder.
Takes an array of strings or integers as argument.

#### downloadCollection(collectionId, callback(err, files))

Download a collection of files to your output folder.
Takes a string or integer as argument.

#### downloadCollections(collectionIds, callback(err, files))

Download collections of files to your output folder.
Takes an array of strings or integers as argument.

#### getCollectionDetails(collectionIds, callback(err, files))

https://partner.steamgames.com/doc/webapi/ISteamRemoteStorage#GetCollectionDetails

Get details about collections from Steam Workshop.
Takes an number, a string or an array of strings or integers as argument.

#### getPublishedFileDetails(fileIds, callback(err, files))

https://partner.steamgames.com/doc/webapi/ISteamRemoteStorage#GetPublishedFileDetails

Get details about files from Steam Workshop.
Takes an number, a string or an array of strings or integers as argument.

#### queryFiles(query, callback(err, files))

https://partner.steamgames.com/doc/webapi/IPublishedFileService#QueryFiles

Search Steam Workshop for files with passed query argument.
`key` is the only required value for query.
bool values should be passed as a number or string, 1 or 0.
