deploybug
=========

usage: deploybug [action] [options]

actions:
    register    Register a package description with the DeployBug server
                    deploybug register --description [filepath] --server [server-address] --port [port-number]
                    deploybug register -d [filepath] -s [server-address] -p [port-number]

    deploy      Deploy a previously registered package onto the nodes specified in the package description
                    deploybug deploy --key [key] --server [server-address] --port [port]
                    deploybug deploy -k [key] -s [server-address] -p [port]

    start       Run the start script for the package on the deployed nodes
                    deploybug start --key [key] --server [server-address] --port [port]
                    deploybug start -k [key] -s [server-address] -p [port]

    stop        Stop the process running on the deployed nodes
                    deploybug stop --key [key] --server [server-address] --port [port]
                    deploybug stop -k [key] -s [server-address] -p [port]

    restart     Restart the process running on the deployed nodes
                    deploybug restart --key [key] --server [server-address] --port [port]
                    deploybug restart -k [key] -s [server-address] -p [port]

options:
    -s, --server        Hostname of the DeployBugServer
    -p, --port          Port number of the DeployBugServer
    -k, --key           Package Key
    -d, --description   Package description file path
    -h, --help          Help