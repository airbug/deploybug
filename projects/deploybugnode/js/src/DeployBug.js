//-------------------------------------------------------------------------------
// Requires
//-------------------------------------------------------------------------------

//@Package('deploybugnode')

//@Export('DeployBug')

//@Require('bugfs.BugFs')
//@Require('deploybugnode.Validator')
//@Require('deploybugnode.PackageCommand')

//-------------------------------------------------------------------------------
// Common Modules
//-------------------------------------------------------------------------------

var bugpack         = require('bugpack').context(module);
var http            = require('http');
var path            = require('path');

//-------------------------------------------------------------------------------
// BugPack
//-------------------------------------------------------------------------------

var BugFs           = bugpack.require('bugfs.BugFs');
var PackageCommand  = bugpack.require('deploybugnode.PackageCommand');
var Validator       = bugpack.require('deploybugnode.Validator');

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
     * @type {string}
     */
    nodejsInstallationDirectory: path.resolve(__dirname + '/../.deploybug/nodejs/'),
    
    /**
     * @private
     * @type {string}
     */
    clientjsInstallationDirectory: path.resolve(__dirname + '/../.deploybug/clientjs/'),

    //-------------------------------------------------------------------------------
    // Public Static Methods
    //-------------------------------------------------------------------------------

    /**
     * @param {function(error)} callback
     */
    initialize: function(callback){
        if(!DeployBug.initialized) {
            try {
                var nodejsInstallationDirectory = path.resolve(DeployBug.nodejsInstallationDirectory + '/node_modules/'); //NOTE: nodejs modules. Does not account for clientjs
                var clientjsInstallationDirectory = DeployBug.clientjsInstallationDirectory;
                if(!BugFs.existsSync(nodejsInstallationDirectory)){
                    BugFs.createDirectorySync(nodejsInstallationDirectory, true);
                }
                if(!BugFs.existsSync(clientjsInstallationDirectory)){
                    BugFs.createDirectorySync(clientjsInstallationDirectory, true);
                }
                DeployBug.initialized = true;
                callback();
            } catch(error){
                callback(error);
            }
        }
    },

    /**
     *  @param {{}} targetPackage
     *  @param {function(Error)} callback
     */
    npmInstall: function(targetPackage, callback) {
        var options = {};
        var key = targetPackage.key;
        var packageURL = targetPackage.url;
        var installationDirectory = DeployBug.nodejsInstallationDirectory;
        var commandString = 'npm install ' + packageURL;
        //TODO: From a security perspective. We will want to install the packages using a specific unix user id. OR after the package is installed, we will want to change the owner of the package.
        options.cwd = installationDirectory;

        PackageCommand.execute(key, commandString, options, function(error, logs){
            if(!error){
                console.log("Package", key, "deployed");
                callback(null, logs);
            } else {
                console.log(error, "\n", logs);
                callback(error, logs);
            }
        });
    },


    //-------------------------------------------------------------------------------
    // Getters and Setters
    //-------------------------------------------------------------------------------

};

//-------------------------------------------------------------------------------
// Exports
//-------------------------------------------------------------------------------

bugpack.export('deploybugnode.DeployBug', DeployBug);