const child_process = require("child_process");
const buildFile = require("./config");
const fs = require("fs");

class petBuild{

    async runPetSteps(buildYamlFile,index){
        let runPetSteps = buildYamlFile.jobs[index].steps;   
        await buildFile.runSteps(runPetSteps);
    }

}

module.exports = new petBuild();