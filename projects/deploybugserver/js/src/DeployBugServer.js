//TODO LIST
// 1) Security. How do we protect these api endpoints?

//-------------------------------------------------------------------------------
// Annotations
//-------------------------------------------------------------------------------

//@Package('deploybugserver')

//@Export('DeployBugServer')

//@Require('deploybugserver.DeployBug')


//-------------------------------------------------------------------------------
// Requires
//-------------------------------------------------------------------------------

var express =   require("express");
require('express-namespace');
var http =      require('http');
var path =      require('path');
var bugpack =   require('bugpack').context(module);

//-------------------------------------------------------------------------------
// BugPack
//-------------------------------------------------------------------------------

var DeployBug = bugpack.require('deploybugserver.DeployBug');


//-------------------------------------------------------------------------------
// Build App
//-------------------------------------------------------------------------------

var DeployBugServer = {
    port: null,

    app: function(){
        return express();
    },

    configure: function(app, express, callback){
        app.configure(function() {
            //TODO: Add authentication
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

    enableRoutes: function(app, express, callback){
        app.get('/index', function(req, res){
           res.send("Hello, This is the DeployBugServer");
           res.end();
        });

        app.namespace('/deploybug/packages', function(){ //DONOT DOUBLE NEST NAMESPACES!! TODO: edit express-namespaces to allow nesting

            app.get('/registry/index', function(req, res){
                 var packageRegistryKeys = DeployBug.getPackageRegistryKeys();
                 res.json({"packageRegistryKeys": packageRegistryKeys});
                 res.end();
             });

             app.get('/registry/:key', function(req, res){
                 var key = req.params.key;
                 var description = DeployBug.getPackageRegistryDescriptionByKey(key);
                 res.json(description);
                 res.end();
             });

             app.post('/register', function(req, res) {
                 var descriptionJSON = req.body;
                 console.log('request body: ' + descriptionJSON);
                 DeployBug.registerPackage(descriptionJSON, function(error){
                     if(!error){
                         console.log('Package registration successful for package ' + descriptionJSON.key);
                         res.send('Package registration successful for package ' + descriptionJSON.key);
                     } else {
                         console.log('Registration failed for package' + descriptionJSON.key + '.\n Error: ' + error.message + error.stack);
                         res.send('Registration failed for package ' + descriptionJSON.key + '. \n Error: ' + error.message);
                     }
                     res.end();
                 });

             });

             app.put(':key/update', function(req, res){
                 var key = req.params.key;
                 var descriptionJSON = req.body;
                 DeployBug.updatePackage(key, descriptionJSON, function(error){
                     if(!error){
                         console.log('Package registration update successful for package ' + key);
                         res.send('Package registration update successful for package ' + key);
                     } else {
                         console.log('Registration update failed for package' + descriptionJSON.key + '.\n Error: ' + error.message + error.stack);
                         res.send('Registration update failed for package ' + descriptionJSON.key + '. \n Error: ' + error.message);
                     }
                     res.end();
                 });
             
             });

             app.post(':key/deploy', function(req, res) {
                 var key = req.params.key;
                 /*
                  * {
                  *  key: string, 
                  *  nodes: (<Array> | string) // Array of node IDs or string specifying type, e.g. all 'application' servers, all 'database' servers, all 'redis' servers, etc. Defaults to all nodes specified in the package description.
                  *  } req.body
                  */
                 DeployBug.deployPackage(key, function(error, logs){
                     res.send("\n logs: " + logs + "\n errors: " + error);
                     res.end();
                 });
             });

             app.put(':key/start', function(req, res){
                 //TODO: If we url encoded the "key" before the request was sent, does it need to be decoded here?
                 var key = req.params.key;
                 DeployBug.startPackage(key, function(error, logs){
                     res.send("\n logs: " + logs + "\n errors: " + error);
                     res.end();
                 });
            });

             app.put(':key/stop', function(req, res){
                 var key = req.params.key;
                 DeployBug.stopPackage(key, function(error, logs){
                     res.send("\n logs: " + logs + "\n errors: " + error);
                     res.end();
                 });
             });

             app.put(':key/restart', function(req, res){
                 var key = req.params.key;
                 DeployBug.restartPackage(key, function(error, logs){
                     res.send("\n logs: " + logs + "\n errors: " + error);
                     res.end();
                 });
             });
        });

        app.namespace('/deploybug/nodes', function(){  //TODO: Routes for nodes
        });

        callback();
    },

    enableSockets: function(server, callback){    
        var packages = require('socket.io').listen(server); //returns instance of socket io's Manager class whose prototype has an 'of' method defaults to .of('')
        // Is there an error event for the socket connection
        // packages.of('/deploybug/packages');
        packages.sockets.on('connection', function (socket) {
            console.log("Connection established")
            // socket.emit('connect'); // connect and connecting events are built in. connect is emitted upon connection establishment

            socket.on('registry', function(data){
                socket.emit('registry', {
                    "registry-keys": DeployBug.getPackageRegistryKeys()
                })
            });

            socket.on('register', function(data){
                var descriptionJSON = data.descriptionJSON; //NOTE: registerPackage method now requires key as well as descriptionJSON
                var key = data.key;
                var callKey = data.callKey;
                console.log("Registering package: ", key);

                DeployBug.registerPackage(key, descriptionJSON, function(error){
                    if(!error){
                        console.log('Package registration successful for package ' + key);
                        socket.emit('registered-' + callKey, {
                            "key": key,
                            "message": 'Package registration successful for package ' + key
                        }) //complete or success or registered??
                    } else {
                        console.log('Registration failed for package' + key + ': \n Error: ' + error.message + error.stack);
                        socket.emit('error-registering-'+ callKey, {
                            "key": key,
                            "error": {"message": error.message}
                        });
                    }
                });
            });

            socket.on('update', function(data){
                var key = data.key;
                var callKey = data.callKey;
                var descriptionJSON = data.descriptionJSON;
                console.log("Updating package: ", key);

                DeployBug.updatePackage(key, descriptionJSON, function(error){
                    if(!error){
                        console.log('Package registration update successful for package ' + key);
                        socket.emit('updated-' + callKey, {
                            "key": key,
                            "message": 'Package registration update successful for package ' + key
                        })
                    } else {
                        console.log('Registration update failed for package' + key + ': \n Error: ' + error.message + error.stack);
                        socket.emit('error-updating-' + callKey, {
                            "key": key,
                            "error": {"message": error.message}
                        });
                    }
                });
            });

            socket.on('deploy', function(data){
                var key = data.key;
                var callKey = data.callKey;
                console.log("Deploying package: ", key);

                DeployBug.deployPackage(key, function(error, logs){
                    if(!error){
                        console.log('Package ' + key + ' deployed successfully');
                        socket.emit('deployed-' + callKey, {
                            "key": key,
                            "message": 'Package ' + key + ' deployed successfully'
                        })
                    } else {
                        console.log('Deployment failed for package' + key + ': \n Error: ' + error.message + error.stack);
                        socket.emit('error-deploying-' + callKey, {
                            "key": key,
                            "error": {"message": error.message}
                        });
                    }
                });
            });

            socket.on('start', function(data){
                var key = data.key;
                var callKey = data.callKey;
                console.log("Starting package: ", key);

                DeployBug.startPackage(key, function(error, logs){
                    if(!error){
                        console.log('Package ' + key + ' started successfully');
                        socket.emit('started-' + callKey, {
                            "key": key,
                            "message": 'Package ' + key + ' started successfully'
                        })
                    } else {
                        console.log('Start failed for package' + key + ': \n Error: ' + error.message + error.stack);
                        socket.emit('error-starting-' + callKey, {
                            "key": key,
                            "error": {"message": error.message}
                        });
                    }
                });
            });

            socket.on('stop', function(data){
                var key = data.key;
                var callKey = data.callKey;
                console.log("Stopping package: ", key);

                DeployBug.stopPackage(key, function(error, logs){
                    if(!error){
                        console.log('Package ' + key + ' stopped successfully');
                        socket.emit('stopped-' + callKey, {
                            "key": key,
                            "message": 'Package ' + key + ' stopped successfully'
                        })
                    } else {
                        console.log('Stop failed for package' + key + ': \n Error: ' + error.message + error.stack);
                        socket.emit('error-stopping-' + callKey, {
                            "key": key,
                            "error": {"message": error.message}
                        });
                    }
                });
            });

            socket.on('restart', function(data){
                var key = data.key;
                var callKey = data.callKey;
                console.log("Restarting package: ", key);

                DeployBug.restartPackage(key, function(error, logs){
                    if(!error){
                        console.log('Package ' + key + ' restarted successfully');
                        socket.emit('restarted-' + callKey, {
                            "key": key,
                            "message": 'Package ' + key + ' restarted successfully'
                        })
                    } else {
                        console.log('Restart failed for package' + key + ': \n Error: ' + error.message + error.stack);
                        socket.emit('error-restarting-' + callKey, {
                            "key": key,
                            "error": {"message": error.message}
                        });
                    }
                });
            });
        });

        callback();
    },

    start: function(){
        console.log("Starting DeployBugServer...");
        var app = DeployBugServer.app(); //express

        //TODO: Allow this value to be configurable using a configuration json file.
        var port = DeployBugServer.port || 8000;

        DeployBugServer.configure(app, express, function(){
            console.log("DeployBugServer configured");
        });

        DeployBugServer.enableRoutes(app, express, function(){
            console.log("DeployBugServer routes enabled");
        });

        // Create Server
        var server = http.createServer(app);

        //TODO: Namespace the sockets
        DeployBugServer.enableSockets(server, function(){
            console.log("DeployBugServer sockets enabled");
        });

        server.listen(port, function(){
            console.log("DeployBugServer successfully started");
            console.log("DeployBugServer listening on port " + port);
        });
    }
};


//-------------------------------------------------------------------------------
// Exports
//-------------------------------------------------------------------------------

bugpack.export('deploybugserver.DeployBugServer', DeployBugServer);
