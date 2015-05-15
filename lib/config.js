module.exports = {
    getHttpUrl: function(machine) {
        var protocol = (this[machine].isHTTPS) ? 'https://' : 'http://'
            , port = (this[machine].port === 80) ? '' : ':' + this[machine].port
            ;
        return protocol + this.api.machineName + port;
    }
    , api: {
        machineName: process.env.DEXTER_API_HOST || 'rundexter.com'
        , isHTTPS: parseInt(process.env.DEXTER_API_HTTPS, 10) !== 0
        , port: process.env.DEXTER_API_PORT || 80
    }
    , git: {
        machineName: process.env.DEXTER_GIT_HOST || 'rundexter.com'
        , isHTTPS: parseInt(process.env.DEXTER_GIT_HTTPS, 10) !== 0
        , port: process.env.DEXTER_GIT_PORT || 22
    }
    //Note: we also check this against process.env directly in the main binary
    , isDev: process.env.DEXTER_DEV !== undefined
    , getUserHome: function() {
        return process.env.HOME || process.env.HOMEPATH || process.env.USERPROFILE;
    }
};
