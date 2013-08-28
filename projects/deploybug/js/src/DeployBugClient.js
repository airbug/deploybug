//-------------------------------------------------------------------------------
// Annotations
//-------------------------------------------------------------------------------

//@Package('deploybug')

//@Export('DeployBugClient')

//-------------------------------------------------------------------------------
// Common Modules
//-------------------------------------------------------------------------------

var bugpack = require('bugpack').context(module);
var io = require('socket.io-client');
var Class =         bugpack.require('Class');
var Obj =           bugpack.require('Obj');

//-------------------------------------------------------------------------------
// BugPack
//-------------------------------------------------------------------------------

//-------------------------------------------------------------------------------
// Declare Class
//-------------------------------------------------------------------------------

var DeployBugClient = Class.extend(Obj, {
    
    _constructor: function(options, callback){

        this._super();
        
        //-------------------------------------------------------------------------------
        // Variables
        //-------------------------------------------------------------------------------

        /**
         * @private
         * @type {number}
        */
        this.count = 0;

        /**
         * @private
         * @type {boolean}
        */
        this.initialized = false;

        /**
         * @private
         * @type {Manager}
        */
        this.deploybugSocket = null;

        this.initialize(options, callback);
    },

    //-------------------------------------------------------------------------------
    // Public Methods
    //-------------------------------------------------------------------------------

    /**
     * @param {{
     *  serverHostName: string,
     *  serverPort: (string|number)
     * }} options
     * @param {function()} callback
    */
    initialize: function(options, callback) {
        //TODO: Validate options.
        // initializes packages socket namespaced to hostname/deploybug/packages endpoint. separate socket needed for nodes
        if (!this.initialized) {
            this.initialized = true;
            var deploybugSocket = this.deploybugSocket = io.connect(options.serverHostName + ':' + options.serverPort);
            deploybugSocket.of('/deploybug/descriptions'); //BUGBUG
            deploybugSocket.on('connecting', function(data){
                console.log('Connecting to DeployBugServer...');
                console.log(data);
            });

            deploybugSocket.on('connect', function(data){
                console.log("Connected to DeployBugServer");
            });

            deploybugSocket.on('error', function(reason){
                console.log("Unable to connect to DeployBugServer via socket", reason);
                process.exit(1);
            });

            deploybugSocket.on('message', function(data){
                console.log(data);
            });

            deploybugSocket.on('disconnect', function(data){
                console.log('Disconnected from DeployBugServer');
                process.exit(1);
            });

            callback(this);
        }
    },
    
    registry: function(options, callback) {
        var deploybugSocket = this.deploybugSocket;
        var callKey = this.generateCallKey();
        var clientData = {
            callKey: callKey
        };

        deploybugSocket.emit('registry', clientData);
        console.log('Waiting for response from DeployBugServer...');

        deploybugSocket.on('registry-' + callKey, function(data){
            deploybugSocket.removeAllListeners('registry-' + callKey);
            console.log(JSON.stringify(data));
            callback(null, data); // should I check for the existence of a callback?
        });
    },

    /**
     * @param {{
     *  key: string,
     *  descriptionJSON: {
     *      key: string,
     *      packageURL: string,
     *      packageType: string,
     *      metaData: {*}
     * }} options
     * @param {function(Error, {*})} callback
     */
    registerDescription: function(options, callback) {
        var deploybugSocket = this.deploybugSocket;
        var key = options.key;
        var descriptionJSON = options.descriptionJSON;
        var callKey = this.generateCallKey(key);
        var clientData = {
            key: key,
            callKey: callKey,
            descriptionJSON: descriptionJSON
        };

        //TODO: Validate key matches key inside descriptionJSON

        deploybugSocket.emit('register', clientData);
        console.log('Waiting for response from DeployBugServer...');

        deploybugSocket.on('registered-' + callKey, function(data){
            deploybugSocket.removeAllListeners('registered-' + callKey, 'error-registered-' + callKey);
            // console.log(JSON.stringify(data));
            callback(null, data); // should I check for the existence of a callback?
            console.log("Description successfully registered");
        });

        deploybugSocket.on('error-registering-' + callKey, function(data){
            deploybugSocket.removeAllListeners('registered-' + callKey, 'error-registered-' + callKey);
            var error = data.error || new Error();
            // console.log(JSON.stringify(data));
            callback(error, data);
            console.log();
        });
    },

    /**
     * @param {{
     *  key: string,
     *  descriptionJSON: {
     *  key: string,
     *  packageURL: string,
     *  packageType: string,
     *  startScript: (string | Path)
     * }
     * }} options
     * @param {function(Error, {*})} callback
     */
     updateDescription: function(options, callback){
        var deploybugSocket = this.deploybugSocket;
        var key = options.key;
        var callKey = this.generateCallKey(key);
        var clientData = {
            callKey: callKey,
            key: options.key,
            descriptionJSON: options.descriptionJSON
        };
        //TODO: Validate key matches key inside descriptionJSON

        deploybugSocket.emit('update', clientData);

        deploybugSocket.on('updated-' + callKey, function(data) {
            deploybugSocket.removeAllListeners('updated-' + callKey, 'error-updating-' + callKey);
            callback(null, data);
            console.log("Description successfully updated");
        });
        deploybugSocket.on('error-updating-' + callKey, function(data) {
            deploybugSocket.removeAllListeners('updated-' + callKey, 'error-updating-' + callKey);
            var error = data.error || new Error();
            callback(error, data);
            console.log();
        });
    },

    /**
     * @param {{
     *  key: string,
     * }} options
     * @param {function(Error, {*})} callback
     */
    runCommand: function(options, callback) {
        var deploybugSocket = this.deploybugSocket;
        var key = options.key;
        var command = options.command;
        var callKey = this.generateCallKey(key, command);
        var clientData = {
            key: key,
            callKey: callKey,
            command: command
        };

        deploybugSocket.emit('runCommand', clientData);

        deploybugSocket.on('ranCommand-' + callKey, function(data) {
            deploybugSocket.removeAllListeners('ranCommand-' + callKey, 'error-runningCommand-' + callKey);
            callback(null, data);
            console.log("Command", command, "ran successfully");
        });
        deploybugSocket.on('error-runningCommand-' + callKey, function(data) {
            deploybugSocket.removeAllListeners('ranCommand-' + callKey, 'error-runningCommand-' + callKey);
            var error = data.error;
            callback(error, data);
            console.log();
        });
    },
    
    /**
     * @param {{
     *  key: string,
     * }} options
     * @param {function(Error, {*})} callback
     */
    runInstruction: function(options, callback) {
        var deploybugSocket = this.deploybugSocket;
        var key = options.key;
        var command = options.command;
        var instruction = options.instruction;
        var callKey = this.generateCallKey(key, command, instruction);
        var clientData = {
            key: key,
            command: command,
            callKey: callKey,
            targetPackage: options.targetPackage,
            instruction: instruction
        };

        deploybugSocket.emit('runInstruction', clientData);

        deploybugSocket.on('ranInstruction-' + callKey, function(data) {
            deploybugSocket.removeAllListeners('ranInstruction-' + callKey, 'error-runningInstruction-' + callKey);
            callback(null, data);
        });
        deploybugSocket.on('error-runningInstruction-' + callKey, function(data) {
            deploybugSocket.removeAllListeners('ranInstruction-' + callKey, 'error-runningInstruction-' + callKey);
            var error = data.error;
            callback(error, data);
        });
    },


    //-------------------------------------------------------------------------------
    // Private Methods
    //-------------------------------------------------------------------------------

    /**
     * @private
     * @param {string} key
    */
    generateCallKey: function (){
        return  Array.prototype.join.call(arguments, "") + (this.count ++);
    }
});


//-------------------------------------------------------------------------------
// Exports
//-------------------------------------------------------------------------------

bugpack.export('deploybug.DeployBugClient', DeployBugClient);
