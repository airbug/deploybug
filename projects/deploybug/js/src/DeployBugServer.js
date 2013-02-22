//TODO LIST
// 1) Security. How do we protect these api endpoints?

//-------------------------------------------------------------------------------
// Annotations
//-------------------------------------------------------------------------------

//@Package('deploybug')

//@Export('DeployBugServer')

//@Require('deploybug.DeployBug')


//-------------------------------------------------------------------------------
// Requires
//-------------------------------------------------------------------------------

var express = require("express");
require('express-namespace');
var http = require('http');
var path = require('path');
var bugpack =   require('bugpack').context(module);

//-------------------------------------------------------------------------------
// BugPack
//-------------------------------------------------------------------------------

var DeployBug = bugpack.require('deploybug.DeployBug');


//-------------------------------------------------------------------------------
// Build App
//-------------------------------------------------------------------------------

var DeployBugServer = {
    port: null
};

DeployBugServer.app = function(){
    return express();
};

DeployBugServer.configure = function(app, express, callback){
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
};

DeployBugServer.enableRoutes = function(app, express, callback){
    app.get('/index', function(req, res){
       res.send("hello this is the deploybugserver");
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
             // registration descriptions, currently stored in DeployBugServer.registry, will eventually be stored in a database ?
             //curl example: curl -v -H "Accept: application/json" -H "Content-type: application/json" -X POST -d '{"key":"XYZ"}'  http://localhost:8000/deploybug/packages/register
             /*
              * {
              *  key: string,
              *  packageURL: (string | Path),
              *  packageType: string,
              *  startScriptPath: (string | Path),
              * } description
              */
             var descriptionJSON = req.body;
             console.log('request body: ' + descriptionJSON);
             DeployBug.registerPackage(descriptionJSON, function(error){
                 if(!error){
                     console.log('Package registration successful for package ' + descriptionJSON.key);
                     res.send('Package registration successful for package ' + descriptionJSON.key);
                 } else {
                     res.send('Registration for package ' + descriptionJSON.key + ' failed. \n Error: ' + error.message + error.stack); //NOTE: REMOVE error.stack for production
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
                     res.send('Registration Failed: \n Error: ' + error.message + error.stack); //NOTE: REMOVE error.stack for production
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
};

DeployBugServer.start = function(){
    console.log("Starting DeployBugServer...");
    var app = DeployBugServer.app();

    //TODO: Allow this value to be configurable using a configuration json file.
    var port = DeployBugServer.port || 8000;

    DeployBugServer.configure(app, express, function(){
        console.log("DeployBugServer configured");
    });

    DeployBugServer.enableRoutes(app, express, function(){
        console.log("DeployBugServer routes enabled");
    });

    // Create Server
    http.createServer(app).listen(port, function(){
        console.log("DeployBugServer successfully started");
        console.log("DeployBugServer listening on port " + port);
    });
};

//-------------------------------------------------------------------------------
// Exports
//-------------------------------------------------------------------------------

bugpack.export('deploybug.DeployBugServer', DeployBugServer);
