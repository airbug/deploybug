//-------------------------------------------------------------------------------
// Requires
//-------------------------------------------------------------------------------

var bugpack = require('bugpack').context(module);

//-------------------------------------------------------------------------------
// BugPack
//-------------------------------------------------------------------------------

var DeployBugClient = bugpack.require('deploybug.DeployBugClient');

//-------------------------------------------------------------------------------
// Exports
//-------------------------------------------------------------------------------

module.exports = DeployBugClient;
