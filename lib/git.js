var git = require('nodegit')
    , path = require('path')
    , Promise = require('promise')
    ;
function callIfFunction(fn, params) {
    if(fn instanceof Function) {
        if(!Array.isArray(params)) {
            params = [params];
        }
        fn.apply(null, params);
    }
}
function pVal() {
    var rawargs = arguments
        , myargs = Object.keys(arguments).map(function(k) {
            return rawargs[k];
        })
        ;
    return new Promise(function(success) {
        if(myargs.length === 1) {
            success(myargs[0]);
        } else {
            success(myargs);
        }
    });
}
module.exports = {
    //Can be used either as a promise or as a callback
    getRepo: function(dir, callback) {
        dir = path.resolve(dir);
        return git.Repository.open(dir)
            .then(function(repo) {
                callIfFunction(callback, repo);
                return pVal(repo);
            }, function() {
                callIfFunction(callback, null);
                return pVal(null);
            });

    },
    getOrCreateRepo: function(dir, callback) {
        return this.getRepo(dir)
            .then(function(repo) {
                if(repo) {
                    return pVal(null);
                }
                return git.Repository.init(dir, false)
                    .then(function(repo) {
                        callIfFunction(callback, repo);
                        return pVal(repo);
                    });
            });
    },
    getRemote: function(dir, name, callback) {
        return this.getRepo(dir)
            .then(function(repo) {
                if(!repo) {
                    callIfFunction(callback, [null, null]);
                    return pVal(null, null);
                }
                return repo.getRemote(name)
                    .then(function(remote) {
                        callIfFunction(callback, [remote, repo]);
                        return pVal(remote, repo);
                    }, function() {
                        callIfFunction(callback, [null, repo]);
                        return pVal(null, repo);
                    });
            });
    },
    getOrCreateRemote: function(dir, name, uri, callback) {
        return this.getRemote(dir, name)
            .then(function(results) {
                var remote = results[0]
                    , repo = results[1];
                if(remote) {
                    callIfFunction(callback, [remote, repo]);
                    return pVal(remote, repo);
                }
                if(repo) {
                    return pVal(git.Remote.create(repo, name, uri));
                }
                callIfFunction(callback, [null, null]);
                return pVal(null, null);
            });
    }
};
