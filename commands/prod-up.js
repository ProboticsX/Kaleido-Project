const chalk = require('chalk');
const pathUtil = require("path");
const execSync = require('child_process').execSync;
const fs = require('fs');

const sshGeneration = require('../generate-ssh.js');

const provisionBuild = require("../lib/provisionBuild")

exports.command = 'prod up';
exports.desc = 'Prepare tool';
exports.builder = yargs => {
    yargs.options({
    });
};

exports.handler = async argv => {
    var dropletName1 = "droplet-green";
	var region = "nyc1"; // Fill one in from #1
	var imageName = "ubuntu-20-04-x64"; // Fill one in from #2
    var dropletName2 = "droplet-blue";

    let sshFingerprint = await sshGeneration.generateSSH();

    var info1 = await provisionBuild.createDroplet(dropletName1, region, imageName, sshFingerprint);
    var info2 = await provisionBuild.createDroplet(dropletName2, region, imageName, sshFingerprint);    
    var result = '{\n"green":'+info1 + ',\n"blue":' + info2+'\n}';
 
    fs.writeFileSync("inventory.json", result, 'utf8', function (err) {     
	    if (err) {
		console.log("An error occured while writing JSON Object to File.");
		return console.log(err);
		}
    });	

};
