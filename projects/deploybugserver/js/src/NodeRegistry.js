//-------------------------------------------------------------------------------
// Annotations
//-------------------------------------------------------------------------------

//@Package('deploybugserver')

//@Export('NodeRegistry')

//@Require('')

//-------------------------------------------------------------------------------
// Requires
//-------------------------------------------------------------------------------

var bugpack     = require('bugpack').context(module);
var Map         = bugpack.require('Map');
var sqlite3     = require('sqlite3').verbose();

//-------------------------------------------------------------------------------
// BugPack
//-------------------------------------------------------------------------------

var NodeRegistry = {
    db: null,
    
    initialized: false,
    
    initialize: function(callback){
        if(!NodeRegistry.initialized){
            var db = NodeRegistry.db = new sqlite3.Database('DeployBugNode.db');

            db.serialize(function() {
              db.run("CREATE TABLE nodes (key TEXT PRIMARY KEY, type TEXT, hostname TEXT, port INTEGER, createdAt TEXT, updatedAt TEXT)");
              var dateTime = new Date;
              var stmt = db.prepare("INSERT INTO nodes VALUES (?, ?, ?, ?, ?, ?)");
                  stmt.run(["local", "local", "http://localhost", 8001, dateTime, dateTime]);
                  stmt.finalize();
            });
            
            NodeRegistry.initialized = true;
        }
        
        if(callback){
            callback();
        }
    },

    shutDown: function(callback){
        NodeRegistry.db.close();
        if(callback){
            callback();
        }
    },

    find: function(key, callback){
        var description;
        NodeRegistry.db.get("SELECT * FROM nodes WHERE key = ?", [key], function(error, row){
            description = row.description;
            console.log(description);
            callback(desciption);
        });
        NodeRegistry.db.finalize;
    },

    registerNode: function(key, description, callback){
        var dateTime = new Date;
        var stmt = NodeRegistry.db.prepare("INSERT INTO nodes VALUES (?, ?, ?, ?, ?)");
            stmt.run([key, hostname, port, dateTime, dateTime]);
            stmt.finalize();
        if(callback){
            callback();
        }    
    },

    updateNode: function(callback){
        var dateTime = new Date;
        var stmt = NodeRegistry.db.prepare("UPDATE nodes WHERE key = ? SET description = ?, updatedAt = ?");
            stmt.run([key, hostname, port, dateTime]);
            stmt.finalize();
        if(callback){
            callback();
        }
    },
    
    deleteNode: function(key, callback){
        var dateTime = new Date;
        var stmt = NodeRegistry.db.prepare("DELETE nodes WHERE key = ?");
            stmt.run([key]);
            stmt.finalize();
        if(callback){
            callback();
        }
    },
        
    findNodes: function(nodes, callback){
        var type = nodes.type;
        // var except = nodes.except;
        // var only = nodes.only;
        var nodeSet;
        NodeRegistry.db.all("SELECT * FROM nodes WHERE type = ?", [type], function(error, rows){
            if(!error){
                console.log('Found Nodes:', rows);
                callback(null, rows);
            } else {
                callback(error, rows);
            }
        });
        // descriptionJSON.metaData.nodes.type (SELECT * FROM nodes WHERE type = nodeType)
        // descriptionJSON.metaData.nodes.only
        // descriptionJOSN.metaData.nodes.except
        // Iterate through specified nodes
        //
    },
     // 
     // registerNode: function(key, descriptionJSON, callback){
     //     try{
     //         Validator.validateKeyMatch(key, descriptionJSON.key);
     //         if(DeployBug.getNodeRegistryDescriptionByKey(key)) {
     //             throw new Error("Node is already registered. Please use 'update' to update registered nodes.")
     //         } else {
     //             // Validations.
     //             // Validator.validateNodeDescription(descriptionJSON);
     //             // Registration
     //             DeployBug.setNodeRegistryDescription(key, descriptionJSON);
     //             callback();
     //         }
     //     } catch(error){
     //         callback(error);
     //     }
     // },
     // 
     // updateNode: function(key, descriptionJSON, callback){
     //     try{
     //         Validator.validateKeyMatch(key, descriptionJSON.key);
     //         if(!DeployBug.getNodeRegistryDescriptionByKey(key)){
     //             throw new Error("Package key does not exist in the registry. Please use 'register' to register your package.");
     //         } else {
     //             // Validator.validateNodeDescription(descriptionJSON);
     //             DeployBug.setNodeRegistryDescription(descriptionJSON.key, descriptionJSON);
     //             callback();
     //         }
     //     } catch(error){
     //         callback(error);
     //     }
     // },
     // 
     // deleteNode: function(key, callback){
     //     DeployBug.nodeRegistry.remove(key);
     //     callback();
     // },
     // 
     // /**
     //  *  @param {string} key
     //  *  @return {{
     //  *  key: string,
     //  *  nodeHostName: string,
     //  *  nodePort: number,
     //  *  metaData: {*}
     //  *  }}
     //  */
     // getNodeRegistryDescriptionByKey: function(key){
     //     return NodeRegistry.db.get(key);
     // },
     // 
     // /**
     //  *  @param {string} key
     //  *  @return {Array.<string>}
     //  */
     // getNodeRegistryKeys: function(){
     //     return NodeRegistry.db.getKeyArray();
     // },
     // 
     // /**
     //  *  @param {string} key
     //  *  @param {{
     //  *  key: string,
     //  *  nodeHostName: string,
     //  *  nodePort: number,
     //  *  metaData: {*}
     //  *  }} descriptionJSON
     //  */
     // setNodeRegistryDescription: function(key, descriptionJSON){
     //     NodeRegistry.db.put(key, descriptionJSON);
     // }
};


//-------------------------------------------------------------------------------
// Exports
//-------------------------------------------------------------------------------

bugpack.export('deploybugserver.NodeRegistry', NodeRegistry);