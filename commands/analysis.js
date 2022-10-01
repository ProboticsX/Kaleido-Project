const esprima = require("esprima");
const options = {tokens:true, tolerant: true, loc: true, range: true };
const fs = require("fs");
const chalk = require('chalk');
const configFile = require("../lib/config");

exports.command = 'analysis <job_name> <build_yml>';


exports.handler = async argv => {

	const {job_name, build_yml} = argv;
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

	try{

		if(job_name == "angular-analysis"){
			let runSteps = buildYamlFile.jobs[index].steps;   
			await configFile.runSteps(runSteps);
		}
	
		if(job_name == "pet-analysis"){
			let runSteps = buildYamlFile.jobs[index].steps;   
			await configFile.runSteps(runSteps);
		}
	

	}

	catch(e){

		if(job_name == "angular-analysis"){
			await configFile.sshIntoVM('cd angular-demo-travelapp && ng lint corelib');
		}

	}
   
};