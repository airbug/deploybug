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

var deployBugServer = bugpack.require('deploybug.DeployBugServer');


//-------------------------------------------------------------------------------
// Bootstrap
//-------------------------------------------------------------------------------

// TODO: this should create a new instance of DeployBugServer
// var deployBugServer = new DeployBugServer();
// or var deployBugServer = bugpack.require('deploybug.DeployBugServer');

deployBugServer.start(function(error) {
    if (error) {
        console.log(error);
        console.log(error.stack);
        process.exit(1);
    } else {
        console.log("DeployBug server successfully started");
    }
});
