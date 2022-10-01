const axios    = require("axios");
const chalk  = require('chalk');
const fs = require("fs");

class CreateDroplet{
	constructor(){
		this.dropletContent = {};
		this.headers = {};
		this.configuration = {};
		this.publicIP = '';
		this.privateIP = '';
	}

	async init(dropletName, region, imageName, sshFingerprint){
		await this.initialize();
		let dropletId = await this.createDroplet(dropletName, region, imageName, sshFingerprint);
		this.dropletContent['name'] = "root";
		this.dropletContent['dropletId'] = dropletId.toString();
		 var jsonContent = await this.dropletInfo(dropletName, dropletId);
		// await this.deleteDroplet(dropletId);
		return jsonContent;
	}

	async initialize(){

        // Retrieve our api token from the environment variables.

        this.configuration.token = process.env.DO_TOKEN;

        if( !this.configuration.token )
        {
            console.log(chalk`{red.bold DO_TOKEN is not defined!}`);
            console.log(`Please set your environment variables with appropriate token.`);
            console.log(chalk`{italic You may need to refresh your shell in order for your changes to take place.}`);
            process.exit(1);
        }

        console.log(chalk.green(`Your token is: ${this.configuration.token.substring(0,4)}...`));

        this.headers =
        {
            'Content-Type':'application/json',
            Authorization: 'Bearer ' + this.configuration.token
        };
		this.listRegions();
		
    }

	async listRegions()
	{
		let response = await axios.get('https://api.digitalocean.com/v2/regions', { headers: this.headers })
							 .catch(err => console.error(`listRegions ${err}`));
							 
		if( !response ) return;
		
		if( response.data.regions )
		{
			for( let region of response.data.regions)
			{
				console.log(region.slug, region.name)	
			}
		}

		if( response.headers )
		{
			console.log( chalk.yellow(`Calls remaining ${response.headers["ratelimit-remaining"]}`) );
		}
	}

	async createDroplet (dropletName, region, imageName, sshFingerprint )
	{
		if( dropletName == "" || region == "" || imageName == "" )
		{
			console.log( chalk.red("You must provide non-empty parameters for createDroplet!") );
			return;
		}

		var data = 
		{
			"name": dropletName,
			"region":region,
			"size":"s-1vcpu-1gb",
			"image":imageName,
			"ssh_keys": sshFingerprint,
			"backups":false,
			"ipv6":false,
			"user_data":null,
			"private_networking":null
		};
        console.log("Header", this.headers);
		console.log("Attempting to create: "+ JSON.stringify(data) );

		let response = await axios.post("https://api.digitalocean.com/v2/droplets", 
		data,
		{
			headers: this.headers,
		}).catch( err => 
			console.error(chalk.red(`createDroplet: ${err}`)) 
		);

		if( !response ) return;

		console.log('status',response.status);
		console.log('data',response.data);

		if(response.status == 202)
		{
			console.log(chalk.green(`Created droplet id ${response.data.droplet.id}`));
			return response.data.droplet.id;
		}
        
	}

	async dropletInfo (dropletName, id)
	{
		if( typeof id != "number" )
		{
			console.log( chalk.red("You must provide an integer id for your droplet!") );
			return;
		}

		// Make REST request
		let response = await axios.get("https://api.digitalocean.com/v2/droplets/"+id, { headers: this.headers })
		.catch(err => console.error(`dropletInfo ${err}`)); /// await axios.get

		if( !response ) return;

		if( response.data.droplet )
		{
			let droplet = response.data.droplet;
			let v4 = droplet.networks["v4"];
			this.publicIP = v4[0]["ip_address"];
			this.privateIP = v4[1]["ip_address"];
			console.log("Public IP Address: ", this.publicIP);
			console.log("Private IP Address: ", this.privateIP);

			this.dropletContent['publicIP'] = this.publicIP.toString();
			// Print out IP address
			var jsonContent = JSON.stringify(this.dropletContent)
			// fs.writeFileSync(dropletName+"_dropletContent.json", jsonContent, 'utf8', function (err) {     
			// 	if (err) {
			// 		console.log("An error occured while writing JSON Object to File.");
			// 		return console.log(err);
			// 	}
			return jsonContent;
			 

		}

	}

	async deleteDroplet(id)
	{
		if( typeof id != "number" )
		{
			console.log( chalk.red("You must provide an integer id for your droplet!") );
			return;
		}

		// HINT, use the DELETE verb.
		let response = await axios.delete("https://api.digitalocean.com/v2/droplets/"+id, { headers: this.headers })
		.catch(err => console.error(`deleteDroplet ${err}`)); /// await axios.get

		if( !response ) return;

		// No response body will be sent back, but the response code will indicate success.
		// Specifically, the response code will be a 204, which means that the action was successful with no returned body data.
		if(response.status == 204)
		{
			console.log(`Deleted droplet ${id}`);
		}

	}

	// async listImages( )
    // {
    //     // HINT: Add this to the end to get better filter results: ?type=distribution&per_page=100
    //     let response = await axios.get('https://api.digitalocean.com/v2/images', { headers: headers })
    //                          .catch(err => console.error(`listImages ${err}`));

    //     if( !response ) return;

    //     // console.log( response.data );
    //     var reg = "nyc1"
    //     if( response.data.images)
    //     {
    //         for(let image of response.data.images){

    //             for ( let region of image.regions){

    //                 if(region==reg){
    //                     if(image.slug!=null){
    //                         console.log("Image Slug: "+ image.slug)
    //                     }
    //                     else{
    //                         console.log("Image ID: "+ image.id)
    //                     }

    //                 }

    //             }

    //         }


    //     }

    //     if( response.headers )
    //     {
    //         console.log( chalk.yellow(`Calls remaining ${response.headers["ratelimit-remaining"]}`) );
    //     }
    // }
}

module.exports = new CreateDroplet();