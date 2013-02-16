//-------------------------------------------------------------------------------
// Requires
//-------------------------------------------------------------------------------

//@Package('deploybug')

//@Export('DeployBug')

//@Require('bugfs.BugFs')

//-------------------------------------------------------------------------------
// Common Modules
//-------------------------------------------------------------------------------

var bugpack = require('bugpack').context(module);
var child_process = require('child_process');

//-------------------------------------------------------------------------------
// BugPack
//-------------------------------------------------------------------------------

var BugFs =     bugpack.require('bugfs.BugFs');
var Map =       bugpack.require('Map');


//-------------------------------------------------------------------------------
// Simplify References
//-------------------------------------------------------------------------------


//-------------------------------------------------------------------------------
// Declare Class
//-------------------------------------------------------------------------------

var DeployBug = {};


//-------------------------------------------------------------------------------
// Private Static Variables
//-------------------------------------------------------------------------------

DeployBug.packageRegistry = new Map();
DeployBug.nodeRegistry = new Map();

//-------------------------------------------------------------------------------
// Public Static Methods
//-------------------------------------------------------------------------------

/**
 * @param {{
 *  hostname: string,
 *  port: integer,
 *  packageURL: string,
 *  deployScript: (string | Path),
 *  startScript: (string | Path),
 *  stopScript: (string | Path),
 *  restartScript: (string | Path)
 * }} description,
 * @param {function(Error)} callback
 *
 */
DeployBug.registerPackage = function(descriptionJSON, callback) {
    DeployBug.packageRegistry.put(descriptionJSON.key, descriptionJSON);
    callback();
};

DeployBug.deployPackage = function(key, callback) {
    var logs = [];
    var description = DeployBug.packageRegistry.get(key);

    var commandString = 'npm install -g ' + description.packageURL;
    child_process.exec(commandString, function (error, stdout, stderr) {
        console.log('stdout: ' + stdout);
        console.log('stderr: ' + stderr);
        logs.push('Hey, closure gives access to the variable logs. And, I needed to call the callback inside of this callback because it is asynchronous.')
        logs.push('stdout: ' + stdout);
        logs.push('stderr: ' + stderr);
        if (error !== null) {
            console.log('exec error: ' + error);
            logs.push('exec error: ' + error);
        }
        callback(logs);
    });

    
    // registration retrieval
    // iterate through nodes
        // shell into node
        // download and install package
};

DeployBug.startPackage = function(key, callback) {
    // registration retrieval
    // iterate through nodes
        // shell into node
        // run start script with forever
    
};

DeployBug.stopPackage = function(key, callback) {
    // registration retrieval
    // iterate through nodes
        // shell into node
        // stop process with forever
    
};

//-------------------------------------------------------------------------------
// Private Methods
//-------------------------------------------------------------------------------

DeployBug.getPackageRegistryDescriptionByKey = function(key){
        return DeployBug.packageRegistry.get(key);
    };
    
DeployBug.getPackageRegistryKeys = function(){
        return DeployBug.packageRegistry.getKeyArray();
    };


//-------------------------------------------------------------------------------
// Exports
//-------------------------------------------------------------------------------

bugpack.export('deploybug.DeployBug', DeployBug);
