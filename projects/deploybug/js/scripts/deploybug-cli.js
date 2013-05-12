//-------------------------------------------------------------------------------
// Requires
//-------------------------------------------------------------------------------

//@Require('bugflow.BugFlow')
//@Require('bugfs.BugFs')
//@Require('deploybug.DeployBugClient')


//-------------------------------------------------------------------------------
// Common Modules
//-------------------------------------------------------------------------------

var bugpack = require('bugpack').context(module);
var http = require('http');
var path = require('path');


//-------------------------------------------------------------------------------
// BugPack
//-------------------------------------------------------------------------------

var BugFlow =           bugpack.require('bugflow.BugFlow');
var BugFs =             bugpack.require('bugfs.BugFs');
var DeployBugClient =   bugpack.require('deploybug.DeployBugClient');


//-------------------------------------------------------------------------------
// Simplify References
//-------------------------------------------------------------------------------

var $series =   BugFlow.$series;
var $task =     BugFlow.$task;


//-------------------------------------------------------------------------------
// Variables
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
var options = {};
var actions = [];
var configFilePath = path.resolve(__dirname, '../config/DeployBugClient.config.json');
var environment = process.env.NODE_ENV || "development";


//-------------------------------------------------------------------------------
// Validations
//-------------------------------------------------------------------------------

if (!argv[2]) {
    throw new Error("Must specify an action such as start or stop");
}


//-------------------------------------------------------------------------------
// Parse Arguments
//-------------------------------------------------------------------------------

var setOptionsAndActions = (function(){
    // NOTE: Currently only server and port defaults are supported.
    // Supporting key and description defaults may cause more unintended consequences than benefits.
    var getAndSetDefaultOptions = (function(){
        if(BugFs.existsSync(configFilePath)){
            var configJSON = toJSON(BugFs.readFileSync(configFilePath, 'utf8'));
        } else {
            var configJSON = {
                "development": {
                    "server": "http://localhost",
                    "port": 8000
                }
            };
        }

        var optionsProperties = ["serverHostName", "serverPort"];
        optionsProperties.forEach(function(property){
             if (configJSON[environment][property]) {
                    options[property] = configJSON[environment][property];
                }
        });
    })();

    var optionFlags = {
        '-s': 'serverHostName',
        '--server': 'serverHostName',
        '-p': 'serverPort',
        '--port': 'serverPort',
        '-k': 'key',
        '--key': 'key',
        '-d': 'descriptionPath',
        '--description': 'descriptionPath',
        'run': 'command'
    };

    var actionFlags = {
        'help': function(){
            actions.push('help');
        },
        '-h': function(){
            actions.push('help');
        },
        '--help': function(){
            actions.push('help');
        },
        'configure': function(){
            actions.push('configure');
        },
        'config': function(){
            actions.push('configure');
        },
        'register': function(){
            actions.push('registerDescription');
        },
        'update': function(){
            actions.push('updateDescription');
        },
        'run': function(){
            actions.push('runCommand');
        },
        'registry': function(){
            actions.push('registry');
        }
    }

    // parse arguments and set actions and options
    // later options override earlier ones if duplicates are given
    // currently ignores unknown actions
    for (var i = 2; i < argv.length; i++ ) {
        var flag = argv[i];
        if(actionFlags[flag]){
            actionFlags[flag]();
        } 
        if (optionFlags[flag]) {
            options[optionFlags[flag]] = argv[i + 1];
        }
    }

    // convert descriptionPath to descriptionJSON
    // cleans up options object
    // validates JSON
    if(options.descriptionPath) {
        var descriptionPath = path.resolve(options.descriptionPath);
        options.descriptionJSON = toJSON(BugFs.readFileSync(descriptionPath, 'utf8'));
        delete options.descriptionPath;

        if(options.descriptionJSON === null){
            throw new Error(descriptionPath + " is not valid JSON");
        }
    }
})();


//-------------------------------------------------------------------------------
// Execute Actions
//-------------------------------------------------------------------------------
console.log(options);

var deployBugClient = new DeployBugClient(options, function(){
   console.log("DeployBugClient initialized");
});

var flowArray = [];
actions.forEach(function(action){
    if(action === 'help'){
        var helpText = BugFs.readFileSync(path.resolve('scripts/help.txt'), 'utf8');
        console.log(helpText);
    } else if(action === 'configure'){
        // Note: Configuration options persist in the ../config/DeployBugClient.config.json file.
        if(options.serverHostName){
            configJSON[environment]["serverHostName"] = options.serverHostName;
            console.log("Server hostname for '" + environment + "' environment updated to " + options.serverHostName);
        }

        if(options.serverPort){
            configJSON[environment]["serverPort"] = parseInt(options.serverPort, 10);
            console.log("Server port for '" + environment + "' environment updated to " + options.serverPort);
        }

        if (!BugFs.existsSync(path.resolve(__dirname, '../config'))){
            BugFs.createDirectorySync(path.resolve(__dirname, '../config'));
        }

        BugFs.writeFileSync(configFilePath, JSON.stringify(configJSON), 'utf8');
        console.log("Config file saved.");
    } else {
        
        flowArray.push($task(function(flow){ 
            deployBugClient[action](options, function(error, data){ 
                if(!error){
                    console.log(action + ' task completed');
                    console.log("Return Data: ", data);
                } else {
                    console.log(error);
                    console.log("Return Data: ", data);
                }
                flow.complete(error);
            });
        }));
    }
});

$series(flowArray).execute(function(error){
    if(!error){
        console.log("All tasks completed without error");
    } else {
        console.log(error);
    }
    process.exit(1);
});