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
        // '/static/js/apps/config/model.js',
        //   '/static/js/apps/config/app.js|defer',
    ];

    static.HEAD(RES, "MPC / Force Server", CSS, JS);
    RES.write('<body>');
    static.MENU(REQ, RES);
    static.INCLUDE(RES, `${__dirname}/template.html`);

    static.CLOSE(RES);
    RES.end();
}

function LOAD() {
    contents = JSON.stringify({ message: 'LOADED' });
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
            RES.write('SAVED');
            s
        });
    }


    RES.end();
}

function RESTART() {
    let script = path.join(path.dirname(path.dirname(__dirname)), 'restart');
    console.log(helper.shellSync(script)).toString();
}
