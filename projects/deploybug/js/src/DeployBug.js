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
var TypeUtil =  bugpack.require('TypeUtil');


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

var packageRegistry = new Map();
var nodeRegistry = new Map();

//-------------------------------------------------------------------------------
// Public Static Methods
//-------------------------------------------------------------------------------

/**
 * @param {{
 *  hostname: string,
 *  port: integer,
 *  packageURL: string,
 *  packageType: string,
 *  deployScript: (string | Path),
 *  startScript: (string | Path),
 *  stopScript: (string | Path),
 *  restartScript: (string | Path)
 * }} description,
 * @param {function(Error)} callback
 *
 */
DeployBug.registerPackage = function(descriptionJSON, callback) {
    try{
        isValidPackageDescription(descriptionJSON);
        packageRegistry.put(descriptionJSON.key, descriptionJSON);
        callback();
    } catch(error){
        callback(error);
    }
};

DeployBug.deployPackage = function(key, callback) {
    var logs = [];
    var description = packageRegistry.get(key);
    var packageType = description.packageType;
    var commandString;
    
    if ( /^node$/i.test(packageType) || /^npm$/i.test(packageType)){
        commandString = 'npm install -g ' + description.packageURL;  // TODO: extract -g flag as an option
    } else {
        commandString = 'forever start ' + description.deployScript;
    }
    
    child_process.exec(commandString, function (error, stdout, stderr) {
        console.log('stdout: ' + stdout);
        console.log('stderr: ' + stderr);
        logs.push('stdout: ' + stdout);
        logs.push('stderr: ' + stderr);
        if (error !== null) {
            console.log('exec error: ' + error);
            logs.push('exec error: ' + error);
            callback(error, logs.join("\n"));
        } else {
            callback(null, logs.join("\n"));
        }
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

DeployBug.getPackageRegistryDescriptionByKey = function(key){
        return packageRegistry.get(key);
};
    
DeployBug.getPackageRegistryKeys = function(){
        return packageRegistry.getKeyArray();
};

//-------------------------------------------------------------------------------
// Private Methods
//-------------------------------------------------------------------------------

var isValidPackageDescription = function isValidPackageDescription(descriptionJSON){
    var key = descriptionJSON.key;
    var packageURL = descriptionJSON.packageURL;
    var packageType = descriptionJSON.packageType;
    var requiredProperties = [  {name: "key", value: key},
                                {name: "packageURL", value: packageURL}, 
                                {name: "packageType", value: packageType}
    ];
    
    requiredProperties.forEach(function(property){
        var name = property.name;
        var value = property.value;
        if(isEmptyString(value) || value == null){
            throw new Error("Invalid package description. " + name + " is required.");
        }
    });
    
    if(!TypeUtil.isString(key)){
        throw new TypeError("The key contained in the package description must be a string.");
    }
    
    if (!TypeUtil.isString(packageURL)){
        throw new TypeEror("The packageURL contained in the package description must be a string")
    }
    
    if (!TypeUtil.isString(packageType)){
        throw new TypeEror("The packageType contained in the package description must be a string")
    }
};

var isEmptyString = function isEmptyString(string){
  return /^\s*$/.test(string);
};


//-------------------------------------------------------------------------------
// Exports
//-------------------------------------------------------------------------------

bugpack.export('deploybug.DeployBug', DeployBug);
