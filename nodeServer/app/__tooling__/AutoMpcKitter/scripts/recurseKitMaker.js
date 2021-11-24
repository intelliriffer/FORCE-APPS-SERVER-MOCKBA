let fs = require('fs');
let ANSI = require('./ansi.js');
if (process.argv.length !== 3)
    throw ('Wav Folder not Provided');
var root = process.argv[2];
if (!fs.existsSync(root)) throw (ANSI.ERROR('Provided Wav Path does not Exist!'));
if (!fs.lstatSync(root).isDirectory()) throw (ANSI.ERROR('Provided Wav Path is not a Directory'));
let tDir = root + "/MPCKIT";
const Path = require("path");
let Files = [];

function ThroughDirectory(Directory) {
    fs.readdirSync(Directory).forEach(File => {
        const Absolute = Path.join(Directory, File);
        if (fs.statSync(Absolute).isDirectory() && !Directory.endsWith('MPCKIT')) {
            return ThroughDirectory(Absolute)
        }
        else if (!File.toLowerCase().startsWith(".") && File.toLowerCase().endsWith(".wav")) {
            return Files.push(Absolute)
        };
    });
}

/***** Executions ********* */

try {
    fs.mkdirSync(tDir);
    console.log("*********** Started File Copy");

    ThroughDirectory(root);
    Files.forEach(f => {
        tFile = Path.join(tDir, Path.basename(f));
        fs.copyFileSync(f, tFile);
    });
    console.log(">>>>>>>>>Completed File Copy");


} catch (e) { //directory already exists
    console.log(ANSI.YELLOW("***** MPCKIT Directory Already Exists- Skipping File Copy! ******"));
}

const execSync = require('child_process').execSync;
console.log(execSync(`node ${__dirname}/kitMaker.js "${tDir}"`).toString());


