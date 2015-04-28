var fs   = require('fs')
    , utils = require('./utils')
    , netrctools = require('./netrc')
    , baseUrl = null
    ;
module.exports = {
    machineName: process.env.DEXTER_HOST || 'rundexter.com'
    , hostIsHTTPS: process.env.DEXTER_HOST_HTTPS == 1
    , isDev: process.env.DEXTER_DEV !== undefined
    , getUserHome: function() {
        return process.env.HOME || process.env.HOMEPATH || process.env.USERPROFILE;
    }
}
