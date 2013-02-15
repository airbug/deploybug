//-------------------------------------------------------------------------------
// Annotations
//-------------------------------------------------------------------------------

//@Package('deploybug')

//@Export('DeployBugServer')

//@Require('bugfs.BugFs')
//@Require('deploybug.DeployBug')

//-------------------------------------------------------------------------------
// Requires
//-------------------------------------------------------------------------------

var express = require("express");
require('express-namespace');
var http = require('http');
var path = require('path');

var bugpack =   require('bugpack').context(module);
var BugFs =     bugpack.require('bugfs.BugFs');
var DeployBug = bugpack.require('deploybug.DeployBug');

//-------------------------------------------------------------------------------
// Build App
//-------------------------------------------------------------------------------

var DeployBugServer = {
    port: null
};

DeployBugServer.app = function(){
    var app = express();
    
    DeployBugServer.configure(app, express, function(){
        console.log("Express server configured");
    });
    
    DeployBugServer.enableRoutes(app, express, function(){
        console.log("Routes Enabled");
    });
    
    return app;
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
    
    app.namespace('/deploybug/packages', function(){ //DONOT DOUBLE NEST NAMESPACES!!
        app.get('/registry/index', function(req, res){
             var packageRegistryKeys = DeployBug.getPackageRegistryKeys();
             res.json({packageRegistryKeys: packageRegistryKeys});
             res.end();
         });

         app.get('/registry/:key', function(req, res){
             var key = req.params.key;
             var description = DeployBugServer.packageRegistry.get(key);
             res.json(description);
             res.end();
         });

         app.post('/register', function(req, res) {
             // registration descriptions, currently stored in DeployBugServer.registry, will eventually be stored in a database
             //curl example: curl -v -H "Accept: application/json" -H "Content-type: application/json" -X POST -d '{"key":"XYZ"}'  http://localhost:8000/deploybug/packages/register
             /*
              * {
              *  key: string,
              *  packageURL: (string | Path),
              *  deployScriptPath: (string | Path), //unneccesary. should be same deploybug script for all deploybug packages
              *  startScriptPath: (string | Path),
              *  stopScriptPath: (string | Path),
              *  nodes: Array.<{hostname: string, port: number, type: string }>
              * } description
              */
             var description = req.body;
             DeployBug.registerPackage(description, function(error){
                 if(!error){
                     console.log('Registry successfully updated with: ' + description.key + description.toString());
                     res.send('Registration Successful');
                 } else {
                     res.send('Error: Registration Failed');
                 }
             });

             res.end();
         });

         app.post(':key/deploy', function(req, res) {
             var key = req.params.key;
             /*
              * {
              *  key: string, 
              *  nodes: (<Array> | string) // Array of node IDs or string specifying type, e.g. all 'application' servers, all 'database' servers, all 'redis' servers, etc. 
              *  } req.body
              */
             DeployBug.deployPackage(key, function(error){
                 if(!error){
                     res.send('Deployment Successful');
                 } else {
                     res.send('Error: Deployment Failed');
                 }
             });

             res.end();
         });
    });
    
    callback();
};

DeployBugServer.start = function(){
    var app = DeployBugServer.app();
    var port = DeployBugServer.port || 8000;
    
    // Create Server
    http.createServer(app).listen(port, function(){
      console.log("Express server listening on port " + port);
    });
};

//-------------------------------------------------------------------------------
// Exports
//-------------------------------------------------------------------------------

bugpack.export('deploybug.DeployBugServer', DeployBugServer);
