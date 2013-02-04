//-------------------------------------------------------------------------------
// Requires
//-------------------------------------------------------------------------------

//@Package('deploybug-server')

//@Export('DeployBugServerCli')

//@Require('bugflow.BugFlow')
//@Require('bugfs.BugFs')


//-------------------------------------------------------------------------------
// Common Modules
//-------------------------------------------------------------------------------

var bugpack = require('bugpack').context(module);


//-------------------------------------------------------------------------------
// BugPack
//-------------------------------------------------------------------------------

var BugFlow =   bugpack.require('bugflow.BugFlow');
var BugFs =     bugpack.require('bugfs.BugFs');


//-------------------------------------------------------------------------------
// Simplify References
//-------------------------------------------------------------------------------

var $if = BugFlow.$if;
var $series = BugFlow.$series;
var $task = BugFlow.$task;


//-------------------------------------------------------------------------------
// Declare Class
//-------------------------------------------------------------------------------

var DeployBugServerCli = {};


//-------------------------------------------------------------------------------
// Private Static Variables
//-------------------------------------------------------------------------------



//-------------------------------------------------------------------------------
// Public Static Methods
//-------------------------------------------------------------------------------

/**
 * @param {function(Error)} callback
 */
DeployBugServerCli.start = function(callback) {
    $series([

    ]).execute(function(error) {
        if (callback) {
            callback(error);
        }
    });
};


//-------------------------------------------------------------------------------
// Private Static Methods
//-------------------------------------------------------------------------------

/**
 * @param {string} installPath
 * @param {function(Error)} callback
 */
BugUnitCli.createInstallDir = function(installPath, callback) {
    BugFs.createDirectory(installPath + "/node_modules", callback);
};

/**
 * @private
 * @param {string} modulePath
 * @param {string} installPath
 * @param {function(Error, Object)} callback
 */
BugUnitCli.installNodeModule = function(modulePath, installPath, callback) {
    BugUnitCli.getModuleData(modulePath, function(error, moduleData) {
        if (!error) {
            var child = child_process.exec('npm install "' + modulePath + '"', {cwd: installPath, env: process.env},
                function (error, stdout, stderr) {
                    if (!error) {
                        var installedPath = BugFs.joinPaths([installPath, "node_modules", moduleData.name]).getAbsolutePath();
                        var data = {
                            installedPath: installedPath,
                            name: moduleData.name,
                            version: moduleData.version
                        };
                        callback(null, data);
                    } else {
                        console.log(stderr);
                        callback(error);
                    }
                }
            );
        } else {
            callback(error);
        }
    });
};

/**
 * @private
 * @param {string} modulePathString
 * @param {function(Error, {
    *      name: string,
 *      version: string
 * })} callback
 */
BugUnitCli.getModuleData = function(modulePathString, callback) {
    var modulePath = BugFs.path(modulePathString);
    var moduleData = null;
    $if (function(flow) {
            modulePath.isDirectory(function(error, result) {
                if (!error) {
                    flow.assert(result);
                } else {
                    flow.error(error);
                }
            });
        },
        $task(function(flow) {
            BugUnitCli.getModuleDataFromFolder(modulePath, function(error, data) {
                if (!error) {
                    moduleData = data;
                    flow.complete();
                } else {
                    flow.error(error);
                }
            });
        })
    ).$elseIf (function(flow) {
            modulePath.isFile(function(error, result) {
                if (!error) {
                    flow.assert(result);
                } else {
                    flow.error(error);
                }
            });
        },
        $task(function(flow) {
            var ext = BugFs.path(modulePath).getExtName();
            if (ext === ".tgz") {
                BugUnitCli.getModuleDataFromTarball(modulePath, function(error, data) {
                    if (!error) {
                        moduleData = data;
                        flow.complete();
                    } else {
                        flow.error(error);
                    }
                });
            } else {
                flow.error(new Error("Not a module '" + modulePath.getAbsolutePath() + "'"));
            }
        })
    ).$else (
        $task(function(flow) {
            flow.error(new Error("Cannot open module '" + modulePath.getAbsolutePath() + "' because it is an " +
                "unknown type."));
        })
    ).execute(function(error) {
            callback(error, moduleData);
        });
};

/**
 * @private
 * @param {Path} modulePath
 * @param {function(Error, {
    *     name: string,
 *     version: string
 * })} callback
 */
BugUnitCli.getModuleDataFromFolder = function(modulePath, callback) {
    var packageJsonPath = BugFs.joinPaths(modulePath, "package.json");
    var moduleData = {};
    $if (function(flow) {
            packageJsonPath.isFile(function(error, result) {
                if (!error) {
                    flow.assert(result);
                } else {
                    flow.error(error);
                }
            });
        },
        $task(function(flow) {
            //TODO BRN: retrieve the name and version data from the package.json file
        })
    ).$else (
        $task(function(flow) {
            flow.error(new Error("Cannot get module data from '" + modulePath.getAbsolutePath() + "' because " +
                "the package.json file cannot be found"));
        })
    ).execute(function(error) {
            if (!error) {
                callback(null, moduleData);
            } else {
                callback(error);
            }
        });
};

/**
 * @private
 * @param {Path} modulePath
 * @param {function(Error, {
    *     name: string,
 *     version: string
 * })} callback
 */
BugUnitCli.getModuleDataFromTarball = function(modulePath, callback) {
    var moduleData = null;
    var packageJsonFound = false;
    var readStream = fs.createReadStream(modulePath.getAbsolutePath());
    readStream.pipe(zlib.createGunzip()).pipe(tar.Parse())
        .on("entry", function (entry) {
            if (entry.props.path === "package/package.json") {
                packageJsonFound = true;
                var jsonString = "";
                entry.on("data", function (c) {
                    jsonString += c.toString();
                });
                entry.on("end", function () {
                    moduleData = JSON.parse(jsonString);

                    //TODO BRN: No need to look any further

                    //readStream.destroy();
                });
            }
        })
        .on("end", function() {
            readStream.destroy();
            if (!packageJsonFound) {
                callback(new Error("Could not find package.json in file '" + modulePath.getAbsolutePath() + "'"));
            } else {
                callback(null, moduleData);
            }
        });
};

//-------------------------------------------------------------------------------
// Exports
//-------------------------------------------------------------------------------

bugpack.export('bugunit.BugUnitCli', BugUnitCli);
