//-------------------------------------------------------------------------------
// Annotations
//-------------------------------------------------------------------------------

//@Package('deploybugnode')

//@Export('PackageCommand')

//-------------------------------------------------------------------------------
// Common Modules
//-------------------------------------------------------------------------------

var bugpack         = require('bugpack').context(module);
var child_process   = require('child_process');

//-------------------------------------------------------------------------------
// Declare Class
//-------------------------------------------------------------------------------

var PackageCommand = {
    execute: function(key, commandString, options, callback){
        var logs = [];
        console.log("Executing command: ", commandString);

        //TODO BRN: Change out this call for child_process.spawn. this will prevent buffer overflow errors.

        child_process.exec(commandString, options, function (error, stdout, stderr) {
            console.log('stdout: ' + stdout);
            console.log('stderr: ' + stderr);
            logs.push('stdout: ' + stdout);
            logs.push('stderr: ' + stderr);
            if (error !== null) {
                console.log('exec error: ' + error);
                logs.push('exec error: ' + error);
                callback(error, logs.join("\n"));
            } else {
                callback(null, logs.join("\n"));
            }
        });
    }
};


//-------------------------------------------------------------------------------
// Exports
//-------------------------------------------------------------------------------

bugpack.export('deploybugnode.PackageCommand', PackageCommand);