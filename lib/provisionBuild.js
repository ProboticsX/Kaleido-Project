const child_process = require("child_process");
const fs = require("fs");
const provision = require('./provision');

class provisionBuild{

    async createDroplet(dropletName, region, imageName, sshFingerprint){
        var jsonContent = await provision.init(dropletName, region, imageName, sshFingerprint);
        return jsonContent;
   }   
    

}

module.exports = new provisionBuild();