//-------------------------------------------------------------------------------
// Requires
//-------------------------------------------------------------------------------

//@Package('deploybug')

//@Export('DeployBugClient')

//-------------------------------------------------------------------------------
// Common Modules
//-------------------------------------------------------------------------------

var bugpack = require('bugpack').context(module);
var http = require('http');


//-------------------------------------------------------------------------------
// BugPack
//-------------------------------------------------------------------------------

//-------------------------------------------------------------------------------
// Declare Class
//-------------------------------------------------------------------------------

var DeployBugClient = {};


//-------------------------------------------------------------------------------
// Private Static Variables
//-------------------------------------------------------------------------------

DeployBugClient.serverName = null;
DeployBugClient.serverPort = null;

//-------------------------------------------------------------------------------
// Public Static Methods
//-------------------------------------------------------------------------------

/**
 * @param {{
 *  packageURL: string,
 *  packageType: string,
 *  startScript: (string | Path),
 * }} descriptionJSON,
 * @param {string} serverHostname
 * @param {number} serverPort
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
    
    HTTPRequest.send(options, data);
    
};

/**
 * @param {string} key
 * @param {{
 *  key: string,
 *  hostname: string,
 *  port: number,
 *  packageURL: string,
 *  packageType: string,
 *  startScript: (string | Path),
 * }} descriptionJSON
 * @param {string} serverHostname
 * @param {number} serverPort
 */
DeployBugClient.updatePackage = function(key, descriptionJSON, serverHostname, serverPort){
    var data = JSON.stringify(descriptionJSON);
    var options = {
      hostname: serverHostname,
      port: serverPort,
      path: '/deploybug/packages/' + key + '/update',
      method: 'PUT',
      headers: {'Accept': 'application/json', 'Content-Type': 'application/json'}
    };
    
    HTTPRequest.send(options, data);
};

/**
 * @param {string} key
 * @param {string} serverHostname
 * @param {number} serverPort
 */
DeployBugClient.deployPackage = function(key, serverHostname, serverPort) {
    var options = {
      hostname: serverHostname,
      port: serverPort,
      path: '/deploybug/packages/' + key + '/deploy',
      method: 'POST',
      headers: {}
    };
    
    HTTPRequest.send(options);
    
};

/**
 * @param {string} key
 * @param {string} serverHostname
 * @param {number} serverPort
 */
DeployBugClient.startPackage = function(key, serverHostname, serverPort) {
    var options = {
      hostname: serverHostname,
      port: serverPort,

        //TODO QUESTION: Does the "key" value need to be url encoded here?
      path: '/deploybug/packages/' + key + '/start',
      method: 'PUT',
      headers: {}
    };
    
    HTTPRequest.send(options);
};

/**
 * @param {string} key,
 * @param {string} serverHostname,
 * @param {number} serverPort
 */
DeployBugClient.stopPackage = function(key, serverHostname, serverPort) {
    var options = {
      hostname: serverHostname,
      port: serverPort,
      path: '/deploybug/packages/' + key + '/stop',
      method: 'PUT',
      headers: {}
    };
    
    HTTPRequest.send(options);
};

/**
 * @param {string} key,
 * @param {string} serverHostname,
 * @param {number} serverPort
 */
DeployBugClient.restartPackage = function(key, serverHostname, serverPort) {
    var options = {
      hostname: serverHostname,
      port: serverPort,
      path: '/deploybug/packages/' + key + '/restart',
      method: 'PUT',
      headers: {}
    };
    
    HTTPRequest.send(options);
};

//-------------------------------------------------------------------------------
// Private Methods
//-------------------------------------------------------------------------------


var HTTPRequest = {
    /**
     * @param {{
     *  hostname: string,
     *  port: number,
     *  path: string,
     *  method: string,
     *  headers: {},
     * }} options
     * @param {*} data
     */
    send: function(options, data){
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

        req.write(data, 'utf8');
        req.end();
    }
}; 

//-------------------------------------------------------------------------------
// Exports
//-------------------------------------------------------------------------------

bugpack.export('deploybug.DeployBugClient', DeployBugClient);
