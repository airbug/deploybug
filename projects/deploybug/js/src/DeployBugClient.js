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
 *  hostname: string,
 *  port: integer,
 *  deployScript: (string | Path),
 *  startScript: (string | Path),
 *  stopScript: (string | Path),
 *  restartScript: (string | Path)
 * }} description,
 * @param {function(Error)} callback
 *
 */
DeployBugClient.registerPackage = function(descriptionJSON, serverHostname, serverPort, callback) {
    var error;
    var data = JSON.stringify(descriptionJSON);
    var options = {
      hostname: serverHostname,
      port: serverPort,
      path: '/deploybug/packages/register',
      method: 'POST',
      headers: {'Accept': 'application/json', 'Content-Type': 'application/json'}
    };
    var req = http.request(options, function(res){  // DRY up this req object
        console.log('STATUS: ' + res.statusCode);
        console.log('HEADERS: ' + JSON.stringify(res.headers));
    }).on('error', function(e) {
        console.log('problem with request: ' + e.message);
        error = e;
    }).on('response', function(res) {
        res.setEncoding('utf8');
        res.on('data', function (chunk) {
            console.log('DATA: ' + chunk);
        });
    });
        
    req.write(data, 'utf8');
    req.end();
    
    callback(error);
};

// DeployBugClient.updatePackage = function(key, serverHostname, serverPort, callback){
//     
// };

DeployBugClient.deployPackage = function(key, serverHostname, serverPort, callback) {
    var error;
    var options = {
      hostname: serverHostname,
      port: serverPort,
      path: '/deploybug/packages/' + key + '/deploy',
      method: 'POST',
      headers: {}
    };
    var req = http.request(options, function(res){   // DRY up this req object
        console.log('STATUS: ' + res.statusCode);
        console.log('HEADERS: ' + JSON.stringify(res.headers));
    }).on('response', function(res) {
        res.setEncoding('utf8');
        res.on('data', function (chunk) {
            console.log('DATA: ' + chunk);
        });
    }).on('error', function(e) {
        console.log('problem with request: ' + e.message);
        error = e;
    });

    req.end();
    
    callback(error);
};

// DeployBugClient.startPackage = function(key, callback) {
//     
// };
// 
// DeployBugClient.stopPackage = function(key, callback) {
//     
// };


//-------------------------------------------------------------------------------
// Private Methods
//-------------------------------------------------------------------------------



//-------------------------------------------------------------------------------
// Exports
//-------------------------------------------------------------------------------

bugpack.export('deploybug.DeployBugClient', DeployBugClient);
