const child_process = require("child_process");
const buildFile = require("./config");
const fs = require("fs");

class angularBuild{

    async runAngularSteps(buildYamlFile,index){
        let runAngularSteps = buildYamlFile.jobs[index].steps;   
        await buildFile.runSteps(runAngularSteps);
    }

}

module.exports = new angularBuild();