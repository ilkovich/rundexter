module.exports = {
    machineName: process.env.DEXTER_HOST || 'rundexter.com'
    , hostIsHTTPS: process.env.DEXTER_HOST_HTTPS == 1
    //Note: we also check this against process in the main binary
    , isDev: process.env.DEXTER_DEV !== undefined
    , getUserHome: function() {
        return process.env.HOME || process.env.HOMEPATH || process.env.USERPROFILE;
    }
}
