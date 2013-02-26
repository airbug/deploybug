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


//-------------------------------------------------------------------------------
// Public Static Methods
//-------------------------------------------------------------------------------

/**
 * @param {{
 *  key: string,
 *  hostname: string,
 *  port: number,
 *  packageURL: string,
 *  packageType: string,
 *  startScript: string
 * }} descriptionJSON
 * @param {function(Error)} callback
 */
DeployBug.registerPackage = function(descriptionJSON, callback) {
    var key = descriptionJSON.key;
    try{
        if(!DeployBug.getPackageRegistryDescriptionByKey(key)) {
            PackageValidator.validatePackageDescription(descriptionJSON);
            DeployBug.setPackageRegistryDescription(descriptionJSON.key, descriptionJSON);
            callback();
        } else {
            throw new Error("Package is already registered.")
        }
    } catch(error){
        callback(error);
    }
};

/**
 *  @param {string} key,
 *  @param {{
 *  key: string,
 *  hostname: string,
 *  port: number,
 *  packageURL: string,
 *  packageType: string,
 *  startScript: string
 * }} descriptionJSON
 * @param {function(Error)} callback
 */
DeployBug.updatePackage = function(key, descriptionJSON, callback) {
    try{
        if(key === descriptionJSON.key){
            if(!DeployBug.getPackageRegistryDescriptionByKey(key)){
                throw new Error("Package key does not exist in the registry.");
            } else {
                PackageValidator.validatePackageDescription(descriptionJSON);
                DeployBug.setPackageRegistryDescription(descriptionJSON.key, descriptionJSON);
                callback();
            }
        } else {
            throw new Error("Package key does not match package description.");
        }
    } catch(error){
        callback(error);
    }
    
    //update only
};

/**
 *  @param {string} key
 *  @param {function(Error)} callback
 */
DeployBug.deployPackage = function(key, callback) {
    var commandString;
    var options = {};

    //TODO: perhaps all deployed packages should be contained within a .deploybug folder that should exist at the root of the deploybug package.
    var rootpath = __dirname + "/../../../..";
    var description = DeployBug.getPackageRegistryDescriptionByKey(key);

    //TODO: Could probably move this to validation during registration
    if ( /^node$/i.test(description.packageType) || /^npm$/i.test(packageType)) {

        //TODO: From a security perspective. We will want to install the packages using a specific unix user id. OR after the package is installed, we will want to change the owner of the package.
        commandString = 'npm install '
        options.cwd = path.resolve(rootpath + '/deploybug/');
        if (!BugFs.existsSync(options.cwd)){
            BugFs.createDirectorySync(options.cwd);
        }
        commandString += description.packageURL;
        PackageCommand.execute(key, commandString, options, callback);
        
    } else {
        callback(new TypeError("DeployBug currently only supports node packages"));
    }

    // registration retrieval
    // iterate through nodes
        // shell into node
        // download and install package
};

/**
 *  @param {string} key
 *  @param {function(Error)} callback
 */
DeployBug.startPackage = function(key, callback) {
    var description = DeployBug.getPackageRegistryDescriptionByKey(key);
    var startScript = description.startScript;

    //TODO: Place the rootpath in a common location where it can be accessed by all functions.
    var rootpath = __dirname + "/../../../..";
    var commandString = 'forever start ' + path.resolve(path.join(rootpath + '/deploybug/node_modules/', description.key, startScript));
    
    PackageCommand.execute(key, commandString, {}, callback);
};

/**
 *  @param {string} key
 *  @param {function(Error)} callback
 */
DeployBug.stopPackage = function(key, callback) {
    var description = DeployBug.getPackageRegistryDescriptionByKey(key);
    var startScript = description.startScript;
    var rootpath = __dirname + "/../../../..";
    var commandString = 'forever stop ' + path.resolve(path.join(rootpath + '/deploybug/node_modules/', description.key, startScript));
    
    PackageCommand.execute(key, commandString, {}, callback);
};

/**
 *  @param {string} key
 *  @param {function(Error)} callback
 */
DeployBug.restartPackage = function(key, callback) {
    var description = DeployBug.getPackageRegistryDescriptionByKey(key);
    var startScript = description.startScript;
    var rootpath = __dirname + "/../../../..";
    var commandString = 'forever restart ' + path.resolve(path.join(rootpath + '/deploybug/node_modules/', description.key, startScript));
    
    PackageCommand.execute(key, commandString, {}, callback);
};

/**
 *  @param {string} key
 *  @return {{
 *  key: string,
 *  hostname: string,
 *  port: number,
 *  packageURL: string,
 *  packageType: string,
 *  startScript: string
 *  }}
 */
DeployBug.getPackageRegistryDescriptionByKey = function(key){
    return PackageRegistry.get(key);
};

/**
 *  @param {string} key
 *  @param {{
 *  key: string,
 *  hostname: string,
 *  port: integer,
 *  packageURL: string,
 *  packageType: string,
 *  startScript: string
 *  }} descriptionJSON 
 */
DeployBug.setPackageRegistryDescription = function(key, descriptionJSON){
    PackageRegistry.put(key, descriptionJSON);
};

/**
 *  @param {string} key
 *  @return {Array}
 */
DeployBug.getPackageRegistryKeys = function(){
    return PackageRegistry.getKeyArray();
};


//-------------------------------------------------------------------------------
// Private Methods
//-------------------------------------------------------------------------------

var PackageRegistry = new Map();

var PackageCommand = {
    execute: function(key, commandString, options, callback){
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
    }
};

var PackageValidator = {
    /**
    *  @param {{
    *  key: string,
    *  hostname: string,
    *  port: integer,
    *  packageURL: string,
    *  packageType: string,
    *  startScript: string
    *  }} descriptionJSON
    */
    validatePackageDescription: function(descriptionJSON){
        var key = descriptionJSON.key;
        var packageURL = descriptionJSON.packageURL;
        var packageType = descriptionJSON.packageType;
        var requiredProperties = [  {name: "key", value: key},
                                    {name: "packageURL", value: packageURL}, 
                                    {name: "packageType", value: packageType}
        ];

        if(!TypeUtil.isString(key)){
            throw new TypeError("The key contained in the package description must be a string.");
        }

        if (!TypeUtil.isString(packageURL)){
            throw new TypeError("The packageURL contained in the package description must be a string")
        }

        if (!TypeUtil.isString(packageType)){
            throw new TypeError("The packageType contained in the package description must be a string")
        }

        requiredProperties.forEach(function(property){
            var name = property.name;
            var value = property.value;
            if(isEmptyString(value) || value == null){
                throw new Error("Invalid package description. " + name + " is required.");
            }
        });

        PackageValidator.validatePackageType(packageType);
        PackageValidator.validatePackageURL(packageURL);

        var isEmptyString = function isEmptyString(string){
          return /^\s*$/.test(string);
        };

        //TODO: Add url validation for packageURL
        //QUESTION: Should we validate the packageURL exists here?
        //TODO: validate the packageType is of a supported type
        //QUESTION: Any limitations on the supported characters or keywords of the "key"
    },
    
    validatePackageType: function(type){

    },
    
    validatePackageURL: function(url){
        
    }
    
};

//-------------------------------------------------------------------------------
// Exports
//-------------------------------------------------------------------------------

bugpack.export('deploybug.DeployBug', DeployBug);