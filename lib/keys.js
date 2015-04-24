var path = require('path')
    , fs = require('fs')
    , utils = require('./utils')
    ;
module.exports = {
    getDefaultKey: function() {
        var sshPath = path.join(utils.getUserHome(), '.ssh')
            , rsaPath = path.join(sshPath, 'id_rsa.pub')
            , dsaPath = path.join(sshPath, 'id_dsa.pub')
            , hasRSA = fs.existsSync(rsaPath)
            , hasDSA = fs.existsSync(dsaPath)
            ;
        if(hasRSA) {
            return fs.readFileSync(rsaPath);
        } else if(hasDSA) {
            return fs.readFileSync(dsaPath);
        } else {
            return null;
        }
    },
    getKey: function(path) {
        return fs.readFileSync(path);
    }
}
