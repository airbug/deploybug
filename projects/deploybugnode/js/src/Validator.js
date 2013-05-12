//-------------------------------------------------------------------------------
// Requires
//-------------------------------------------------------------------------------

//@Package('deploybugnode')

//@Export('Validator')

//@Require('TypeUtil')

//-------------------------------------------------------------------------------
// Common Modules
//-------------------------------------------------------------------------------

var bugpack     = require('bugpack').context(module);
var TypeUtil    = bugpack.require('TypeUtil');

//-------------------------------------------------------------------------------
// Declare Class
//-------------------------------------------------------------------------------

var Validator = {

    //-------------------------------------------------------------------------------
    // Class Methods
    //-------------------------------------------------------------------------------
    /**
    *  @param {{
    *  key: string,
    *  hostname: string,
    *  port: integer,
    *  packageURL: string,
    *  packageType: string,
    *  startScript: string
    *  }} descriptionJSON
    */
    validatePackageDescription: function(descriptionJSON){
        console.log("Validating package description");
        var key = descriptionJSON.key;
        var packageURL = descriptionJSON.packageURL;
        var packageType = descriptionJSON.packageType;
        var requiredProperties = [  {name: "key", value: key},
                                    {name: "packageURL", value: packageURL},
                                    {name: "packageType", value: packageType}
        ];

        if(!TypeUtil.isString(key)){
            throw new TypeError("The key contained in the package description must be a string.");
        }

        if (!TypeUtil.isString(packageURL)){
            throw new TypeError("The packageURL contained in the package description must be a string")
        }

        if (!TypeUtil.isString(packageType)){
            throw new TypeError("The packageType contained in the package description must be a string")
        }

        requiredProperties.forEach(function(property){
            var name = property.name;
            var value = property.value;
            if(Validator.isEmptyString(value) || value == null){
                throw new Error("Invalid package description. " + name + " is required.");
            }
        });

        Validator.validatePackageType(packageType);
        Validator.validatePackageURL(packageURL);

        //TODO: Add url validation for packageURL
        //QUESTION: Should we validate the packageURL exists here?
        //TODO: validate the packageType is of a supported type
        //QUESTION: Any limitations on the supported characters or keywords of the "key"
    },

    validateNodeDescription: function(descriptionJSON){
        console.log("Validating package description");
        var key = descriptionJSON.key;
        var requiredProperties = [  {name: "key", value: key}
        ];
        
        requiredProperties.forEach(function(property){
            var name = property.name;
            var value = property.value;
            if(Validator.isEmptyString(value) || value == null){
                throw new Error("Invalid node description. " + name + " is required.");
            }
        });
    },
    
    /**
     * @params {string} key
     * @params {string} packageDescriptionKey
     */
    validateKeyMatch: function(key, packageDescriptionKey){
        if(key !== packageDescriptionKey){
            throw new Error("Package key does not match package description.");
        }
    },

    /**
     * @params {string} key
     */
    validatePackageType: function(type){
        if(type !== 'nodejs' && type !== 'clientjs'){
            throw new Error("Invalid 'packageType'. Package type must be either 'clientjs' or 'nodejs'");
        }
    },

    /**
     * @params {string} key
     */
    validatePackageURL: function(url){
    },

    /**
     * @params {string} key
     */
    validatePackageKey: function(key){ //change to isValidPackageKey method that returns a boolean????
        var regexp = /[\w.-]/i;
        if(!regexp.test(key)){
           throw new Error("Invalid Package Key. Package keys can only letters, numbers, underscores, dots, and dashes.");
        }
    },

    isEmptyString: function(string){
      return /^\s*$/.test(string)
    }

};

//-------------------------------------------------------------------------------
// Exports
//-------------------------------------------------------------------------------

bugpack.export('deploybugnode.Validator', Validator);