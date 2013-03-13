//-------------------------------------------------------------------------------
// Annotations
//-------------------------------------------------------------------------------

//@Package('deploybugserver')

//@Export('DescriptionRegistry')

//@Require('')

//-------------------------------------------------------------------------------
// Requires
//-------------------------------------------------------------------------------

var bugpack     = require('bugpack').context(module);
var sqlite3     = require('sqlite3').verbose();

//-------------------------------------------------------------------------------
// BugPack
//-------------------------------------------------------------------------------

var DescriptionRegistry = {
    initialized: false,
    db: null,
    initialize: function(callback){
        if(!DescriptionRegistry.initialized){
            var db = DescriptionRegistry.db = new sqlite3.Database('DeployBugDescription.db');

            db.serialize(function() {
              db.run("CREATE TABLE descriptions (key TEXT PRIMARY KEY, description TEXT, createdAt TEXT, updatedAt TEXT)");
            });
        }
        
        DescriptionRegistry.initialized = true;
        
        if(callback){
            callback();
        }
    },

    shutDown: function(callback){
        DescriptionRegistry.db.close();
        if(callback){
            callback();
        }
    },

    findByKey: function(key, callback){
        DescriptionRegistry.db.get("SELECT * FROM descriptions WHERE key = ?", [key], function(error, row){
            var description = row.description;
            console.log(description);
            callback(null, JSON.parse(description));
        });
        DescriptionRegistry.db.finalize;
    },

    register: function(key, description, callback){
        var dateTime = new Date;
        var stmt = DescriptionRegistry.db.prepare("INSERT INTO descriptions VALUES (?, ?, ?, ?)");
            stmt.run([key, JSON.stringify(description), dateTime, dateTime]);
        stmt.finalize();
        if(callback){
            callback();
        }    
    },

    update: function(callback){
        var dateTime = new Date;
        var stmt = DescriptionRegistry.db.prepare("UPDATE descriptions WHERE key = ? SET description = ?, updatedAt = ?");
            stmt.run([key, JSON.stringify(description), dateTime]);
        stmt.finalize();
        if(callback){
            callback();
        }
    },

    getRegistryKeys: function(callback){
        DescriptionRegistry.db.all("SELECT * FROM descriptions", function(error, rows){
            console.log("ROWS:", rows);
            if(callback){
                callback(rows);
            }
        })
    }
};

//-------------------------------------------------------------------------------
// Exports
//-------------------------------------------------------------------------------

bugpack.export('deploybugserver.DescriptionRegistry', DescriptionRegistry);