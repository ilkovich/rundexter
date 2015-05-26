var q = require('q')
    , utils = require('./utils')
    , configtools = require('./config')
    , fs = require('fs')
    , path = require('path')
    , child_process = require('child_process')
    , NAME_STATUS = {
        AVAILABLE: 0,
        OWNED_BY_USER: 1,
        UNAVAILABLE: 100
    }
    ;
function cleanOutput(str) {
    return str.trim().replace(/[\r\n\t]/g, ' ');
}
module.exports = {
    NAME_STATUS: NAME_STATUS
    , getMetaFilename: function(dir) {
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
    , isNameAvailable: function(title, callback) {
        var d = q.defer();
        //{ stdio: [process.stdin, process.stdout, process.stderr, 'pipe'] }
        child_process.execFile(
            'ssh',
            ['-p', configtools.git.port, 'git@' + configtools.git.machineName, 'module_exists', title],
            { },
            function(err, stdout, stderr) {
                stdout = cleanOutput(stdout);
                stderr = cleanOutput(stderr);
                var errData = stdout;
                if(stdout && stderr) errData += ' : ';
                if(stderr) errData += stderr;
                //Technically, since all the info is on stdout, we don't need to 
                //  check for an error, but it might make sense to remember there's
                //  a nonzero exit code in the future.
                if(!err) {
                    switch(stdout) {
                        case 'owned':
                            d.resolve(NAME_STATUS.OWNED_BY_USER);
                            break;
                        case 'available':
                            d.resolve(NAME_STATUS.AVAILABLE);
                            break;
                        default:
                            d.reject('Unknown success response: ' + errData);
                            break;
                    }
                    //Name is available
                } else {
                    //Name isn't available
                    switch(stdout) {
                        case 'unauthorized':
                            d.resolve(NAME_STATUS.UNAVAILABLE);
                            break;
                        default:
                            d.reject('Unknown error response: ' + errData);
                            break;
                    }
                }
            }
        );
        d.promise.nodeify(callback);
        return d.promise;    
    }
    , assertPublishable: function(package) {
        if(!package.repository) {
            throw "package.json > repository attribute required";
        } else if(package.repository.type != 'git') {
            throw "package.json > repository.type must be git";
        } else if(!package.repository.url) {
            throw "package.json > repository.url required";
        }
    }
}
