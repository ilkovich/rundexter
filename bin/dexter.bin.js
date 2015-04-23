#!/usr/bin/env node

process.on('uncaughtException', function(err) {
  console.log('ERROR', err);
});

var path = require('path')
  , rest = require('restler')
  , fs   = require('fs')
  , prompt = require('prompt')
  , home = process.env.HOME
  , q    = require('q')
  , utils = require('../lib/utils')
  , title
;

/**
 *  Defaults
 */
prompt.message = prompt.delimiter = '';

switch(process.argv[2]) {
    case 'create':
        if( !(title = process.argv[3]) )
            helpCreate();        
        else
            create(title);
        break;
    case 'key':
        key();
        break;
    case 'run': 
        run();
        break;
    case 'login':
        login();
        break;
    case 'push':
        push();
        break;
    case 'repository':
        repository();
        break;
    default: 
        help();
        return;
}

function key() {
    q.all([
        q.nfcall(utils.getJsonFile, getConfigFilename()), 
    ]).then(function(results) {
        var config = results[0]
          , package= results[1]
        ;
        assertLoggedIn(config);

        utils.streamToString(function(key) {
            var baseUrl = config.baseUrl || 'https://rundexter.com/api/'
              , keyUrl = baseUrl + 'docker/key'
            ;

            rest.post(keyUrl,  {
                headers: {
                    'X-Authorization': config.token
                }
                , data: key
            }).on('complete', function(result, response) {
                if(result && result.success) {
                    console.log('SUCCESS');
                    console.log(result.data);
                } else if(result && result.error) {
                    console.error('ERROR', result.error);
                } else {
                    console.error('ERROR', response.statusCode);
                    if(response.statusCode == 404) {
                        console.log('requested url: ', keyUrl);
                    }
                }
            });
        });
    }, console.error);
}

function repository() {
    var repo = process.argv[3];

    utils.getJsonFile(getPackageFilename(), function(err, package) {
        if(!repo) {
            prompt.get({ properties: { repository: { message: 'Git Repo Url:' }}}, function(err, result) {
                if(err) return console.error(err);

                repo = result.repository;
                next();
            });
        } else {
            next();
        }

        function next() {
            if(!repo) 
                return console.error("ERROR", "Repository url required");

            package.repository = {
                type  : 'git'
                , url : repo
            };

            fs.writeFile(getPackageFilename(), JSON.stringify(package, null, 4), function(err) {
                if(err) console.error('ERROR', err);
            });
        }
    });
}

/**
 * Register a git module to dexter
 * 
 * @access public
 * @return void
 */
function push() {
    q.all([
        q.nfcall(utils.getJsonFile, getConfigFilename()), 
        q.nfcall(utils.getJsonFile, getPackageFilename()),
    ]).then(function(results) {
        var config = results[0]
          , package= results[1]
        ;

        assertLoggedIn(config);
        assertPublishable(package);

        var baseUrl = config.baseUrl || 'https://rundexter.com/api/'
          , pushUrl = baseUrl + 'Module/push'
          , url = package.repository.url
        ;

        var interval = setInterval(function() {
            process.stdout.write('.');
        }, 1000);

        rest.post(pushUrl,  {
            headers: {
                'X-Authorization': config.token
            }
            , data: {
                git_url: url 
                , name : package.name
            }
        }).on('complete', function(result, response) {
            clearInterval(interval);

            if(result && result.success) {
                  console.log('SUCCESS');
                  console.log(result.data);
            } else if(result && result.error) {
                console.error('ERROR', result.error);
            } else {
                console.error('ERROR', response.statusCode);
                if(response.statusCode == 404) {
                    console.log('requested url: ', pushUrl);
                }
            }
        });

    }, console.error).fail(function(err) {
        console.log('ERROR', err);
    });
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

    prompt.get({ properties: { password: { message: 'Password:', hidden: true }}}, function(err, result) {

        if(!(credentials.password = result.password))
            return helpLogin();

        utils.getJsonFile(getConfigFilename(), function(err, config) {
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



/**
 * Create a new module
 * 
 * @param title $title 
 * @access public
 * @return void
 */
function create(title) {
    var name   = utils.slugify(title)
      , mkdirp = require('mkdirp')
      , ncp    = require('ncp').ncp
      , dest  
    ;

    mkdirp(( dest = './'+name ), function(err) {
        if(err) return console.error(err);


        ncp(__dirname + '/../skel/.', dest, function(err) {
            if(err) return console.error(err);

            process.chdir(dest);

            q.all([
                //needs to be read as a string so that we can preserve comments
                q.nfcall(utils.getStringFile, getMetaFilename()),
                q.nfcall(utils.getJsonFile, getPackageFilename())
            ]).then(function(results) {
                var meta = results[0]
                , package = results[1]
                ;

                //needs to be treated as a string so that we can preserve comments
                meta = meta.replace("%MYTITLE%", title);
                package.name = name;
                q.all([
                    q.nfcall(fs.writeFile, getMetaFilename(), meta),
                    q.nfcall(fs.writeFile, getPackageFilename(), JSON.stringify(package, null, 4)),
                ]).then(function(results) {
                    console.log('DONE');
                }, console.error);
            }, console.error).fail(console.error);
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

    var Runner = function() {
        var step = sf.create(mod);
        step.run(fixture);

        step.deferred.promise.then(function(out) {
            console.log(JSON.stringify(out,null,4));
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
    console.log('dexter <create|run|push|repository|key>');
}

function helpCreate() {
    console.log('dexter create <moduleName>');
}

function helpLogin() {
    console.log('dexter login <email>');
}

function getConfigFilename() {
    return utils.getUserHome() + '/.dexter';
}

function getMetaFilename() {
    return './meta.json';
}

function getPackageFilename() {
    return './package.json';
}

function writeConfig(config, callback) {
    fs.writeFile(getConfigFilename(), JSON.stringify(config, null, 4), function(err) {
        if(err) callback(err);

        callback(null, config);
    });
}

function assertPublishable(package) {
    if(!package.repository)
        throw "package.json > repository attribute required";
    else if(package.repository.type != 'git')
        throw "package.json > repository.type must be git";
    else if(!package.repository.url)
        throw "package.json > repository.url required";
}

function assertLoggedIn(config) {
    if(!config.token) throw "You need to call dexter login <email> first";
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

