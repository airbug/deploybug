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

var DeployBugClient = {

    //-------------------------------------------------------------------------------
    // Variables
    //-------------------------------------------------------------------------------

    /**
     * @private
     * @type {number}
    */
    count: 0,

    /**
     * @private
     * @type {boolean}
    */
    initialized: false,

    /**
     * @private
     * @type {Manager}
    */
    packagesSocket: null,

    /**
     * @private
     * @type {Manager}
    */
    nodesSocket: null,

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
        if (!DeployBugClient.initialized) {
            DeployBugClient.initialized = true;
            var packagesSocket = DeployBugClient.packagesSocket = io.connect(options.serverHostName + ':' + options.serverPort);
            packagesSocket.of('/deploybug/packages');
            packagesSocket.on('connecting', function(data){
                console.log('Connecting to DeployBugServer...');
                console.log(data);
            });

            packagesSocket.on('connect', function(data){
                console.log("Connected to DeployBugServer");
            });

            packagesSocket.on('error', function(reason){
                console.log("Unable to connect to DeployBugServer via socket", reason);
                process.exit(1);
            });

            packagesSocket.on('message', function(data){
                console.log(data);
            });

            packagesSocket.on('disconnect', function(data){
                console.log('Disconnected from DeployBugServer');
                process.exit(1);
            });

            callback();
        }
    },

    /**
     * @param {{
     *  key: string,
     *  descriptionJSON: {
     *  key: string,
     *  packageURL: string,
     *  packageType: string,
     *  startScript: (string | Path)
     * }} options
     * @param {function(Error, {*})} callback
     */
    registerPackage: function(options, callback) {
        var packagesSocket = DeployBugClient.packagesSocket;
        var key = options.key;
        var callKey = DeployBugClient.generateCallKey(key);
        var clientData = {
            callKey: callKey,
            key: key,
            descriptionJSON: options.descriptionJSON
        };

        //TODO: Validate key matches key inside descriptionJSON

        packagesSocket.emit('register', clientData);
        console.log('Waiting for response from DeployBugServer...');

        packagesSocket.on('registered-' + callKey, function(data){
            packagesSocket.removeAllListeners('registered-' + callKey, 'error-registered-' + callKey);
            console.log(JSON.stringify(data));
            callback(null, data); // should I check for the existence of a callback?
        });

        packagesSocket.on('error-registering-' + callKey, function(data){
            packagesSocket.removeAllListeners('registered-' + callKey, 'error-registered-' + callKey);
            var error = data.error;
            console.log(JSON.stringify(data));
            callback(error, data);
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
     updatePackage: function(options, callback){
        var packagesSocket = DeployBugClient.packagesSocket;
        var key = options.key;
        var callKey = DeployBugClient.generateCallKey(key);
        var clientData = {
            callKey: callKey,
            key: options.key,
            descriptionJSON: options.descriptionJSON
        };
        //TODO: Validate key matches key inside descriptionJSON

        packagesSocket.emit('update', clientData);

        packagesSocket.on('updated-' + callKey, function(data) {
            packagesSocket.removeAllListeners('updated-' + callKey, 'error-updating-' + callKey);
            callback(null, data);
        });
        packagesSocket.on('error-updating-' + callKey, function(data) {
            packagesSocket.removeAllListeners('updated-' + callKey, 'error-updating-' + callKey);
            var error = data.error;
            callback(error, data);
        });
    },

    /**
     * @param {{
     *  key: string,
     * }} options
     * @param {function(Error, {*})} callback
     */
    deployPackage: function(options, callback) {
        var packagesSocket = DeployBugClient.packagesSocket;
        var key = options.key;
        var callKey = DeployBugClient.generateCallKey(key);
        var clientData = {
            callKey: callKey,
            key: options.key
        };

        packagesSocket.emit('deploy', clientData);

        packagesSocket.on('deployed-' + callKey, function(data) {
            packagesSocket.removeAllListeners('deployed-' + callKey, 'error-deploying-' + callKey);
            callback(null, data);
        });
        packagesSocket.on('error-deploying-' + callKey, function(data) {
            packagesSocket.removeAllListeners('deployed-' + callKey, 'error-deploying-' + callKey);
            var error = data.error;
            callback(error, data);
        });
    },

    /**
     * @param {{
     *  key: string,
     * }} options
     * @param {function(Error, {*})} callback
     */
    startPackage: function(options, callback) {
        var packagesSocket = DeployBugClient.packagesSocket;
        var key = options.key;
        var callKey = DeployBugClient.generateCallKey(key);
        var clientData = {
            callKey: callKey,
            key: options.key
        };

        packagesSocket.emit('start', clientData);

        packagesSocket.on('started-' + callKey, function(data) {
            packagesSocket.removeAllListeners('started-' + callKey, 'error-starting-' + callKey);
            callback(null, data);
        });
        packagesSocket.on('error-starting-' + callKey, function(data) {
            packagesSocket.removeAllListeners('started-' + callKey, 'error-starting-' + callKey);
            var error = data.error;
            callback(error, data);
        });
    },

    /**
     * @param {{
     *  key: string,
     * }} options
     * @param {function(Error, {*})} callback
     */
    stopPackage: function(options, callback) {
        var packagesSocket = DeployBugClient.packagesSocket;
        var key = options.key;
        var callKey = DeployBugClient.generateCallKey(key);
        var clientData = {
            callKey: callKey,
            key: options.key
        };

        packagesSocket.emit('stop', clientData);

        packagesSocket.on('stopped-' + callKey, function(data) {
            packagesSocket.removeAllListeners('stopped-' + callKey, 'error-stopping-' + callKey);
            callback(null, data);
        });
        packagesSocket.on('error-stopping-' + callKey, function(data) {
            packagesSocket.removeAllListeners('stopped-' + callKey, 'error-stopping-' + callKey);
            var error = data.error;
            callback(error, data);
        });
    },

    /**
     * @param {{
     *  key: string,
     * }} options
     * @param {function(Error, {*})} callback
     */
     restartPackage: function(options, callback) {
        var packagesSocket = DeployBugClient.packagesSocket;
        var key = options.key;
        var callKey = DeployBugClient.generateCallKey(key);
        var clientData = {
            callKey: callKey,
            key: options.key
        };

        packagesSocket.emit('restart', clientData);

        packagesSocket.on('restarted-' + callKey, function(data) {
            packagesSocket.removeAllListeners('restarted-' + callKey, 'error-restarting-' + callKey);
            callback(null, data);
        });
        packagesSocket.on('error-restarting-' + callKey, function(data) {
            packagesSocket.removeAllListeners('restarted-' + callKey, 'error-restarting-' + callKey);
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
    generateCallKey: function (key){
        return key + (DeployBugClient.count ++);
    }
};

//-------------------------------------------------------------------------------
// Exports
//-------------------------------------------------------------------------------

bugpack.export('deploybug.DeployBugClient', DeployBugClient);
