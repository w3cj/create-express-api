#! /usr/bin/env node

// Import required modules
const fs = require('fs');
const { spawn } = require('child_process');
const degit = require('degit');
const args = require('args');

// Define command line options using the 'args' library
args
  .option('typescript', 'Use typescript template.', false)
  .option('directory', 'The name of the directory to create.')
  .examples([{
    usage: 'create-express-api -d my-api',
    description: 'Create express api in directory my-api',
  }, {
    usage: 'create-express-api -t -d my-api',
    description: 'Create express api with Typescript in directory my-api',
  }]);

// Parse command line arguments
const flags = args.parse(process.argv, {
  name: 'express-api-starter',
});

// Dynamically import 'chalk' for colorful console output
import('chalk').then(({ default: chalk }) => {

  /**
  * Logs an error to the console. This is primarily used for errors that don't have a callback but are in the process of being run as a result of an error
  * 
  * @param message - The message to log
  */
  function errorLog(message) {
    console.log(chalk.red.bgBlack(message));
  }

  // Show help message if the directory name is invalid
  if (!flags.d || flags.d.match(/[<>:"\/\\|?*\x00-\x1F]/)) {
    errorLog(`Error: Missing or Invalid directory name: "${flags.d}"`);
    args.showHelp();
    process.exit(-1);
  }

  // Check if a directory exists.
  if (fs.existsSync(flags.d)) {
    errorLog(`Error: Directory "${flags.d}" already exists.`);
    process.exit(-1);
  }

    // Define the GitHub repository to clone based on the TypeScript flag
  const repoName = flags.t ? 'w3cj/express-api-starter-ts' : 'w3cj/express-api-starter';

  // Use 'degit' to clone the repository
  const emitter = degit(repoName, {
    force: true,
    verbose: true,
  });

  // Event listener for degit information messages
  emitter.on('info', (info) => {
    console.log(info.message);
  });

  /**
  * Runs a command and returns a promise that resolves when the command completes. This is useful for commands that don't need to wait for the command to complete.
  * 
  * @param command - The command to run. This can be a path to a file or a shell command.
  * @param args - The arguments to pass to the command. If it's a path it will be parsed and passed as - is.
  * @param options - The options to pass to the spawn command.
  * 
  * @return { Promise } A promise that resolves when the command completes. The promise will resolve with no value if the command completes
  */
  function runCommand(command, args, options = undefined) {
    const spawned = spawn(command, args, options);

    return new Promise((resolve) => {
      spawned.stdout.on('data', (data) => {
        console.log(chalk.bgBlack.white(data.toString()));
      });

      spawned.stderr.on('data', (data) => {
        errorLog(data.toString());
      });

      spawned.on('close', () => {
        resolve();
      });
    });
  }

  // Clone the repository and install dependencies
  emitter.clone(flags.d).then(() => {
    console.log(chalk.bgBlack.cyan('Installing dependencies...'));
    const command = /^win/.test(process.platform) ? 'npm.cmd' : 'npm';

    // Run 'npm install' in the newly created directory
    return runCommand(command, ['install'], {
      cwd: `${process.cwd()}/${flags.d}`,
    }).then(() => {
      console.log(chalk.bgBlack.cyan('Done! 🏁'));
      console.log('');
      console.log(chalk.bgBlack.white('To get started:'));
      console.log(chalk.bgBlack.cyan(`cd ${flags.d}`));
      console.log(chalk.bgBlack.cyan('npm run dev'));
    });
  });
});
