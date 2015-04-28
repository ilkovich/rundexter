var fs   = require('fs')
    , utils = require('./utils')
    , netrctools = require('./netrc')
    , baseUrl = null
    ;
module.exports = {
    machineName: process.env.DEXTER_HOST || 'rundexter.com'
    , hostIsHTTPS: process.env.DEXTER_HOST_HTTPS == 1
    , getUserHome: function() {
        return process.env.HOME || process.env.HOMEPATH || process.env.USERPROFILE;
    }
    //We pass the config just to make sure it's loaded, rather than
    //  worrying about promises/callback
    , getBaseUrl: function(config) {
        var protocol = (this.hostIsHTTPS) ? 'https://' : 'http://';
        return url.resolve(protocol + this.machineName, '/api/');
    }
    , getAuthorizedRequestHeaders: function(headers) {
        headers = headers || {};
        headers['X-Authorization'] = netrctools.getPassword();
        return headers;
    }
}
