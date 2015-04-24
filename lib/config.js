var fs   = require('fs')
    , utils = require('./utils')
    , baseUrl = null
    ;
function generateReporter(printData) {
    return function(err, data) {
        if(err) return console.error('ERROR', err);

        if(printData) 
            return console.log('SUCCESS', data);
        else
            return console.log('SUCCESS');
    };
}
module.exports = {
    getConfigFilename: function() {
        return utils.getUserHome() + '/.dexter';
    }
    , getConfig: function(callback) {
        utils.getJsonFile(this.getConfigFilename(), callback);
    }
    , setBaseUrl: function(url) {
        if(url) baseUrl = url;
    }
    //We pass the config just to make sure it's loaded, rather than
    //  worrying about promises/callback
    , getBaseUrl: function(config) {
        return baseUrl || config.baseUrl || 'https://rundexter.com/api/';
    }
    , writeConfig: function(config) {
        var callback = function() {}; //generateReporter();
        fs.writeFile(this.getConfigFilename(), JSON.stringify(config, null, 4), function(err) {
            if(err) callback(err);
            callback(null, config);
        });
    }, getAuthorizedRequestHeaders: function(config, headers) {
        headers = headers || {};
        headers['X-Authorization'] = config.token;
        return headers;
    }
}
