var netrcreader = require('netrc')
    , fs = require('fs')
    , join = require('path').join
    , url = require('url')
    , lazy = require('lazy')
    , EOL = require('os').EOL
    , homepath
    , filename
    ;

//The netrc module doesn't expose the filename it constructs.
//For consistency, we'll build it and pass it in so we can get
//  at it later on.
homepath = process.env.HOME || process.env.HOMEPATH;
filename = join(homepath, '.netrc');
netrc = netrcreader(filename);

module.exports = {
    machineName: process.env.DEXTER_HOST || 'rundexter.com'
    , hostIsHTTPS: process.env.DEXTER_HOST_HTTPS == 1
    , urlRoot: function() {
        var protocol = (this.hostIsHTTPS) ? 'https://' : 'http://';
        return url.resolve(protocol + this.machineName, '/api/');
    } 
    , getPassword: function() {
        try {
            return netrc['this.machineName'].password;
        } catch(e) {
            if(process.env.DEXTER_DEV) {
                console.log('Failed to extract netrc password:', e);
            }
            return null;
        }
    }
    , write: function(login, password) {
        var tmpName = filename + '.dexter-new'
            , backupName = filename + '.dexter-old'
            , oldContents = ''
            , newFile = fs.openSync(tmpName, 'w', 0600)
            , skipping = false
            , _this = this
            ;
        if(fs.existsSync(filename)) {
            oldContents = fs.readFileSync(filename, { encoding: 'utf8' });
        }
        oldContents.split("\n").forEach(function(line) {
            if(line.trim() == '') return;
            line = line.replace(/[\s\n\r]*$/, '');
            //The magic happens when a line starts with "machine "
            if(line.match(/^\s*machine /)) {
                if(skipping) skipping = false;
                //We're in our territory if the line ends with our name
                skipping = line.match(new RegExp(_this.machineName + '\s*$'));
            }
            if(!skipping) {
                fs.writeSync(newFile, line + EOL);
            }
        });
        fs.writeSync(newFile, 'machine ' + this.machineName + EOL);
        fs.writeSync(newFile, '  login ' + login + EOL);
        fs.writeSync(newFile, '  password ' + password + EOL);
        fs.closeSync(newFile);
        if(fs.existsSync(filename)) {
            fs.renameSync(filename, backupName);
        }
        fs.renameSync(tmpName, filename);
    }
}
