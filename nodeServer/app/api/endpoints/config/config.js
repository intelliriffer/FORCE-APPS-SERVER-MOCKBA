module.exports = {
    INIT
};
let RES = null;
let REQ = null;
let URL = null;
const fs = require('fs');
const path = require('path');
const static = require('../static.js');
const helper = require('../helper.js');
let $configFile = null;
let $SaveConfigFile = null;
function INIT($req, $res) {
    RES = $res;
    REQ = $req;
    URL = $req.url.replace("/^\//", '').split('/');
    $configFile = path.join('/media/662522/AddOns/nodeServer/app', 'config.json');
    $SaveConfigFile = $configFile;

    switch (URL[2]) {
        case '':
        case undefined:
        case "/":
        case "LIST":
            LIST();
            break;
        case "LOAD":
            LOAD();
            break;
        case "SAVE":
            SAVE();
            break;
    }
}

function LIST() {
    RES.writeHead(200, {
        'Content-Type': 'text/html'
    });
    let files = [];
    let CSS = [];
    let JS = [
        '/static/js/libs/jquery-3.5.1.min.js',
        '/static/js/libs/vue.js',
        '/static/apps/config/model.js',
        '/static/apps/config/app.js|defer',
    ];

    static.HEAD(RES, "MPC / Force Server", CSS, JS);
    RES.write('<body>');
    static.MENU(REQ, RES);
    static.INCLUDE(RES, `${__dirname}/template.html`);

    static.CLOSE(RES);
    RES.end();
}

function LOAD() {

    if (!fs.existsSync($configFile)) $configFile = path.join(__dirname, 'baseconfig.json');
    let contents = fs.readFileSync($configFile).toString();
    RES.writeHead(200, {
        'Content-Type': 'text/json'
    });
    RES.end(contents);
}

function SAVE() {
    RES.writeHead(200, {
        'Content-Type': 'text/html'
    });
    if (REQ.method == "POST") {
        let $body = '';
        REQ.on('data', chunk => {
            $body += chunk.toString();
        });

        REQ.on('end', () => {
            let $payload = $body;
            fs.writeFileSync($SaveConfigFile, $payload);
            RES.end();
            RESTART();

        });
    } else {
        RES.end('INVALID');
    }



}

function RESTART() {
    let script = path.join(path.dirname(path.dirname(__dirname)), '../restart');
    console.log(helper.shellSync(script)).toString();
    // console.log(script);

}
