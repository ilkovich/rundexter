var path = require('path')
    , fs = require('fs')
    , rest = require('restler')
    , url = require('url')
    , utils = require('./utils')
    , configtools = require('../lib/config')
    ;
module.exports = {
    getDefaultKey: function() {
        var sshPath = path.join(configtools.getUserHome(), '.ssh')
            , rsaPath = path.join(sshPath, 'id_rsa.pub')
            , dsaPath = path.join(sshPath, 'id_dsa.pub')
            , hasRSA = fs.existsSync(rsaPath)
            , hasDSA = fs.existsSync(dsaPath)
            ;
        if(hasRSA) {
            return fs.readFileSync(rsaPath, 'utf8');
        } else if(hasDSA) {
            return fs.readFileSync(dsaPath, 'utf8');
        } else {
            return null;
        }
    },
    getKey: function(path) {
        return fs.readFileSync(path, 'utf8');
    },
    sendKey: function(key, callback) {
        var baseUrl = configtools.getBaseUrl()
            , sendUrl = url.resolve(baseUrl, 'auth/add-key')
            ;
        if(process.env.DEXTER_DEV) {
            console.log('Sending key to', sendUrl);
        }
        rest.post(sendUrl, {
            data: { key: key }
            , headers: configtools.getAuthorizedRequestHeaders()
        }).on('complete', function(result, response) {
            utils.restResponse(result, response, function() {
                if(callback) callback(result);
            });
        });
    },
    removeKey: function(query, callback) {
        var baseUrl = configtools.getBaseUrl()
            , sendUrl = url.resolve(baseUrl, 'auth/remove-key')
            ;
        if(process.env.DEXTER_DEV) {
            console.log('Removing key:', sendUrl);
        }
        rest.del(sendUrl, {
            data: { query: query }
            , headers: configtools.getAuthorizedRequestHeaders()
        }).on('complete', function(result, response) {
            utils.restResponse(result, response, function() {
                if(callback) callback(result);
            });
        });
    },
    getAll: function(callback) {
        var baseUrl = configtools.getBaseUrl()
            , sendUrl = url.resolve(baseUrl, 'auth/list-keys')
            ;
        if(process.env.DEXTER_DEV) {
            console.log('Fetching keys:', sendUrl);
        }
        rest.get(sendUrl, {
            headers: configtools.getAuthorizedRequestHeaders()
        }).on('complete', function(result, response) {
            utils.restResponse(result, response, function() {
                if(callback) callback(result);
            });
        });
    }
}
