//-------------------------------------------------------------------------------
// Requires
//-------------------------------------------------------------------------------

//@Require('deploybug-server.DeployBugServerCli')


//-------------------------------------------------------------------------------
// Common Modules
//-------------------------------------------------------------------------------

var bugpack = require('bugpack').context(module);
var path = require('path');


//-------------------------------------------------------------------------------
// BugPack
//-------------------------------------------------------------------------------

var DeployBugServerCli =    bugpack.require('deploybug-server.DeployBugServerCli');


//-------------------------------------------------------------------------------
// Bootstrap
//-------------------------------------------------------------------------------

var command = process.argv[2];

if (!command) {
    throw new Error("Must specify a command such as start or stop");
}

if (command === "start") {
    DeployBugServerCli.start(function(error) {
        if (error) {
            console.log(error);
            console.log(error.stack);
            process.exit(1);
        } else {
            console.log("DeployBug server successfully started");
        }
    });
} else if (command === "stop") {
    DeployBugServerCli.stop(function(error) {
        if (error) {
            console.log(error);
            console.log(error.stack);
            process.exit(1);
        } else {
            console.log("DeployBug server successfully stopped");
        }
    });
} else {
    throw new Error("Unknown command '" + command + "'");
}
