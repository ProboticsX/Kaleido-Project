const child_process = require("child_process");

const fs = require("fs");


class mutationBuild{

    async cloneMutationRepositories(buildYamlFile, index){

        let cloneCommands = buildYamlFile.jobs[index].clone;   
        await configFile.runCloneSteps(cloneCommands);
    }

    async createFinalJSON(buildYamlFile, index){

        let snapshotDetails = buildYamlFile.jobs[index].snapshots;

        let finalObjArray = [];

        for(let i=0; i<snapshotDetails.length;i++){
            let jobDetails = snapshotDetails[i].split('/');

            let object = {};
            object["fileName"] = jobDetails[4].split('.')[0];
            object["fileUrl"] = snapshotDetails[i];

            finalObjArray.push(object);
        }

        let finalJson = {"screenshotDetails":finalObjArray};

        fs.writeFileSync('screenshotDetails.json', JSON.stringify(finalJson));

    }

    async sendFilesToVM(){
        let vmCommands = buildYamlFile.jobs[index].send_files_to_vm;

        for(let i=0; i< vmCommands.length;i++){
            let command = vmCommands[i].vm_steps;  
            configFile.sshIntoVM(`${command}`); 
        }
    }

    async runMutation(buildYamlFile, index){

        let runMutation = buildYamlFile.jobs[index].steps;   
        await configFile.runSteps(runMutation);

        let runIterationsCommand = "bash final.sh " + buildYamlFile.jobs[index].iterations;
        await configFile.sshIntoVM(runIterationsCommand);
    }

}

module.exports = new mutationBuild();