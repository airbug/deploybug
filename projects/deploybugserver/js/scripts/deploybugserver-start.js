//-------------------------------------------------------------------------------
// Annotations
//-------------------------------------------------------------------------------

//@Require('deploybugserver.DeployBugServer')


//-------------------------------------------------------------------------------
// Common Modules
//-------------------------------------------------------------------------------

var bugpack = require('bugpack').context(module);

//-------------------------------------------------------------------------------
// BugPack
//-------------------------------------------------------------------------------

var DeployBugServer = bugpack.require('deploybugserver.DeployBugServer');


//-------------------------------------------------------------------------------
// Bootstrap
//-------------------------------------------------------------------------------

// TODO: this should create a new instance of DeployBugServer
// var deployBugServer = new DeployBugServer();
// or var deployBugServer = bugpack.require('deploybug.DeployBugServer');

DeployBugServer.start();
