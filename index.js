#! /usr/bin/env node

const { spawn } = require("child_process");

const name = process.argv[2];
const yarnFlag = process.argv[3];

if (!name || name.match(/[<>:"\/\\|?*\x00-\x1F]/)) {
  return console.log(`
  Invalid directory name.
  Usage: create-express-api name-of-api [-y|--yarn]  
`);
}

if (!yarnFlag || !yarnFlag.match(/^-(-yarn|y)$/)) {
  return console.log(`
  Invalid option flag.
  Usage: create-express-api name-of-api [-y|--yarn]
`);
}

const repoURL = "https://github.com/w3cj/express-api-starter.git";

runCommand("git", ["clone", repoURL, name])
  .then(() => {
    return runCommand("rm", ["-rf", `${name}/.git`]);
  })
  .then(() => {
    console.log("Installing dependencies...");
    return runCommand(yarnFlag ? "yarn" : "npm", [yarnFlag ? "" : "install"], {
      cwd: process.cwd() + "/" + name,
    });
  })
  .then(() => {
    console.log("Done! 🏁");
    console.log("");
    console.log("To get started:");
    console.log("cd", name);
    console.log(yarnFlag ? "yarn dev" : "npm run dev");
  });

function runCommand(command, args, options = undefined) {
  const spawned = spawn(command, args, options);

  return new Promise((resolve) => {
    spawned.stdout.on("data", (data) => {
      console.log(data.toString());
    });

    spawned.stderr.on("data", (data) => {
      console.error(data.toString());
    });

    spawned.on("close", () => {
      resolve();
    });
  });
}
