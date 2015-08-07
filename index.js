#! /usr/bin/env node

// Usage: node make_onsave.js b2g tv browser
//        node make_onsave.js nightly phone settings
//        node make_onsave.js simulator tv tv-deck
//        node make_onsave.js b2g tv

var fs = require('fs');
var path = require('path');
// var exec = require('child_process').exec;
var chokidar = require('chokidar');

var Make = require('./lib/make');
var Runtime = require('./lib/runtime');

var runtimeTypes = ['firefox', 'developer', 'b2g', 'mulet', 'nightly', 'simulator'];
var deviceTypes = ['phone', 'tv'];

var appsPath = path.join(process.cwd(), 'apps');
var apps = fs.existsSync(appsPath) ?
  fs.readdirSync(appsPath).filter(function(file) {
    return fs.statSync(path.join(appsPath, file)).isDirectory();
  }) : [];

var tvAppsPath = path.join(process.cwd(), 'tv_apps');
var tvApps = fs.existsSync(tvAppsPath) ?
  fs.readdirSync(tvAppsPath).filter(function(file) {
    return fs.statSync(path.join(tvAppsPath, file)).isDirectory();
  }) : [];

// Default runtime and device type
var runtimeType = 'b2g';
var deviceType = 'phone';
var app = '';

process.argv.forEach(function(val, index, array) {
  if (runtimeTypes.indexOf(val) > -1) {
    runtimeType = val;
  } else if (deviceTypes.indexOf(val) > -1) {
    deviceType = val;
  } else if ((apps && apps.indexOf(val) > -1) ||
             (tvApps && tvApps.indexOf(val) > -1)) {
    app = val;
  }
});

var makeGaia = new Make(deviceType);
var makeApp = new Make(deviceType, app);
var runtime = new Runtime(runtimeType, deviceType);

function watch () {
  console.log('watch');

  function onfilechange (path) {
    console.log('File', path, 'has been changed');
    if (!app) {
      make.run(reload);
    } else {
      makeApp.run(reload);
    }
  }

  var watcher = chokidar.watch(['apps', 'tv_apps', 'shared'], {
    ignored: /build_stage/,
    persistent: true,
    cwd: process.cwd()
  });
  // watcher.add('tv_apps');
  // watcher.add('shared');
  watcher.on('change', onfilechange);
}

function reload() {
  runtime.reopen();
}

makeGaia.run(function () {
  runtime.start();
  watch();
});
