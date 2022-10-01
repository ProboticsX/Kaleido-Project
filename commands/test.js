const chalk = require('chalk');
const pathUtil = require("path");
const execSync = require('child_process').execSync;
const fs = require('fs');
const yaml = require('js-yaml');
const configFile = require("../lib/config");


exports.command = 'test <job_name> <build_yml>';
exports.desc = 'Prepare tool';

exports.builder = yargs => {
    yargs.options({
    });
};

exports.handler = async argv => {
    const { job_name, build_yml} = argv;
    try 
    {
        const doc = yaml.load(fs.readFileSync(build_yml, 'utf8'));                
        let doc_json = JSON.parse(JSON.stringify(doc)); // Parsing build.yml file

        var index = -1;
        for(let i=0; i< doc_json.jobs.length;i++)
        {
            if(job_name == doc_json.jobs[i].name) // Determining the index of job to execute based on the job name passed in the command line.
            {
                index = i;
            }
        }

        if(index==-1){
            return;
        }

        await configFile.sshIntoVM("cp /bakerx/web-srv .ssh/");
        await configFile.sshIntoVM("chmod 600 .ssh/web-srv");
        await execSync("chmod 600 web-srv", {stdio: ['inherit', 'inherit', 'inherit']});  

        if(job_name=="pet-test") {

            let job_cmds = doc_json.jobs[index].steps; 
            await configFile.runSteps(job_cmds);

        }

        if(job_name=="angular-test") {

            let job_cmds = doc_json.jobs[index].steps; 
            await configFile.runSteps(job_cmds);

        }
        
    } 
    catch (e) 
    {
        console.log(e);
    }
   
};
