#!/usr/bin/env node
const fs = require('fs');
const yaml = require('js-yaml');
const child_process = require("child_process");
const execSync = require('child_process').execSync;

const os = require('os');
const { options } = require("yargs");



class Config{
    // Executing the commands in VM via ssh

    async readBuildYaml(build_yml){
        const doc = yaml.load(fs.readFileSync(build_yml, 'utf8'));    
        let yamlFile = JSON.parse(JSON.stringify(doc));
        console.log('yaml File', yamlFile);
        return yamlFile;
    }

    async sshIntoVM(command) {

        //reading the VM Information
        let vmInfoFile = fs.readFileSync('VM_Info.json', (err) => {
            if (err) {
                console.error(err);
                return;
            }
        });
      
    vmInfoFile = JSON.parse(vmInfoFile);

    //ssh command for the VM
    let sshCommand = null;
    sshCommand = `ssh -i "${vmInfoFile.private_key}" ${vmInfoFile.user}@${vmInfoFile.hostname} -p ${vmInfoFile.port} -o StrictHostKeyChecking=no `;
    console.log(`${sshCommand}::::::: "${command}:::::::::"`)
    execSync(`${sshCommand} "${command}"`, {stdio: ['inherit', 'inherit', 'inherit']});

    }
    async runSQLSetupSteps(job_cmds)
    {      
      for(let i=0; i< job_cmds.length;i++)
      { 
          let command = job_cmds[i].run;   
          let passwd = process.env.mySQL_passwd;
          command = command.replace('passwd', passwd);  
          await this.sshIntoVM(command);                
      }
      
    }

    async runCloneSteps(cloneCommands){

        let token = process.env.Git_Token;

        for(let i=0; i< cloneCommands.length;i++)
      { 
          let command = cloneCommands[i].run; 
          command = command.replace('token', token);       
          await this.sshIntoVM(command);                
      }
    }

    async runSteps(job_cmds)
    {      
      for(let i=0; i< job_cmds.length;i++)
      { 
          let command = job_cmds[i].run;        
          await this.sshIntoVM(command);                
      }
      
    }

    async runSetupSteps(job_cmds)
    {      
      for(let i=0; i< job_cmds.length;i++)
      { 
          let command = job_cmds[i];        
          await this.sshIntoVM(command);                
      }
      
    }
}

module.exports = new Config();