var q = require('q')
    , utils = require('./utils')
    , fs = require('fs')
    , path = require('path')
    ;
module.exports = {
    getMetaFilename: function(dir) {
        dir = dir || '.';
        return path.resolve(dir, './meta.json');
    }
    , getMetaData: function(dir) {
        return q.nfcall(utils.getJsonFile, this.getMetaFilename(dir));
    }
    , getPackageFilename: function(dir) {
        dir = dir || '.';
        return path.resolve(dir, './package.json');
    }
    , getPackageData: function(dir) {
        return q.nfcall(utils.getJsonFile, this.getPackageFilename(dir));
    }
    , getPackageName: function(dir, callback) {
        this.getPackageData(dir).then(function(data) {
            if(data && data.name) {
                callback(data.name);
            } else {
                callback(null);
            }
        });
    }
    , assertPublishable: function(package) {
        if(!package.repository)
            throw "package.json > repository attribute required";
        else if(package.repository.type != 'git')
            throw "package.json > repository.type must be git";
        else if(!package.repository.url)
            throw "package.json > repository.url required";
    }
}
