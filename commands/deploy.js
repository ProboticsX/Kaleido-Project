const chalk = require('chalk');
const pathUtil = require("path");
const execSync = require('child_process').execSync;
const fs = require('fs');
const yaml = require('js-yaml');
const configFile = require("../lib/config");
const console = require('console');
const proxyConfig = require('../lib/proxyConfig');


exports.command = 'deploy inventory <job_name> <build_yml>';
exports.desc = 'Prepare tool';

var dropletNames = ["green", "blue"]

exports.builder = yargs => {
    yargs.options({
    });
};

exports.handler = async argv => {
    const { job_name, build_yml} = argv;
                                    
    let buildYamlFile = await configFile.readBuildYaml(build_yml);
    
    var index = -1;
    for(let i=0; i< buildYamlFile.jobs.length;i++)
    {
        if(job_name == buildYamlFile.jobs[i].name) 
        {
            index = i;
        }
    }
    if(index==-1){
        return;
    }



    //read inventory
    let inventoryFile = fs.readFileSync('inventory.json', (err) => {
        if (err) {
            console.error(err);
            return;
        }
    });

    
    inventoryFile = JSON.parse(inventoryFile);

    if(job_name=="itrust-deploy"){

        let permitCommands = buildYamlFile.jobs[index].execute_permission;

        for(let i=0; i< permitCommands.length;i++){
            let command = permitCommands[i].run;  
            await execSync(`${command}`, {stdio: ['inherit', 'inherit', 'inherit']}); 
        }

        let vmCommands = buildYamlFile.jobs[index].vm_steps;

        for(let i=0; i< vmCommands.length;i++){
            let command = vmCommands[i].run;  
            await configFile.sshIntoVM(`${command}`); 
        }
     
        let dropletStepsCommand = buildYamlFile.jobs[index].droplet_steps;

        let sqlSetupSteps = buildYamlFile.jobs[index].sql_setup; 
    
        for(let i=0;i<dropletNames.length;i++){
           
            let tempInventoryFile = inventoryFile[dropletNames[i]];

            await configFile.sshIntoVM(`scp -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null -q -i ".ssh/web-srv " ~/iTrust2-v10/iTrust2/target/iTrust2-10.jar ${tempInventoryFile.name}@${tempInventoryFile.publicIP}:~ `);

            let droplet_ssh = null;
            droplet_ssh = `ssh -i "web-srv" -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null ${tempInventoryFile.name}@${tempInventoryFile.publicIP}`;

            for(let i=0;i< sqlSetupSteps.length; i++){
                let command = sqlSetupSteps[i].run;  
                let passwd = process.env.mySQL_passwd;
                command = command.replace('passwd', passwd); 
                execSync(`${droplet_ssh} "${command}"`, {stdio: ['inherit', 'inherit', 'inherit']}); 
            }

            for(let i=0; i< dropletStepsCommand.length;i++){
                let command = dropletStepsCommand[i].run;  
                execSync(`${droplet_ssh} "${command}"`, {stdio: ['inherit', 'inherit', 'inherit']}); 
            }
        }

        let endPoint = buildYamlFile.jobs[index].end_point;
        console.log("-----------------Starting Proxy!-----------------")
        await proxyConfig.runProxy(inventoryFile, endPoint, 0);

    }

    if(job_name=="pet-deploy"){

        let permitCommands = buildYamlFile.jobs[index].execute_permission;

        for(let i=0; i< permitCommands.length;i++){
            let command = permitCommands[i].run;  
            await execSync(`${command}`, {stdio: ['inherit', 'inherit', 'inherit']}); 
        }

        
        let vmCommands = buildYamlFile.jobs[index].vm_steps;

        for(let i=0; i< vmCommands.length;i++){
            let command = vmCommands[i].run;  
            await configFile.sshIntoVM(`${command}`); 
        }

        for(let i=0;i<dropletNames.length;i++){
        
            let dropletStepsCommand = buildYamlFile.jobs[index].droplet_steps;
            let tempInventoryFile = inventoryFile[dropletNames[i]];

            
            await configFile.sshIntoVM(`scp -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null -q -i ".ssh/web-srv" spring-petclinic/target/spring-petclinic-2.6.0-SNAPSHOT.jar  ${tempInventoryFile.name}@${tempInventoryFile.publicIP}:~ `);

            let droplet_ssh = null;
            droplet_ssh = `ssh -i "web-srv" -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null ${tempInventoryFile.name}@${tempInventoryFile.publicIP}`;

            for(let i=0; i< dropletStepsCommand.length;i++){
                let command = dropletStepsCommand[i].run;  
                execSync(`${droplet_ssh} "${command}"`, {stdio: ['inherit', 'inherit', 'inherit']}); 
            }
        }

        let endPoint = buildYamlFile.jobs[index].end_point;
        console.log("-----------------Starting Proxy!-----------------")
        await proxyConfig.runProxy(inventoryFile, endPoint, 1);
        

    }


    if(job_name=="angular-deploy"){

        let permitCommands = buildYamlFile.jobs[index].execute_permission;

        for(let i=0; i< permitCommands.length;i++){
            let command = permitCommands[i].run;  
            await execSync(`${command}`, {stdio: ['inherit', 'inherit', 'inherit']}); 
        }

        
        let vmCommands = buildYamlFile.jobs[index].vm_steps;

        for(let i=0; i< vmCommands.length;i++){
            let command = vmCommands[i].run;  
            await configFile.sshIntoVM(`${command}`); 
        }

        for(let i=0;i<dropletNames.length;i++){
            let dropletStepsCommand = buildYamlFile.jobs[index].droplet_steps;
            let tempInventoryFile = inventoryFile[dropletNames[i]];


            let droplet_ssh = null;
            droplet_ssh = `ssh -i "web-srv" -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null ${tempInventoryFile.name}@${tempInventoryFile.publicIP}`;

            for(let i=0; i< dropletStepsCommand.length;i++){
                let command = dropletStepsCommand[i].run;  
                execSync(`${droplet_ssh} "${command}"`, {stdio: ['inherit', 'inherit', 'inherit']}); 
            }

            await configFile.sshIntoVM(`scp -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null -q -i ".ssh/web-srv" angular-demo-travelapp/dist/angularDemo/* ${tempInventoryFile.name}@${tempInventoryFile.publicIP}:/var/www/html/`);

        }

        
        let endPoint = buildYamlFile.jobs[index].end_point;
        console.log("-----------------Starting Proxy!-----------------")
        await proxyConfig.runProxy(inventoryFile, endPoint, 2);

    }
};
