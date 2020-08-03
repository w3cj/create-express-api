#! /usr/bin/env node

const { spawn } = require('child_process');
//Add fs node module for deleting files.
const fs = require('fs');

const name = process.argv[2];
if (!name || name.match(/[<>:"\/\\|?*\x00-\x1F]/)) {
  return console.log(`
  Invalid directory name.
  Usage: create-express-api name-of-api  
`);
}

const repoURL = 'https://github.com/w3cj/express-api-starter.git';
const dir = `${name}/.git`;

runCommand('git', ['clone', repoURL, name])
  .then(() => {
    return rm(dir)
  }).then(() => {
    console.log('Installing dependencies...');
    //Check if operative system is windows to pass npm.cmd or npm
    return runCommand(/^win/.test(process.platform) ? 'npm.cmd' : 'npm', ['install'], {
      cwd: process.cwd() + '/' + name
    });
  }).then(() => {
    console.log('');
    console.log('Done! 🏁');
    console.log('');
    console.log('To get started:');
    console.log('cd', name);
    console.log('npm run dev');
  });

function runCommand(command, args, options = undefined) {
  const spawned = spawn( command, args, options);

  return new Promise((resolve) => {
    spawned.stdout.on('data', (data) => {
      console.log(data.toString());
    });
    
    spawned.stderr.on('data', (data) => {
      console.error(data.toString());
    });
    
    spawned.on('close', () => {
      resolve();
    });
  });
}

//Replace rm command as a function to Work also on Windows (PowerShell/cmd)
function rm (path){
  return new Promise((resolve) =>{
    fs.rmdir(path, { recursive: true }, (err) => {
      if (err) {
        console.error('Error removing file :', err);
      }else {
        //Optional , show or not message if folder deleted?
        console.log(`${path} is deleted!`);
        resolve();
      }
    });
  });
}
