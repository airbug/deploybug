# deploybug

## DeployBugServer

forever start deploybugserver-start

## DeployBug
### deploybug-cli

usage: deploybug [action] [options]

actions:
> -h, --help  Prints Help file

> register    Register a package description with the DeployBug server
> > deploybug register --description [filepath] --server [server-address] --port [port-number]
> > deploybug register -d [filepath] -s [server-address] -p [port-number]

> update      Update a package description with the DeployBug server
> > NOTE: Update will register the description if it is not already registered
> > deploybug update --key [key] --description [filepath] --server [server-address] --port [port-number]
> > deploybug update -k [key] -d [filepath] -s [server-address] -p [port-number]

> deploy      Deploy a previously registered package onto the nodes specified in the package description
> > deploybug deploy --key [key] --server [server-address] --port [port]
> > deploybug deploy -k [key] -s [server-address] -p [port]

> start       Run the start script for the package on the deployed nodes
> > deploybug start --key [key] --server [server-address] --port [port]
> > deploybug start -k [key] -s [server-address] -p [port]

> stop        Stop the process running on the deployed nodes
> > deploybug stop --key [key] --server [server-address] --port [port]
> > deploybug stop -k [key] -s [server-address] -p [port]

> restart     Restart the process running on the deployed nodes
> > deploybug restart --key [key] --server [server-address] --port [port]
> > deploybug restart -k [key] -s [server-address] -p [port]
                    
options:
> -s, --server        Hostname of the DeployBugServer
> -p, --port          Port number of the DeployBugServer
> -k, --key           Package Key
> -d, --description   Package description file path
> -h, --help          Help
    
TODOs and Issues:
> Validator
> > //TODO: Add url validation for packageURL
> > //QUESTION: Should we validate the packageURL exists here?
> > //TODO: validate the packageType is of a supported type
> > //QUESTION: Any limitations on the supported characters or keywords of the "key"
> DeployBugServer
> > //TODO: SSL
> > //TODO: Authentication. See node cryto
> > //TODO: Add support for nodes
> DeployBug
> DeployBugClient
> > //TODO: Validate options.