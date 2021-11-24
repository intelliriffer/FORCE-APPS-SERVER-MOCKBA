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
const ROOT = '/media/az01-internal-sd/Expansions/Projects'
const template = path.join(ROOT, 'NewProjectDialog.json');
const templatesDir = path.join(ROOT, 'Templates');
let templateData = readTemplate();
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
        '/static/apps/project-templates/model.js',
        '/static/apps/project-templates/app.js|defer',
    ];

    static.HEAD(RES, "MPC / Force Server", CSS, JS);
    RES.write('<body>');
    static.MENU(REQ, RES);
    static.INCLUDE(RES, `${__dirname}/template.html`);

    static.CLOSE(RES);
    RES.end();
}

function LOAD() {

    let ts = fs.readdirSync(templatesDir).filter(f => f.endsWith('.xpj'));

    jData = templateData.value0.rows[0].items.map(v => v.fileName.replace('Templates/', '')).filter(v => v != '');
    let resp = {
        ALL: ts,
        ENABLED: jData
    };

    RES.writeHead(200, {
        'Content-Type': 'text/json'
    });
    RES.end(JSON.stringify(resp));
    // RES.end(contents);
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
            let $payload = JSON.parse($body);
            $payload = $payload.map(f => {
                return {
                    fileName: `Templates/${f}`,
                    name: getName(f)
                };
            });
            $payload.splice(0, 0, { fileName: '', name: "Empty" });
            templateData.value0.rows[0].items = $payload;
            fs.writeFileSync(template, JSON.stringify(templateData, null, 2));
            //RESTART();
        });
    }


    RES.end();
}

function RESTART() {
    let script = path.join(path.dirname(path.dirname(__dirname)), 'restart');
    console.log(helper.shellSync(script)).toString();
    // console.log(script);
}
function readTemplate() {
    let js = fs.readFileSync(template).toString('utf-8').trim();
    console.log(js.substr(js.length - 2, 1));

    while (js.substr(js.length - 1, 1) != '}') {
        console.log('cleaning');
        js = js.substring(0, js.length - 1);
    }
    return JSON.parse(js);
}
function getName(item) {
    item = item.toString();
    item = item.replace(' - Template.xpj', '').trim();
    item = item.replace(' - template.xpj', '').trim();
    return item;
}