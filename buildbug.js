//-------------------------------------------------------------------------------
// Requires
//-------------------------------------------------------------------------------

var buildbug = require('buildbug');


//-------------------------------------------------------------------------------
// Simplify References
//-------------------------------------------------------------------------------

var buildProject = buildbug.buildProject;
var buildProperties = buildbug.buildProperties;
var buildTarget = buildbug.buildTarget;
var enableModule = buildbug.enableModule;
var parallel = buildbug.parallel;
var series = buildbug.series;
var targetTask = buildbug.targetTask;


//-------------------------------------------------------------------------------
// Enable Modules
//-------------------------------------------------------------------------------

var aws = enableModule("aws");
var bugpack = enableModule('bugpack');
var bugunit = enableModule('bugunit');
var core = enableModule('core');
var nodejs = enableModule('nodejs');


//-------------------------------------------------------------------------------
// Declare Properties
//-------------------------------------------------------------------------------

buildProperties({
    deploybug: {
        packageJson: {
            name: "deploybug",
            version: "0.0.2",
            main: "./lib/DeployBugClient.js",
            bin: "bin/deploybug",
            dependencies: {
                bugpack: "https://s3.amazonaws.com/airbug/bugpack-0.0.3.tgz"
            },
            scripts: {
                start: "node ./scripts/start.js" //??
            }
        },
        sourcePaths: [
            "./projects/deploybug/js/src",
            "../bugjs/projects/bugjs/js/src",
            '../bugjs/projects/bugflow/js/src',
            '../bugjs/projects/bugboil/js/src',
            "../bugjs/projects/bugfs/js/src",
            "../bugjs/projects/annotate/js/src",
            "../bugunit/projects/bugunit/js/src"
        ],
        scriptPaths: [
            "./projects/deploybug/js/scripts",
            "../bugunit/projects/bugunit/js/scripts"
        ],
        testPaths: [
            "../bugjs/projects/bugjs/js/test"
        ],
        binPaths: [
            "./projects/deploybug/bin"
        ]
    },
    deploybugserver: {
        packageJson: {
            name: "deploybugserver",
            version: "0.0.2",
            main: "./lib/DeployBugServer.js",
            dependencies: {
                bugpack: "https://s3.amazonaws.com/airbug/bugpack-0.0.3.tgz"
            },
            scripts: {
                start: "node ./scripts/start.js"
            }
        },
        sourcePaths: [
            "./projects/deploybugserver/js/src",
            "../bugjs/projects/bugjs/js/src",
            '../bugjs/projects/bugflow/js/src',
            '../bugjs/projects/bugboil/js/src',
            "../bugjs/projects/bugfs/js/src",
            "../bugjs/projects/annotate/js/src",
            "../bugunit/projects/bugunit/js/src"
        ],
        scriptPaths: [
            "./projects/deploybugserver/js/scripts",
            "../bugunit/projects/bugunit/js/scripts"
        ],
        testPaths: [
            "../bugjs/projects/bugjs/js/test"
        ]
    }
});


//-------------------------------------------------------------------------------
// Declare Tasks
//-------------------------------------------------------------------------------


//-------------------------------------------------------------------------------
// Declare Flows
//-------------------------------------------------------------------------------

// Clean Flow
//-------------------------------------------------------------------------------

buildTarget('clean').buildFlow(
    targetTask('clean')
);


// Local Flow
//-------------------------------------------------------------------------------

//TODO BRN: Local development of node js and client side projects should "create" the packages and package them up but
// the sources should be symlinked to instead

buildTarget('local').buildFlow(
    series([

        // TODO BRN: This "clean" task is temporary until we're not modifying the build so much. This also ensures that
        // old source files are removed. We should figure out a better way of doing that.

        targetTask('clean'),
        parallel([
            series([
                targetTask('createNodePackage', {
                    properties: {
                        packageJson: buildProject.getProperty("deploybug.packageJson"),
                        sourcePaths: buildProject.getProperty("deploybug.sourcePaths"),
                        scriptPaths: buildProject.getProperty("deploybug.scriptPaths"),
                        testPaths: buildProject.getProperty("deploybug.testPaths"),
                        binPaths: buildProject.getProperty("deploybug.binPaths")
                    }
                }),
                targetTask('generateBugPackRegistry', {
                    init: function(task, buildProject, properties) {
                        var nodePackage = nodejs.findNodePackage(
                            buildProject.getProperty("deploybug.packageJson.name"),
                            buildProject.getProperty("deploybug.packageJson.version")
                        );
                        task.updateProperties({
                            sourceRoot: nodePackage.getBuildPath()
                        });
                    }
                }),
                targetTask('packNodePackage', {
                    properties: {
                        packageName: buildProject.getProperty("deploybug.packageJson.name"),
                        packageVersion: buildProject.getProperty("deploybug.packageJson.version")
                    }
                }),
                targetTask('startNodeModuleTests', {
                    init: function(task, buildProject, properties) {
                        var packedNodePackage = nodejs.findPackedNodePackage(
                            buildProject.getProperty("deploybug.packageJson.name"),
                            buildProject.getProperty("deploybug.packageJson.version")
                        );
                        task.updateProperties({
                            modulePath: packedNodePackage.getFilePath()
                        });
                    }
                }),
                targetTask("s3EnsureBucket", {
                    properties: {
                        bucket: buildProject.getProperty("local-bucket")
                    }
                }),
                targetTask("s3PutFile", {
                    init: function(task, buildProject, properties) {
                        var packedNodePackage = nodejs.findPackedNodePackage(buildProject.getProperty("deploybug.packageJson.name"),
                            buildProject.getProperty("deploybug.packageJson.version"));
                        task.updateProperties({
                            file: packedNodePackage.getFilePath(),
                            options: {
                                ACL: 'public-read'
                            }
                        });
                    },
                    properties: {
                        bucket: buildProject.getProperty("local-bucket")
                    }
                })
            ]),
            series([
                targetTask('createNodePackage', {
                    properties: {
                        packageJson: buildProject.getProperty("deploybugserver.packageJson"),
                        sourcePaths: buildProject.getProperty("deploybugserver.sourcePaths"),
                        scriptPaths: buildProject.getProperty("deploybugserver.scriptPaths"),
                        testPaths: buildProject.getProperty("deploybugserver.testPaths"),
                        binPaths: buildProject.getProperty("deploybugserver.binPaths")
                    }
                }),
                targetTask('generateBugPackRegistry', {
                    init: function(task, buildProject, properties) {
                        var nodePackage = nodejs.findNodePackage(
                            buildProject.getProperty("deploybugserver.packageJson.name"),
                            buildProject.getProperty("deploybugserver.packageJson.version")
                        );
                        task.updateProperties({
                            sourceRoot: nodePackage.getBuildPath()
                        });
                    }
                }),
                targetTask('packNodePackage', {
                    properties: {
                        packageName: buildProject.getProperty("deploybugserver.packageJson.name"),
                        packageVersion: buildProject.getProperty("deploybugserver.packageJson.version")
                    }
                }),
                targetTask('startNodeModuleTests', {
                    init: function(task, buildProject, properties) {
                        var packedNodePackage = nodejs.findPackedNodePackage(
                            buildProject.getProperty("deploybugserver.packageJson.name"),
                            buildProject.getProperty("deploybugserver.packageJson.version")
                        );
                        task.updateProperties({
                            modulePath: packedNodePackage.getFilePath()
                        });
                    }
                }),
                targetTask("s3EnsureBucket", {
                    properties: {
                        bucket: buildProject.getProperty("local-bucket")
                    }
                }),
                targetTask("s3PutFile", {
                    init: function(task, buildProject, properties) {
                        var packedNodePackage = nodejs.findPackedNodePackage(buildProject.getProperty("deploybugserver.packageJson.name"),
                            buildProject.getProperty("deploybugserver.packageJson.version"));
                        task.updateProperties({
                            file: packedNodePackage.getFilePath(),
                            options: {
                                ACL: 'public-read'
                            }
                        });
                    },
                    properties: {
                        bucket: buildProject.getProperty("local-bucket")
                    }
                })
            ])
        ])
    ])
).makeDefault();


// Prod Flow
//-------------------------------------------------------------------------------

buildTarget('prod').buildFlow(
    series([

        // TODO BRN: This "clean" task is temporary until we're not modifying the build so much. This also ensures that
        // old source files are removed. We should figure out a better way of doing that.

        targetTask('clean'),
        parallel([
            series([
                targetTask('createNodePackage', {
                    properties: {
                        packageJson: buildProject.getProperty("deploybug.packageJson"),
                        sourcePaths: buildProject.getProperty("deploybug.sourcePaths"),
                        scriptPaths: buildProject.getProperty("deploybug.scriptPaths"),
                        testPaths: buildProject.getProperty("deploybug.testPaths"),
                        binPaths: buildProject.getProperty("deploybug.binPaths")
                    }
                }),
                targetTask('generateBugPackRegistry', {
                    init: function(task, buildProject, properties) {
                        var nodePackage = nodejs.findNodePackage(
                            buildProject.getProperty("deploybug.packageJson.name"),
                            buildProject.getProperty("deploybug.packageJson.version")
                        );
                        task.updateProperties({
                            sourceRoot: nodePackage.getBuildPath()
                        });
                    }
                }),
                targetTask('packNodePackage', {
                    properties: {
                        packageName: buildProject.getProperty("deploybug.packageJson.name"),
                        packageVersion: buildProject.getProperty("deploybug.packageJson.version")
                    }
                }),
                targetTask('startNodeModuleTests', {
                    init: function(task, buildProject, properties) {
                        var packedNodePackage = nodejs.findPackedNodePackage(
                            buildProject.getProperty("deploybug.packageJson.name"),
                            buildProject.getProperty("deploybug.packageJson.version")
                        );
                        task.updateProperties({
                            modulePath: packedNodePackage.getFilePath()
                        });
                    }
                }),
                targetTask("s3EnsureBucket", {
                    properties: {
                        bucket: "airbug"
                    }
                }),
                targetTask("s3PutFile", {
                    init: function(task, buildProject, properties) {
                        var packedNodePackage = nodejs.findPackedNodePackage(buildProject.getProperty("deploybug.packageJson.name"),
                            buildProject.getProperty("deploybug.packageJson.version"));
                        task.updateProperties({
                            file: packedNodePackage.getFilePath(),
                            options: {
                                ACL: 'public-read'
                            }
                        });
                    },
                    properties: {
                        bucket: "airbug"
                    }
                })
            ]),
            series([
                targetTask('createNodePackage', {
                    properties: {
                        packageJson: buildProject.getProperty("deploybugserver.packageJson"),
                        sourcePaths: buildProject.getProperty("deploybugserver.sourcePaths"),
                        scriptPaths: buildProject.getProperty("deploybugserver.scriptPaths"),
                        testPaths: buildProject.getProperty("deploybugserver.testPaths"),
                        binPaths: buildProject.getProperty("deploybugserver.binPaths")
                    }
                }),
                targetTask('generateBugPackRegistry', {
                    init: function(task, buildProject, properties) {
                        var nodePackage = nodejs.findNodePackage(
                            buildProject.getProperty("deploybugserver.packageJson.name"),
                            buildProject.getProperty("deploybugserver.packageJson.version")
                        );
                        task.updateProperties({
                            sourceRoot: nodePackage.getBuildPath()
                        });
                    }
                }),
                targetTask('packNodePackage', {
                    properties: {
                        packageName: buildProject.getProperty("deploybugserver.packageJson.name"),
                        packageVersion: buildProject.getProperty("deploybugserver.packageJson.version")
                    }
                }),
                targetTask('startNodeModuleTests', {
                    init: function(task, buildProject, properties) {
                        var packedNodePackage = nodejs.findPackedNodePackage(
                            buildProject.getProperty("deploybugserver.packageJson.name"),
                            buildProject.getProperty("deploybugserver.packageJson.version")
                        );
                        task.updateProperties({
                            modulePath: packedNodePackage.getFilePath()
                        });
                    }
                }),
                targetTask("s3EnsureBucket", {
                    properties: {
                        bucket: "airbug"
                    }
                }),
                targetTask("s3PutFile", {
                    init: function(task, buildProject, properties) {
                        var packedNodePackage = nodejs.findPackedNodePackage(buildProject.getProperty("deploybugserver.packageJson.name"),
                            buildProject.getProperty("deploybugserver.packageJson.version"));
                        task.updateProperties({
                            file: packedNodePackage.getFilePath(),
                            options: {
                                ACL: 'public-read'
                            }
                        });
                    },
                    properties: {
                        bucket: "airbug"
                    }
                })
            ])
        ])
    ])
);
