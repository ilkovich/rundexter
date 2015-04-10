#!/usr/bin/env node

var path = require('path')
  , rest = require('restler')
  , fs   = require('fs')
  , prompt = require('prompt')
  , home = process.env.HOME
  , title
;

switch(process.argv[2]) {
    case 'create':
        if( !(title = process.argv[3]) )
            helpCreate();        
        else
            create(title);
        break;
    case 'run': 
        run();
        break;
    case 'login':
        login();
        break;
    default: 
        help();
        return;
}

/**
 * Log the user in and update/create global config
 * 
 * @access public
 * @return void
 */
function login() {
    var user    = process.argv[3]
      , baseUrl = process.argv[4]
      , credentials = {
           email: user
      }
      , loginUrl
    ;

    if(!user) 
        return helpLogin();

    prompt.message = prompt.delimiter = '';
    prompt.get({ properties: { password: { message: 'Password:', hidden: true }}}, function(err, result) {

        if(!(credentials.password = result.password))
            return helpLogin();

        getConfig(function(config) {
            baseUrl  = baseUrl || config.baseUrl || 'https://rundexter.com/api/';
            loginUrl = baseUrl + 'auth/login';

            rest.post(loginUrl,  {
                data: credentials
            }).on('complete', function(result, response) {
                if(result && result.success) {
                    config.token   = result.data.token;
                    config.baseUrl = baseUrl;
                    writeConfig(config, generateReporter());
                } else if(result && result.error) {
                    console.error(result.error);
                } else {
                    console.error(response.statusCode, result);
                }
            });
        });
    });
}

//Courtesy of http://stackoverflow.com/a/105074
function guid() {
    function s4() {
        return Math.floor((1 + Math.random()) * 0x10000)
            .toString(16)
            .substring(1);
    }
    return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
        s4() + '-' + s4() + s4() + s4();
}

function slugify(text) {
  return text.toString().toLowerCase()
    .replace(/\s+/g, '-')           // Replace spaces with -
    .replace(/[^\w\-]+/g, '')       // Remove all non-word chars
    .replace(/\-\-+/g, '-')         // Replace multiple - with single -
    .replace(/^-+/, '')             // Trim - from start of text
    .replace(/-+$/, '');            // Trim - from end of text
}


/**
 * Create a new module
 * 
 * @param title $title 
 * @access public
 * @return void
 */
function create(title) {
    var name   = slugify(title)
      , mkdirp = require('mkdirp')
      , ncp    = require('ncp').ncp
      , dest  
    ;

    mkdirp(( dest = './'+name ), function(err) {
        if(err) return console.error(err);

        ncp(__dirname + '/../skel/.', dest, function(err) {
            if(err) return console.error(err);

            console.log('done');
        });
    });
}

/**
 * Run a fixture against the current module. 
 * 
 * @access public
 * @return void
 */
function run() {
    var sf      = require('../StepFactory')
      , mod     = require(process.cwd())
      , fixtureName = process.argv[3] || 'default'
      , fixture  = require(process.cwd()+'/fixtures/'+fixtureName+'.js')
    ;
    fixture.internals = {
        workflow: {
            id: guid(),
        },
        instance: {
            id: guid(),
            isTest: true
        },
        step: {
            id: guid(),
        }
    };

    var Runner = function() {
        var step = sf.create(mod);
        step.run(fixture);

        step.deferred.promise.then(function(out) {
            console.log('success', out);
        }, function(err) {
            console.error('fail', err);
        });
    };
    new Runner();
}

/*
 * HELPERS
 */

function help() {
    console.log('dexter <create|run>');
}

function helpCreate() {
    console.log('dexter create <moduleName>');
}

function helpLogin() {
    console.log('dexter login <username>');
}

function slugify(text) {
  return text.toString().toLowerCase()
    .replace(/\s+/g, '-')           // Replace spaces with -
    .replace(/[^\w\-]+/g, '')       // Remove all non-word chars
    .replace(/\-\-+/g, '-')         // Replace multiple - with single -
    .replace(/^-+/, '')             // Trim - from start of text
    .replace(/-+$/, '');            // Trim - from end of text
}

function getUserHome() {
  return process.env.HOME || process.env.HOMEPATH || process.env.USERPROFILE;
}

function getConfig(callback) {
    var file = getConfigFilename()
      , config
    ;

    fs.readFile(file, 'utf8', function(err, configData) {
        if(err) config = {};
        else {
            try {
                config = JSON.parse(configData);
            } catch(e) {
                config = {};
            }
        }

        callback(config);
    });
}

function getConfigFilename() {
    return getUserHome() + '/.dexter';
}

function writeConfig(config, callback) {
    fs.writeFile(getConfigFilename(), JSON.stringify(config, null, 4), function(err) {
        if(err) callback(err);

        callback(null, config);
    });
}

function generateReporter(printData) {
    return function(err, data) {
        if(err) return console.error('ERROR', err);

        if(printData) 
            return console.log('SUCCESS', data);
        else
            return console.log('SUCCESS');
    };
}
