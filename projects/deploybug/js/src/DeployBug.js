//-------------------------------------------------------------------------------
// Requires
//-------------------------------------------------------------------------------

//@Package('deploybug')

//@Export('DeployBug')

//@Require('bugfs.BugFs')

//-------------------------------------------------------------------------------
// Common Modules
//-------------------------------------------------------------------------------

var bugpack         = require('bugpack').context(module);
var child_process   = require('child_process');
var path            = require('path');

//Dependencies: npm, forever

//-------------------------------------------------------------------------------
// BugPack
//-------------------------------------------------------------------------------

var BugFs       = bugpack.require('bugfs.BugFs');
var Map         = bugpack.require('Map');
var TypeUtil    = bugpack.require('TypeUtil');


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
 *  startScript: (string | Path),
 * }} descriptionJSON,
 * @param {function(Error)} callback
 *
 */
DeployBug.registerPackage = function(descriptionJSON, callback) {
    var key = descriptionJSON.key;
    try{
        if(!DeployBug.getPackageRegistryDescriptionByKey(key)) {
            isValidPackageDescription(descriptionJSON);
            packageRegistry.put(descriptionJSON.key, descriptionJSON);
            callback();
        } else {
            throw new Error("Package is already registered.")
        }
    } catch(error){
        callback(error);
    }
};

DeployBug.updatePackage = function(key, descriptionJSON, callback) {
    try{
        if(key === descriptionJSON.key){
            isValidPackageDescription(descriptionJSON);
            packageRegistry.put(descriptionJSON.key, descriptionJSON);
            callback(); 
        } else {
            throw new Error("Package key does not match package description.")
        }
    } catch(error){
        callback(error);
    }
    
    //update or create
};

DeployBug.deployPackage = function(key, callback) {
    var commandString;
    var options = {};
    var rootpath = __dirname + "/../../../..";
    var description = packageRegistry.get(key);
    
    if ( /^node$/i.test(description.packageType) || /^npm$/i.test(packageType)){
        commandString = 'npm install ' 
        options.cwd = path.resolve(rootpath + '/deploybug/');
        if(!BugFs.existsSync(options.cwd)){
            BugFs.createDirectorySync(options.cwd);
        }
        commandString += description.packageURL;
        executePackageCommand(key, commandString, options, callback);
        
    } else {
        callback(new TypeError("DeployBug currently only supports node packages"))
    }

    // registration retrieval
    // iterate through nodes
        // shell into node
        // download and install package
};

DeployBug.startPackage = function(key, callback) {
    var description = packageRegistry.get(key);
    var startScript = description.startScript;
    var rootpath = __dirname + "/../../../..";
    var commandString = 'forever start ' + path.resolve(path.join(rootpath + '/deploybug/node_modules/', description.key, startScript));
    
    executePackageCommand(key, commandString, {}, callback);
};

DeployBug.stopPackage = function(key, callback) {
    var description = packageRegistry.get(key);
    var startScript = description.startScript;
    var rootpath = __dirname + "/../../../..";
    var commandString = 'forever stop ' + path.resolve(path.join(rootpath + '/deploybug/node_modules/', description.key, startScript));
    
    executePackageCommand(key, commandString, {}, callback);
};

DeployBug.restartPackage = function(key, callback) {
    var description = packageRegistry.get(key);
    var startScript = description.startScript;
    var rootpath = __dirname + "/../../../..";
    var commandString = 'forever restart ' + path.resolve(path.join(rootpath + '/deploybug/node_modules/', description.key, startScript));
    
    executePackageCommand(key, commandString, {}, callback);
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


var executePackageCommand = function executePackageCommand(key, commandString, options, callback){
    var logs = [];
    
    child_process.exec(commandString, options, function (error, stdout, stderr) {
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
};

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
        throw new TypeError("The packageURL contained in the package description must be a string")
    }
    
    if (!TypeUtil.isString(packageType)){
        throw new TypeError("The packageType contained in the package description must be a string")
    }
};

var isEmptyString = function isEmptyString(string){
  return /^\s*$/.test(string);
};


//-------------------------------------------------------------------------------
// Exports
//-------------------------------------------------------------------------------

bugpack.export('deploybug.DeployBug', DeployBug);