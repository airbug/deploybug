//-------------------------------------------------------------------------------
// Requires
//-------------------------------------------------------------------------------

//@Package('deploybug')

//@Export('DeployBugClient')

//-------------------------------------------------------------------------------
// Common Modules
//-------------------------------------------------------------------------------

var bugpack = require('bugpack').context(module);
var io = require('socket.io-client');

//-------------------------------------------------------------------------------
// BugPack
//-------------------------------------------------------------------------------

//-------------------------------------------------------------------------------
// Declare Class
//-------------------------------------------------------------------------------

var DeployBugClient = {};
// var socket = require('socket.io-client')('http://localhost');
// socket.on('connect', function(){
//   socket.on('event', function(data){});
//   socket.on('disconnect', fucntion(){});
// });

//-------------------------------------------------------------------------------
// Public Methods
//-------------------------------------------------------------------------------

DeployBugClient.socket = null;

DeployBugClient.initialize = function(options, callback) {
  DeployBugClient.socket = io.connect(options.serverHostName + ':' + options.serverPort);
  DeployBugClient.socket.on('connecting', function(data){
      console.log('Connecting to DeployBugServer...');
      console.log(data); 
  });
  
  DeployBugClient.socket.on('message', function(data){
      console.log(data); 
  });
  
  DeployBugClient.socket.on('connect', function(data){
      console.log("Connected to DeployBugServer"); 
  });
  
  DeployBugClient.socket.on('disconnect', function(data){ 
      console.log('Disconnected from DeployBugServer');
      process.exit(1);
  });
};

/**
 * @param {{
 *  packageURL: string,
 *  packageType: string,
 *  startScript: (string | Path),
 * }} descriptionJSON,
 * @param {string} serverHostname
 * @param {number} serverPort
 */
DeployBugClient.registerPackage = function(options, callback) {
    var packagesSocket = DeployBugClient.socket;
    var key = options.key;
    var clientData = {
        key: key,
        descriptionJSON: options.descriptionJSON
    };

    //TODO: Validate key matches key inside descriptionJSON

    packagesSocket.emit('register', clientData);
    console.log('Waiting for response from DeployBugServer...');

    packagesSocket.on('registered-' + key, function(data){
        console.log(JSON.stringify(data));
        callback(null); // should I check for the existence of a callback?
    });

    packagesSocket.on('error-registering-' + key, function(data){
        var error = data.error;
        console.log(JSON.stringify(data));
        callback(error);
    });
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
DeployBugClient.updatePackage = function(options, callback){
    var packagesSocket = DeployBugClient.socket;
    var key = options.key;
    var clientData = {
        key: options.key,
        descriptionJSON: options.descriptionJSON
    };
    //TODO: Validate key matches key inside descriptionJSON

    packagesSocket.emit('update', clientData);

    packagesSocket.on('updated-' + key, function(data) {
        callback(null, data);
    });
    packagesSocket.on('error-updating-' + key, function(data) {
        var error = data.error;
        callback(error, data);
    });
};

/**
 * @param {string} key
 * @param {string} serverHostname
 * @param {number} serverPort
 */
DeployBugClient.deployPackage = function(options, callback) {
    var packagesSocket = DeployBugClient.socket;
    var key = options.key;
    var clientData = {
        key: options.key,
    };

    packagesSocket.emit('deploy', clientData);

    packagesSocket.on('deployed-' + key, function(data) {
        callback(null, data);
    });
    packagesSocket.on('error-deploying-' + key, function(data) {
        var error = data.error;
        callback(error, data);
    });
};

/**
 * @param {string} key
 * @param {string} serverHostname
 * @param {number} serverPort
 */
DeployBugClient.startPackage = function(key, serverHostname, serverPort, callback) {
    var packagesSocket = DeployBugClient.socket;
    var key = options.key;
    var clientData = {
        key: options.key,
    };

    packagesSocket.emit('start', clientData);

    packagesSocket.on('started-' + key, function(data) {
        callback(null, data);
    });
    packagesSocket.on('error-starting-' + key, function(data) {
        var error = data.error;
        callback(error, data);
    });
};

/**
 * @param {string} key,
 * @param {string} serverHostname,
 * @param {number} serverPort
 */
DeployBugClient.stopPackage = function(key, serverHostname, serverPort, callback) {
    var packagesSocket = DeployBugClient.socket;
    var key = options.key;
    var clientData = {
        key: options.key,
    };

    packagesSocket.emit('stop', clientData);

    packagesSocket.on('stopped-' + key, function(data) {
        callback(null, data);
    });
    packagesSocket.on('error-stopping-' + key, function(data) {
        var error = data.error;
        callback(error, data);
    });
};

/**
 * @param {string} key,
 * @param {string} serverHostname,
 * @param {number} serverPort
 */
DeployBugClient.restartPackage = function(options, callback) {
    var packagesSocket = DeployBugClient.socket;
    var key = options.key;
    var clientData = {
        key: options.key,
    };

    packagesSocket.emit('restart', clientData);

    packagesSocket.on('restarted-' + key, function(data) {
        callback(null, data);
    });
    packagesSocket.on('error-restarting-' + key, function(data) {
        var error = data.error;
        callback(error, data);
    });
};

//-------------------------------------------------------------------------------
// Exports
//-------------------------------------------------------------------------------

bugpack.export('deploybug.DeployBugClient', DeployBugClient);
