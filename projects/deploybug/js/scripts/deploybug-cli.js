//-------------------------------------------------------------------------------
// Requires
//-------------------------------------------------------------------------------

//@Require('deploybug.DeployBugClient')
//@Require('bugfs.BugFs')


//-------------------------------------------------------------------------------
// Common Modules
//-------------------------------------------------------------------------------

var bugpack = require('bugpack').context(module);
var path = require('path');
var http = require('http');

//-------------------------------------------------------------------------------
// BugPack
//-------------------------------------------------------------------------------

var BugFs =             bugpack.require('bugfs.BugFs');
var DeployBugClient =   bugpack.require('deploybug.DeployBugClient');


//-------------------------------------------------------------------------------
// 
//-------------------------------------------------------------------------------


var toJSON = function toJSON(jsonString) {
    try {
        return JSON.parse(jsonString);
    } catch (e) {
        console.log("Cannot parse to JSON: " + e);
        return null;
    }
};

var argv = process.argv;
var command = argv[2];
var options = {};
var configFilePath = '../config/DeployBugClient.config.json';
var configJSON = toJSON(BugFs.readFileSync(path.resolve(configFilePath), 'utf8'));
var environment = process.env.NODE_ENV || "development";

var setOptions = (function setOptions(){
    // find flag values
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

    // replace undefined values with defaults
    var optionProperties = ["server", "port", "key", "description"];
    for(var index in optionProperties){
        var property = optionProperties[index];
        if (options[property] == null) {
            options[property] = configJSON[environment][property];
        }
    }
})();

//-------------------------------------------------------------------------------
// 
//-------------------------------------------------------------------------------

if (!command) {
    throw new Error("Must specify a command such as start or stop");
}

if (command === '-h' || command === '--help') {
    var helpText = BugFs.readFileSync(path.resolve('scripts/help.txt'), 'utf8');
    console.log(helpText);

} else if (command === 'config' || command === 'configure') {
    var server = options['server'];
    var port = options['port'];
    var key = options['key'];
    var description = options['description'];
    
    if(server){
        configJSON[environment]["server"] = server;
        console.log("Server hostname for '" + environment + "' environment updated to " + server);
    }
    
    if(port){
        configJSON[environment]["port"] = parseInt(port, 10);
        console.log("Server port for '" + environment + "' environment updated to " + port);
    }
    
    if(key){
        configJSON[environment]["key"] = key;
        console.log("Default key for '" + environment + "' environment is now " + key);
    }
    
    if (description){
        configJSON[environment]["description"] = description;
        console.log("Default description file path for '" + environment + "' environment is now " + description);
    }

    BugFs.writeFileSync(configFilePath, JSON.stringify(configJSON), 'utf8');
    console.log("Config file saved.");


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

} else if (command === "restart") {
    var key = options['key'];
    var server = options['server'];
    var port = options['port'];
    console.log('key: ' + key);
    console.log('server: ' + server);
    console.log('port: ' + port);
    console.log('Waiting for response from DeployBugServer...');

    DeployBugClient.restartPackage(key, server, port);

} else {
    throw new Error("Unknown command '" + command + "'");
}