#!/usr/bin/env node
const fs = require("fs");
const chalk = require('chalk');
const path = require('path');
const { exec } = require("child_process");
const child_process = require("child_process");
const execSync = require('child_process').execSync;
const os = require('os');
const { options } = require("yargs");
exports.command = 'init';
exports.desc = 'Prepare tool';
exports.builder = yargs => {
    yargs.options({
    });
};

exports.handler = async argv => {
    const { processor } = argv;

    console.log(chalk.green("Preparing computing environment..."));

	
    let pull_img = `bakerx pull focal cloud-images.ubuntu.com`;                   // Pull the focal image
    child_process.execSync(pull_img, {stdio: ['inherit', 'inherit', 'inherit']});       

    let createVM = `bakerx run deploy-vm focal --ip 192.168.56.10 --sync --memory 4096`;  // Create VM
    child_process.execSync(createVM, {stdio: ['inherit', 'inherit', 'inherit']});       
	
	let print_get_info = `bakerx ssh-info deploy-vm --format json`;    // Display connection information of VM
    child_process.execSync(print_get_info, {stdio: ['inherit', 'inherit', 'inherit']});    
	    
    let get_info = `bakerx ssh-info deploy-vm --format json > "VM_Info.json"`;    // Store connection information of VM in JSON file
    child_process.execSync(get_info, {stdio: ['inherit', 'inherit', 'inherit']});      
    
   
};
