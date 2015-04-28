module.exports = ,
    //We pass the config just to make sure it's loaded, rather than
    //  worrying about promises/callback
    getUrl: function(stem) {
        var protocol = (this.hostIsHTTPS) ? 'https://' : 'http://';
        stem = stem || '';
        return url.resolve(protocol + this.machineName, '/api/', stem);
    }
    , signRequest: function(request) {
        if(!request.headers) request.headers = [];
        request.headers['X-Authorization'] = netrctools.getPassword();
        return request;
    },
    restResponse: function(result, response, success) {
        if(result && result.success) {
            success();
        } else if(process.env.DEXTER_DEV) {
            if(response && response.statusCode && response.statusCode) {
                console.error(response.statusCode);
                if(response.statusCode != 404) {
                    console.log(result);
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
