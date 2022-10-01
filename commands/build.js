#!/usr/bin/env node
const fs = require('fs');
const yaml = require('js-yaml');
const child_process = require("child_process");
const execSync = require('child_process').execSync;
const os = require('os');
const { options } = require("yargs");

const configFile = require("../lib/config");
const mutationBuild = require("../lib/mutationBuild");
const petBuild = require("../lib/petBuild");
const angularBuild = require("../lib/angularBuild");


require('dotenv').config();

exports.command = 'build <job_name> <build_yml>';

exports.handler = async argv => {
    const { job_name, build_yml} = argv;
    try 
    {
        
        //reading the build.yml file
        let buildYamlFile = await configFile.readBuildYaml(build_yml);

        //running setup

        await configFile.runSetupSteps(buildYamlFile.setup);


        // Determining the index of job to execute based on the job name passed in the command line.
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

        if(job_name=="itrust-build") {

            let cloneCommands = buildYamlFile.jobs[index].clone;  
            await configFile.runCloneSteps(cloneCommands);

            let sqlSetupSteps = buildYamlFile.jobs[index].sql_setup;   
            await configFile.runSQLSetupSteps(sqlSetupSteps);

            let runSteps = buildYamlFile.jobs[index].steps;   
            await configFile.runSteps(runSteps);
        
        }

        if(job_name=="mutation-coverage") {

            await mutationBuild.cloneMutationRepositories(buildYamlFile,index);
            await mutationBuild.createFinalJSON(buildYamlFile,index);
            await mutationBuild.sendFilesToVM();
            await mutationBuild.runMutation(buildYamlFile, index);
        
        }

        
        if(job_name == "pet-build"){
            await petBuild.runPetSteps(buildYamlFile, index);
        }

        if(job_name == "angular-build"){
            await angularBuild.runAngularSteps(buildYamlFile, index);
        }
    } 
    catch (e) 
    {
        console.log(e);
    }
   
};


