var fs   = require('fs')
  , utils = require('./utils')
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
    , writeConfig: function(config) {
        var callback = generateReporter();
        fs.writeFile(getConfigFilename(), JSON.stringify(config, null, 4), function(err) {
            if(err) callback(err);

            callback(null, config);
        });
    }
}
