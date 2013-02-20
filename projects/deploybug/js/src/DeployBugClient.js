//-------------------------------------------------------------------------------
// Requires
//-------------------------------------------------------------------------------

//@Package('deploybug')

//@Export('DeployBugClient')

//@Require('bugfs.BugFs')

//-------------------------------------------------------------------------------
// Common Modules
//-------------------------------------------------------------------------------

var bugpack = require('bugpack').context(module);
var http = require('http');


//-------------------------------------------------------------------------------
// BugPack
//-------------------------------------------------------------------------------

var BugFs =     bugpack.require('bugfs.BugFs');

//-------------------------------------------------------------------------------
// Declare Class
//-------------------------------------------------------------------------------

var DeployBugClient = {};


//-------------------------------------------------------------------------------
// Private Static Variables
//-------------------------------------------------------------------------------

DeployBugClient.server = null;

//-------------------------------------------------------------------------------
// Public Static Methods
//-------------------------------------------------------------------------------

/**
 * @param {{
 *  packageURL: string,
 *  packageType: string,
 *  deployScript: (string | Path),
 *  startScript: (string | Path),
 *  stopScript: (string | Path),
 *  restartScript: (string | Path)
 * }} descriptionJSON,
 * @param {string} serverHostname
 * @param {number} serverPort
 *
 */
DeployBugClient.registerPackage = function(descriptionJSON, serverHostname, serverPort) {
    var data = JSON.stringify(descriptionJSON);
    var options = {
      hostname: serverHostname,
      port: serverPort,
      path: '/deploybug/packages/register',
      method: 'POST',
      headers: {'Accept': 'application/json', 'Content-Type': 'application/json'}
    };
    var req = http.request(options, function(res){  // DRY up this req object
        console.log('Response from DeployBugServer:');
        console.log('STATUS: ' + res.statusCode);
        console.log('HEADERS: ' + JSON.stringify(res.headers));
    }).on('error', function(error) {
        console.log('problem with request: ' + error.message);
    }).on('response', function(res) {
        res.setEncoding('utf8');
        res.on('data', function (chunk) {
            console.log('BODY: ' + chunk);
        });
    });
        
    req.write(data, 'utf8');
    req.end();
    
};

DeployBugClient.updatePackage = function(key, descriptionJSON, serverHostname, serverPort){
    var data = JSON.stringify(descriptionJSON);
    var options = {
      hostname: serverHostname,
      port: serverPort,
      path: '/deploybug/packages/' + key + '/update',
      method: 'POST',
      headers: {'Accept': 'application/json', 'Content-Type': 'application/json'}
    };
    var req = http.request(options, function(res){  // DRY up this req object
        console.log('Response from DeployBugServer:');
        console.log('STATUS: ' + res.statusCode);
        console.log('HEADERS: ' + JSON.stringify(res.headers));
    }).on('error', function(error) {
        console.log('problem with request: ' + error.message);
    }).on('response', function(res) {
        res.setEncoding('utf8');
        res.on('data', function (chunk) {
            console.log('BODY: ' + chunk);
        });
    });
        
    req.write(data, 'utf8');
    req.end();
};

DeployBugClient.deployPackage = function(key, serverHostname, serverPort) {
    var options = {
      hostname: serverHostname,
      port: serverPort,
      path: '/deploybug/packages/' + key + '/deploy',
      method: 'POST',
      headers: {}
    };
    var req = http.request(options, function(res){   // DRY up this req object
        console.log('Response from DeployBugServer:');
        console.log('STATUS: ' + res.statusCode);
        console.log('HEADERS: ' + JSON.stringify(res.headers));
    }).on('response', function(res) {
        res.setEncoding('utf8');
        res.on('data', function (chunk) {
            console.log('BODY: ' + chunk);
        });
    }).on('error', function(error) {
        console.log('problem with request: ' + error.message);
    });

    req.end();
    
};

DeployBugClient.startPackage = function(key, serverHostname, serverPort) {
    var options = {
      hostname: serverHostname,
      port: serverPort,
      path: '/deploybug/packages/' + key + '/start',
      method: 'POST',
      headers: {}
    };
    var req = http.request(options, function(res){
        console.log('Response from DeployBugServer:');
        console.log('STATUS: ' + res.statusCode);
        console.log('HEADERS: ' + JSON.stringify(res.headers));
    }).on('response', function(res) {
        res.setEncoding('utf8');
        res.on('data', function (chunk) {
            console.log('BODY: ' + chunk);
        });
    }).on('error', function(error) {
        console.log('problem with request: ' + error.message);
    });

    req.end();
};

DeployBugClient.stopPackage = function(key, serverHostname, serverPort) {
    var options = {
      hostname: serverHostname,
      port: serverPort,
      path: '/deploybug/packages/' + key + '/stop',
      method: 'POST',
      headers: {}
    };
    var req = http.request(options, function(res){
        console.log('Response from DeployBugServer:');
        console.log('STATUS: ' + res.statusCode);
        console.log('HEADERS: ' + JSON.stringify(res.headers));
    }).on('response', function(res) {
        res.setEncoding('utf8');
        res.on('data', function (chunk) {
            console.log('BODY: ' + chunk);
        });
    }).on('error', function(error) {
        console.log('problem with request: ' + error.message);
    });

    req.end();
};


//-------------------------------------------------------------------------------
// Private Methods
//-------------------------------------------------------------------------------



//-------------------------------------------------------------------------------
// Exports
//-------------------------------------------------------------------------------

bugpack.export('deploybug.DeployBugClient', DeployBugClient);
