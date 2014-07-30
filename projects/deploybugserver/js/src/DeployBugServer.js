//-------------------------------------------------------------------------------
// Annotations
//-------------------------------------------------------------------------------

//@Package('deploybugserver')

//@Export('DeployBugServer')

//@Require('Flows')
//@Require('deploybug.DeployBugClient')
//@Require('deploybugnode.DeployBug')
//@Require('deploybugserver.DescriptionRegistry')
//@Require('deploybugserver.NodeRegistry')


//-------------------------------------------------------------------------------
// Context
//-------------------------------------------------------------------------------

require('bugpack').context("*", function(bugpack) {

    //-------------------------------------------------------------------------------
    // Common Modules
    //-------------------------------------------------------------------------------

    var express     = require('express');
    var http        = require('http');
    var path        = require('path');


    require('express-namespace');


    //-------------------------------------------------------------------------------
    // BugPack
    //-------------------------------------------------------------------------------

    var Flows             = bugpack.require('Flows');
    var DeployBugClient     = bugpack.require('deploybug.DeployBugClient');
    var NodeRegistry        = bugpack.require('deploybugserver.NodeRegistry');
    // var PackageRegistry     = bugpack.require('deploybugserver.PackageRegistry');
    var DescriptionRegistry = bugpack.require('deploybugserver.DescriptionRegistry');


    //-------------------------------------------------------------------------------
    // Simplify References
    //-------------------------------------------------------------------------------

    var $forEachParallel    = Flows.$forEachParallel;
    var $forEachSeries      = Flows.$forEachSeries;
    var $series             = Flows.$series;
    var $task               = Flows.$task;


    //-------------------------------------------------------------------------------
    // Build App
    //-------------------------------------------------------------------------------

    var DeployBugServer = {

        //-------------------------------------------------------------------------------
        // Variables
        //-------------------------------------------------------------------------------

        /**
         * @type {number}
         */
        port: null,

        // /**
        //  * @type {Queue}
        //  */
        // commandQueue: null,

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
            console.log("Starting DeployBugServer...");

            // DeployBug.commandQueue = new Queue;

            DescriptionRegistry.initialize();
            NodeRegistry.initialize();

            var app = DeployBugServer.app(); //express

            //TODO: Allow this value to be configurable using a configuration json file.
            var port = DeployBugServer.port || 8000;

            DeployBugServer.configure(app, express, function(){
                console.log("DeployBugServer configured");
            });

            // Create Server
            var server = http.createServer(app);

            DeployBugServer.enableSockets(server, function(){
                console.log("DeployBugServer sockets enabled");
            });

            server.listen(port, function(){
                console.log("DeployBugServer successfully started");
                console.log("DeployBugServer listening on port " + port);
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
              console.log("DeployBugServer Closing ...");
              app.close();
            });

            app.on('close', function () {
              console.log("DeployBugServer Closed");
            });

            callback();
        },

        /**
         * @param {Server} server
         * @param {Function} callback
         */
        enableSockets: function(server, callback){

            //-------------------------------------------------------------------------------
            // Sockets for central server
            //-------------------------------------------------------------------------------
            var deploybug = require('socket.io').listen(server); //returns instance of socket io's Manager class whose prototype has an 'of' method defaults to .of('')
            deploybug.of('/deploybug/descriptions');
            deploybug.sockets.on('connection', function (socket) {
                console.log("Connection established")
                // socket.emit('connect'); // connect and connecting events are built in. connect is emitted upon connection establishment

                //TODO: Confirm that this event listener works
                socket.on('error', function(reason){
                   console.log('Error:', reason);
                });

                socket.on('registry', function(data){
                    DescriptionRegistry.getRegistryKeys(function(rows){
                        socket.emit(
                            'registry-' + data.callKey,
                            {
                                message: 'registry-' + data.callKey,
                                keys: rows //TODO: parse dates
                            }
                        );
                    });
                 });

                socket.on('register', function(data){
                    var key = data.key;
                    var callKey = data.callKey;
                    var description = data.descriptionJSON;
                    DescriptionRegistry.register(key, description, function(error){
                        if(!error){
                            socket.emit(
                                'registered-' + callKey,
                                {
                                    message: 'registered-' + callKey
                                }
                            );
                        } else {
                            socket.emit(
                                'error-registering-' + callKey,
                                {
                                    message: 'error-registering-' + callKey
                                }
                            );
                        }
                    });
                });

                socket.on('update', function(data){
                    var key = data.key;
                    var callKey = data.callKey;
                    var description = data.descriptionJSON;
                    DescriptionRegistry.update(key, description, function(error){
                        if(!error){
                            socket.emit(
                                'updated-' + callKey,
                                {
                                    message: 'updated-' + callKey
                                }
                            );
                        } else {
                            socket.emit(
                                'error-updating-' + callKey,
                                {
                                    message: 'error-updating-' + callKey
                                }
                            );
                        }
                    });
                });

                socket.on('runCommand', function(data){
                    var command = data.command;
                    var key = data.key;
                    var callKey = data.callKey;
                    var logs = [];
                    var instructions;
                    var description;

                    $series([
                        // Retrieve description
                        $task(function(flow){
                            DescriptionRegistry.findByKey(key, function(error, descript){
                                description = descript;
                                instructions = description.commands[command]['instructions'];
                                flow.complete(error);
                            })
                        }),
                        $task(function(flow){
                            // Each instruction in the instructions array is run in series
                            // Each instruction is sent out to all applicable nodes in parallel
                            $forEachSeries(instructions, function(flow, instruction){
                                var options = {
                                    command: command,
                                    instruction: instruction.type,
                                    targetPackage: description.packages[instruction.targetPackage]
                                };
                                NodeRegistry.findNodes(instruction.nodes, function(error, nodes){
                                   $forEachParallel(nodes, function(flow, node){
                                       var serverOptions = {
                                           serverHostName: node.hostname,
                                           serverPort: node.port
                                       };
                                       deployBugClient = new DeployBugClient(serverOptions, function(deployBugClient){
                                           console.log("New DeployBugClient connection initialized for:", node.hostname, node.port);
                                           deployBugClient.runInstruction(options, function(error, data){
                                               // COLLECT LOGS TO SEND BACK
                                               if(!error){
                                                   logs.push(data);
                                                   console.log(data);
                                               } else {
                                                   logs.push(data);
                                                   console.log(error);
                                                   console.log(data);
                                               }
                                               deployBugClient = null; //TODO: Rewrite
                                               console.log("DeployBugClient connection closed for:", node.hostname, node.port);
                                               flow.complete(error);
                                           });
                                       });
                                   }).execute(function(error){ //$forEachParallel
                                       flow.complete(error);
                                   });
                                });
                            }).execute(function(error){  //$forEachSeries
                                flow.complete(error);
                            });
                        })
                    ]).execute(function(error){
                        if(!error){
                            socket.emit(
                                'ranCommand-' + callKey,
                                {
                                    message: 'ranCommand-' + callKey,
                                    logs: logs
                                }
                            );
                        } else {
                            socket.emit(
                                'error-runningCommand-' + callKey,
                                {
                                    message: 'error-runningCommand-' + callKey,
                                    logs: logs
                                }
                            );
                        }
                    });
                });
            });
        }
    };


    //-------------------------------------------------------------------------------
    // Exports
    //-------------------------------------------------------------------------------

    bugpack.export('deploybugserver.DeployBugServer', DeployBugServer);
});
