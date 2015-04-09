#!/usr/bin/env node

var path = require('path')
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
    default: 
        help();
        return;
}

function help() {
    console.log('dexter <create|run>');
}

function helpCreate() {
    console.log('dexter create <moduleName>');
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
