var url = require('url')
    , path = require('path')
    , fs = require('fs')
    , configtools = require('./config')
    , netrctools = require('./netrc')
    ;
module.exports = {
    //We pass the config just to make sure it's loaded, rather than
    //  worrying about promises/callback
    getUrl: function(stem) {
        var protocol = (this.hostIsHTTPS) ? 'https://' : 'http://';
        stem = stem || '';
        if(stem[0] == '/') stem = stem.substr(1);
        return url.resolve(protocol + configtools.machineName + '/api/', stem);
    }
    , signRequest: function(request) {
        if(!request.headers) request.headers = [];
        request.headers['X-Authorization'] = netrctools.getPassword();
        request.headers['Accept'] = 'application/json';
        return request;
    }
    , wrapResponse: function(result, response, success) {
        var errFileName, errFile;
        if(result && result.success) {
            success();
        } else if(configtools.isDev) {
            if(response && response.statusCode && response.statusCode) {
                if(response.statusCode == 404) {
                    console.log('Endpoint not found');
                } else {
                    console.log(response.statusCode, 'Unknown error');
                    if(configtools.isDev) {
                        errFileName = path.join(configtools.getUserHome(), '.dexter-last-error');
                        console.log('Writing output to', errFileName)
                        fs.writeFileSync(errFileName, result);
                    }
                }
            } else {
                console.error(response);
            }
        } else {
            if(result && result.error) {
                console.error(result.error);
            } else if(response && response.statusCode) {
                console.error(response.statusCode, result);
            } else {
                console.log(result.code);
            }
        }
    }
}
