//-------------------------------------------------------------------------------
// Requires
//-------------------------------------------------------------------------------

//@Require('deploybug.DeployBugClient')
//@Require('bugfs.BugFs')


//-------------------------------------------------------------------------------
// Common Modules
//-------------------------------------------------------------------------------

var bugpack = require('bugpack').context(module);
var BugFs = bugpack.require('bugfs.BugFs');
var path = require('path');
var http = require('http');


//-------------------------------------------------------------------------------
// BugPack
//-------------------------------------------------------------------------------

var DeployBugClient =    bugpack.require('deploybug.DeployBugClient');


//-------------------------------------------------------------------------------
// 
//-------------------------------------------------------------------------------

var argv = process.argv;
var command = argv[2];
var options = {};
if (!command) {
    throw new Error("Must specify a command such as start or stop");
}

var isValidJSON = function(jsonString) {
    var json;
    try {
        json = JSON.parse(jsonString);
        return json;
    } catch (e) {
        return false;
    }
};

var findFlagValues = (function(){
    var flags = {
        '-s': 'server',
        '--server': 'server',
        '-p': 'port',
        '--port': 'port',
        '-k': 'key',
        '--key': 'key',
        '-d': 'description',
        '--description': 'description'
    };
    var flagRegExp = /^(-|--)/;
    for (var i = 3; i < argv.length; i++ ) {
        var flag = argv[i];
        if (flagRegExp.test(flag)) {
            options[flags[flag]] = argv[i + 1];
        }
    }
})();

if (command === '-h' || command === '--help') {
    var helpText = BugFs.readFileSync(path.resolve('scripts/help.txt'), 'utf8');
    console.log(helpText);
    
} else if (command === 'register') {
    var descriptionPath = path.resolve(options['description']);
    var descriptionJSON = isValidJSON(BugFs.readFileSync(descriptionPath, 'utf8'));
    var server = options['server'];
    var port = options['port'];
    console.log('description: ' + JSON.stringify(descriptionJSON));
    console.log('server: ' + server);
    console.log('port: ' + port);
    console.log('Waiting for response from DeployBugServer...');
    
    if(descriptionJSON){
        DeployBugClient.registerPackage(descriptionJSON, server, port, function(error){
            if (error) {
               console.log(error);
               console.log(error.stack);
               process.exit(1);
           } else {
               console.log("Package successfully registered on DeployBugServer: " + server + " " + port);
           }
        });
    } else {
        console.log("Invalid JSON");
    }

    
} else if (command === "deploy") {
    var key = options['key'];
    var server = options['server'];
    var port = options['port'];
    console.log('key: ' + key);
    console.log('server: ' + server);
    console.log('port: ' + port);
    console.log('Waiting for response from DeployBugServer...');
    
    DeployBugClient.deployPackage(key, server, port, function(error){
        if (error) {
           console.log(error);
           console.log(error.stack);
           process.exit(1);
       } else {
           console.log("Package " + key + " successfully deployed to nodes from DeployBugServer: " + server);
       }
    });
    
} else {
    throw new Error("Unknown command '" + command + "'");
}