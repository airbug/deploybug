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

var toJSON = function toJSON(jsonString) {
    var json;
    try {
        json = JSON.parse(jsonString);
        return json;
    } catch (e) {
        return null;
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
    var descriptionJSON = toJSON(BugFs.readFileSync(descriptionPath, 'utf8'));
    var server = options['server'];
    var port = options['port'];
    console.log('description string: ' + JSON.stringify(descriptionJSON));
    console.log('server: ' + server);
    console.log('port: ' + port);
    
    if(descriptionJSON){
        console.log('Waiting for response from DeployBugServer...');
        DeployBugClient.registerPackage(descriptionJSON, server, port);
    } else {
        console.log(descriptionPath + " is not valid JSON");
    }


} else if (command === "update") {
    var key = options['key'];
    var descriptionPath = path.resolve(options['description']);
    var descriptionJSON = toJSON(BugFs.readFileSync(descriptionPath, 'utf8'));
    var server = options['server'];
    var port = options['port'];
    console.log('description string: ' + JSON.stringify(descriptionJSON));
    console.log('server: ' + server);
    console.log('port: ' + port);
    
    if(descriptionJSON){
        console.log('Waiting for response from DeployBugServer...');
        DeployBugClient.updatePackage(key, descriptionJSON, server, port);
    } else {
        console.log(descriptionPath + " is not valid JSON");
    }

} else if (command === "deploy") {
    var key = options['key'];
    var server = options['server'];
    var port = options['port'];
    console.log('key: ' + key);
    console.log('server: ' + server);
    console.log('port: ' + port);
    console.log('Waiting for response from DeployBugServer...');

    DeployBugClient.deployPackage(key, server, port);

} else if (command === "start") {
    var key = options['key'];
    var server = options['server'];
    var port = options['port'];
    console.log('key: ' + key);
    console.log('server: ' + server);
    console.log('port: ' + port);
    console.log('Waiting for response from DeployBugServer...');

    DeployBugClient.startPackage(key, server, port);

} else if (command === "stop") {
    var key = options['key'];
    var server = options['server'];
    var port = options['port'];
    console.log('key: ' + key);
    console.log('server: ' + server);
    console.log('port: ' + port);
    console.log('Waiting for response from DeployBugServer...');

    DeployBugClient.stopPackage(key, server, port);

} else {
    throw new Error("Unknown command '" + command + "'");
}