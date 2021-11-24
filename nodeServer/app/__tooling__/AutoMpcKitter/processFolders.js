/**
 * copyright © Amit Talwar
 *  www.amitszone.com
 *  * */

let fs = require('fs');
let ANSI = require(__dirname + '/scripts/ansi.js');
const $node = '/media/662522/AddOns/nodeServer/node/bin/node';
KITS = [];
let $root = fs.readFileSync(__dirname + "/PATH.txt").toString().trim();
$multi = false;
if ($root.endsWith('*')) {
    $multi = true;
    $root = $root.replace('*', '');
}
if (!fs.existsSync($root)) throw (`Path {${$root}} Provided in Path.txt does not Exist!`);
if (!fs.lstatSync($root).isDirectory()) throw (`Error: Path {${root}} inside in Path.txt is not a Valid Directory`);
if ($multi) {
    dirs = fs.readdirSync($root);
    dirs.forEach(p => {
        let dpath = $root + "/" + p;
        if (fs.lstatSync(dpath).isDirectory()) {
            KITS.push(dpath);
        }
    });
} else  //single folder
{
    KITS = [$root];
}


const execSync = require('child_process').execSync;

KITS.forEach(f => {
    try {
        console.log(ANSI.YELLOW('Processing: ' + f));
        console.log(execSync(`${$node} ${__dirname}/scripts/kitMaker.js "${f}"`).toString());
    } catch (e) {
        console.log(e);
    }
});