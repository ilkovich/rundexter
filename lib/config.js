var fs   = require('fs')
  , utils = require('./utils')
;
module.exports = {
    getConfigFilename: function() {
        return utils.getUserHome() + '/.dexter';
    }
    , writeConfig: function(config, callback) {
        fs.writeFile(getConfigFilename(), JSON.stringify(config, null, 4), function(err) {
            if(err) callback(err);

            callback(null, config);
        });
    }
}
