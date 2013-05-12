//-------------------------------------------------------------------------------
// Annotations
//-------------------------------------------------------------------------------

//@Package('deploybugnode')

//@Export('DeployBugNode')

//@Require('deploybugnode.DeployBug')

//-------------------------------------------------------------------------------
// Requires
//-------------------------------------------------------------------------------

var express     = require('express');
var http        = require('http');
var path        = require('path');
var bugpack     = require('bugpack').context(module);

require('express-namespace');

//-------------------------------------------------------------------------------
// BugPack
//-------------------------------------------------------------------------------

var DeployBug       = bugpack.require('deploybugnode.DeployBug');

//-------------------------------------------------------------------------------
// Build App
//-------------------------------------------------------------------------------

var DeployBugNode = {

    //-------------------------------------------------------------------------------
    // Variables
    //-------------------------------------------------------------------------------

    /**
     * @type {number}
     */
    port: null,

    /**
     * @return {Function}
     */
    app: function(){
        return express();
    },

    //-------------------------------------------------------------------------------
    // Variables
    //-------------------------------------------------------------------------------

    start: function(){
        console.log("Starting DeployBugNode...");
        var app = DeployBugNode.app(); //express

        DeployBug.initialize(function(error){
            if(!error) {
                console.log("DeployBug initialized");
            } else {
                console.log(error);
            }
        });

        //TODO: Allow this value to be configurable using a configuration json file.
        var port = DeployBugNode.port || 8001;

        DeployBugNode.configure(app, express, function(){
            console.log("DeployBugNode configured");
        });

        // Create Server
        var server = http.createServer(app);

        DeployBugNode.enableSockets(server, function(){
            console.log("DeployBugNode sockets enabled");
        });

        server.listen(port, function(){
            console.log("DeployBugNode successfully started");
            console.log("DeployBugNode listening on port " + port);
        });
    },
    
    /**
     * @param {Function} app
     * @param {Function} express
     * @param {Function} callback
     */
    configure: function(app, express, callback){
        app.configure(function() {
            //TODO: Add authentication //TODO LIST // 1) Security. How do we protect these api endpoints?
            app.use(express.errorHandler({dumpExceptions:true,showStack:true}));
            app.use(express.logger('dev'));
            app.use(express.bodyParser());
            app.use(app.router);
        });

        // Graceful Shutdown
        process.on('SIGTERM', function () {
          console.log("DeployBugNode Closing ...");
          app.close();
        });

        app.on('close', function () {
          console.log("DeployBugNode Closed");
        });

        callback();
    },

    /**
     * @param {Server} server
     * @param {Function} callback
     */
    enableSockets: function(server, callback){    //NOTE: This version of sockets is for DeployBugNodes
        
        //-------------------------------------------------------------------------------
        // Sockets for node servers
        //-------------------------------------------------------------------------------
        var packages = require('socket.io').listen(server); //returns instance of socket io's Manager class whose prototype has an 'of' method defaults to .of('')
        packages.of('/deploybug/descriptions'); //BUGBUG
        packages.sockets.on('connection', function (socket) {
            console.log("Connection established")
            // socket.emit('connect'); // connect and connecting events are built in. connect is emitted upon connection establishment

            //TODO: Confirm that this event listener works
            socket.on('error', function(reason){
               console.log('Error:', reason); 
            });
            /**
             *
             * @param {
                 key: key,
                 command: command,
                 callKey: callKey,
                 targetPackage: {},
                 instruction: instruction
             } data
            */
            socket.on('runInstruction', function(data){
                var instruction = data.instruction;
                var targetPackage = data.targetPackage;
                var callKey = data.callKey;
                console.log("Running Instruction", instruction);
                DeployBug[instruction](targetPackage, function(error, data){
                    if(!error){
                        console.log('Emitting event:', 'ranInstruction-', callKey )
                        socket.emit('ranInstruction-' + callKey, {
                            message: 'ranInstruction-' + callKey,
                            data: data
                        });
                    } else {
                        console.log('Emitting event:', 'error-runningInstruction-', callKey )
                        socket.emit('error-runningInstruction-' + callKey, {
                            message: 'error-runningInstruction-' + callKey,
                            data: data
                        });
                    }
                });
            });
        });
        callback();
    }
};


//-------------------------------------------------------------------------------
// Exports
//-------------------------------------------------------------------------------

bugpack.export('deploybugnode.DeployBugNode', DeployBugNode);
