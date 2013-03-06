//-------------------------------------------------------------------------------
// Requires
//-------------------------------------------------------------------------------

//@Package('deploybugserver')

//@Export('DeployBug')

//@Require('bugfs.BugFs')
//@Require('Map')
//@Require('deploybugserver.Validator')
//@Require('deploybugserver.PackageCommand')

//-------------------------------------------------------------------------------
// Common Modules
//-------------------------------------------------------------------------------

var bugpack         = require('bugpack').context(module);
var path            = require('path');

//-------------------------------------------------------------------------------
// BugPack
//-------------------------------------------------------------------------------

var BugFs           = bugpack.require('bugfs.BugFs');
var Map             = bugpack.require('Map');
var PackageCommand  = bugpack.require('deploybugserver.PackageCommand');
var Validator       = bugpack.require('deploybugserver.Validator');

//-------------------------------------------------------------------------------
// Declare Class
//-------------------------------------------------------------------------------

var DeployBug = {

    //-------------------------------------------------------------------------------
    // Private Variables
    //-------------------------------------------------------------------------------

    /**
     * @private
     * @type {boolean}
     */
    initialized: false,

    /**
     * @private
     * @type {Map}
     */
    packageRegistry: new Map(), //TODO: Make this persist in a database. postgresql? sqlite? mongodb?

    //-------------------------------------------------------------------------------
    // Public Static Methods
    //-------------------------------------------------------------------------------

    /**
     * @param {function(error)} callback
     */
    initialize: function(callback){
        if(!DeployBug.initialized) {
            try {
                var installationDirectory = path.resolve(__dirname + '/../.deploybug/node_modules/');
                if(!BugFs.existsSync(installationDirectory)){
                    BugFs.createDirectorySync(installationDirectory, true);
                }
                DeployBug.initialized = true;
                callback();
            } catch(error){
                callback(error);
            }
        }
    },

    /**
     * @param {{
     *  key: string,
     *  packageURL: string,
     *  packageType: string,
     *  startScript: string
     * }} descriptionJSON
     * @param {function(Error)} callback
     */
    registerPackage: function(key, descriptionJSON, callback) {
        try{
            if(key !== descriptionJSON.key){
                throw new Error("Package key does not match package description.");
            }

            if(DeployBug.getPackageRegistryDescriptionByKey(key)) {
                throw new Error("Package is already registered. Please use 'update' to update registered packages.")
            } else {
                Validator.validatePackageDescription(descriptionJSON);
                DeployBug.setPackageRegistryDescription(key, descriptionJSON);
                callback();
            }
        } catch(error){
            callback(error);
        }
    },

    /**
     *  @param {string} key,
     *  @param {{
     *  key: string,
     *  packageURL: string,
     *  packageType: string,
     *  startScript: string
     * }} descriptionJSON
     * @param {function(Error)} callback
     */
    updatePackage: function(key, descriptionJSON, callback) {
        try{
            if(key !== descriptionJSON.key){
                throw new Error("Package key does not match package description.");
            }

            if(!DeployBug.getPackageRegistryDescriptionByKey(key)){
                throw new Error("Package key does not exist in the registry. Please use 'register' to register your package.");
            } else {
                Validator.validatePackageDescription(descriptionJSON);
                DeployBug.setPackageRegistryDescription(descriptionJSON.key, descriptionJSON);
                callback();
            }
        } catch(error){
            callback(error);
        }

        //update only
    },

    /**
     *  @param {string} key
     *  @param {function(Error)} callback
     */
    deployPackage: function(key, callback) {
        var commandString;
        var options = {};
        var description = DeployBug.getPackageRegistryDescriptionByKey(key);

        //TODO: Could probably move this to validation during registration
        if ( /^node$/i.test(description.packageType) || /^npm$/i.test(packageType)) {

            //TODO: From a security perspective. We will want to install the packages using a specific unix user id. OR after the package is installed, we will want to change the owner of the package.
            commandString = 'npm install '
            //NOTE: Change of directory location to root of the deploybug package
            options.cwd = path.resolve(__dirname + '/../.deploybug/');

            if (!BugFs.existsSync(options.cwd)){
                BugFs.createDirectorySync(options.cwd);
            }
            commandString += description.packageURL;
            PackageCommand.execute(key, commandString, options, function(error, logs){
                if(!error){
                    console.log("Package", key, "deployed");
                    callback(null, logs);
                } else {
                    console.log(error, "\n", logs);
                    callback(error, logs);
                }
            });

        } else {
            callback(new TypeError("DeployBug currently only supports node packages"));
        }

        // registration retrieval
        // iterate through nodes
            // shell into node
            // download and install package
    },

    /**
     *  @param {string} key
     *  @param {function(Error)} callback
     */
    startPackage: function(key, callback) {
        var description = DeployBug.getPackageRegistryDescriptionByKey(key);
        var startScript = description.startScript;
        //NOTE: Change of directory location to the root of the deploybug package
        //TODO: Is the description key the same as the name of the module? Should it be? TODO: Separate key from module name
        //TODO: DRY up __dirname + '/../.deploybug/node_modules/
        var commandString = 'forever start ' + path.resolve(path.join(__dirname + '/../.deploybug/node_modules/', description.key, startScript));
        PackageCommand.execute(key, commandString, {}, function(error, logs){
            if(!error){
                console.log("Package", key, "started");
                callback(null, logs);
            } else {
                console.log(error, "\n", logs);
                callback(error, logs);
            }
        });
    },

    /**
     *  @param {string} key
     *  @param {function(Error)} callback
     */
    stopPackage: function(key, callback) {
        var description = DeployBug.getPackageRegistryDescriptionByKey(key);
        var startScript = description.startScript;
        var commandString = 'forever stop ' + path.resolve(path.join(__dirname + '/../.deploybug/node_modules/', description.key, startScript));

        PackageCommand.execute(key, commandString, {}, function(error, logs){
            if(!error){
                console.log("Package", key, "stopped");
                callback(null, logs);
            } else {
                console.log(error, "\n", logs);
                callback(error, logs);
            }
        });
    },

    /**
     *  @param {string} key
     *  @param {function(Error)} callback
     */
    restartPackage: function(key, callback) {
        var description = DeployBug.getPackageRegistryDescriptionByKey(key);
        var startScript = description.startScript;
        var commandString = 'forever restart ' + path.resolve(path.join(__dirname + '/../.deploybug/node_modules/', description.key, startScript));

        PackageCommand.execute(key, commandString, {}, function(error, logs){
            if(!error){
                console.log("Package", key, "restarted");
                callback(null, logs);
            } else {
                console.log(error, "\n", logs);
                callback(error, logs);
            }
        });
        // NOTE: Possible refactor:
        // Deploybug.stopPackage(key, function(){
        //     Deploybug.startPackage(key, callback);
        // });
    },

    //-------------------------------------------------------------------------------
    // Getters and Setters
    //-------------------------------------------------------------------------------

    /**
     *  @param {string} key
     *  @return {{
     *  key: string,
     *  packageURL: string,
     *  packageType: string,
     *  startScript: string
     *  }}
     */
    getPackageRegistryDescriptionByKey: function(key){
        return DeployBug.packageRegistry.get(key);
    },

    /**
     *  @param {string} key
     *  @param {{
     *  key: string,
     *  packageURL: string,
     *  packageType: string,
     *  startScript: string
     *  }} descriptionJSON
     */
    setPackageRegistryDescription: function(key, descriptionJSON){
        DeployBug.packageRegistry.put(key, descriptionJSON);
    },

    /**
     *  @param {string} key
     *  @return {Array.<string>}
     */
    getPackageRegistryKeys: function(){
        return DeployBug.packageRegistry.getKeyArray();
    }
};

//-------------------------------------------------------------------------------
// Exports
//-------------------------------------------------------------------------------

bugpack.export('deploybugserver.DeployBug', DeployBug);