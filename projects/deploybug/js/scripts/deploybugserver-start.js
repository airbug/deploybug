//-------------------------------------------------------------------------------
// Requires
//-------------------------------------------------------------------------------

//@Require('deploybug.DeployBugServer')


//-------------------------------------------------------------------------------
// Common Modules
//-------------------------------------------------------------------------------

var bugpack = require('bugpack').context(module);

//-------------------------------------------------------------------------------
// BugPack
//-------------------------------------------------------------------------------

var DeployBugServer = bugpack.require('deploybug.DeployBugServer');


//-------------------------------------------------------------------------------
// Bootstrap
//-------------------------------------------------------------------------------

// TODO: this should create a new instance of DeployBugServer
// var deployBugServer = new DeployBugServer();
// or var deployBugServer = bugpack.require('deploybug.DeployBugServer');

DeployBugServer.start();
