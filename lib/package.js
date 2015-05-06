module.exports = {
    getMetaFilename: function() {
        return './meta.json';
    }
    , getPackageFilename: function() {
        return './package.json';
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
