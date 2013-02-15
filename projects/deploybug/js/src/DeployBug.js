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
    var description = DeployBug.packageRegistry.get(key);
    // var nodes = description.nodes;
    
    // nodes.forEach(function(node, index, array){
        // shell into node.hostname + ':' + node.port
        var commandString = 'npm install -g ' + description.packageURL;
        var logs = [];
        child_process.exec(commandString, function (error, stdout, stderr) {
            logs.push('stdout: ' + stdout);
            logs.push('stderr: ' + stderr);
            if (error !== null) {
              logs.push('exec error: ' + error);
            }
            callback(logs.join(", "));
        });
    // });
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
