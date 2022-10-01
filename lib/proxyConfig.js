const chalk = require('chalk');
const path = require('path');
const os = require('os');

const got = require('got');
const http = require('http');
const httpProxy = require('http-proxy');
const fs = require('fs');

global.TARGET = '';
var GREEN = '';
var BLUE = '';

global.SERVERTARGET = '';
var SERVERGREEN = '';
var SERVERBLUE = '';

class ProxyConfig{

    count;

    async runProxy(inventoryFile, endPoint, flag){
        
        let greenInventoryFile = inventoryFile["green"];

        let blueInventoryFile = inventoryFile["blue"];

        GREEN = `http://${greenInventoryFile.publicIP}:8080/${endPoint}`;
        BLUE = `http://${blueInventoryFile.publicIP}:8080/${endPoint}`;
        TARGET = GREEN;

        SERVERGREEN = `http://${greenInventoryFile.publicIP}:8080/`;
        SERVERBLUE = `http://${blueInventoryFile.publicIP}:8080/`;

        this.count = 0;
        SERVERTARGET = SERVERGREEN;

        if(flag == 2){
            
            GREEN = `http://${greenInventoryFile.publicIP}/${endPoint}`;
            BLUE = `http://${blueInventoryFile.publicIP}/${endPoint}`;
            TARGET = GREEN;

            SERVERGREEN = `http://${greenInventoryFile.publicIP}/`;
            SERVERBLUE = `http://${blueInventoryFile.publicIP}/`;

            this.count = 0;
            SERVERTARGET = SERVERGREEN;

        }

        
        (async () => {

            await this.run( );
    
        })();
        await new Promise(resolve => setTimeout(resolve, 2000));
        setInterval(this.healthCheck.bind(this), 5000 );


    }

    async healthCheck(){
        try{
            let response = null;
            setTimeout(async function(){
                if(response == null){
                    console.log("-----------Switching to BLUE SERVER---------------")
                    TARGET = BLUE;
                    SERVERTARGET = SERVERBLUE;
                }
            }, 5000)

            response = await got(TARGET, {throwHttpErrors: false});
            let status = response.statusCode == 200 ? chalk.green(response.statusCode) : chalk.red(response.statusCode);
            console.log( chalk`{grey Health check on ${TARGET}}: ${status}`);

            if(response.statusCode == 200){
                this.count = this.count+1;
            }

            if(TARGET==GREEN && (response.statusCode == 500)){
                TARGET = BLUE;
                SERVERTARGET = SERVERBLUE;
            }
        }
        catch(exception){
            console.log('error', exception);
        }
    }

    async run()
    {
        let options = {};
        let proxy = httpProxy.createProxyServer(options);
        let self = this;
        // Redirect requests to the active TARGET (BLUE or GREEN)
        let server  = http.createServer(function(req, res)
        {
            // callback for redirecting requests.
            proxy.web( req, res, {target: SERVERTARGET } );
        });
        server.listen(3090);
   }

}

module.exports = new ProxyConfig();