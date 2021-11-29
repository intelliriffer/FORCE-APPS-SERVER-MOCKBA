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
const { dirname } = require('path');
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
        case "UPDATE":
            UPDATE();
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
        '/static/apps/moduler/model.js',
        '/static/apps/moduler/app.js|defer',
    ];

    static.HEAD(RES, "MPC / Force Server", CSS, JS);
    RES.write('<body>');
    static.MENU(REQ, RES);
    static.INCLUDE(RES, `${__dirname}/template.html`);

    static.CLOSE(RES);
    RES.end();
}

function LOAD() {
    $mroot = path.join(path.dirname(path.dirname(path.dirname(path.dirname(__dirname)))), 'modules');
    if (!fs.existsSync($mroot)) {
        RES.end(`{
"ERROR":true;
"MESSAGE": 'Modules Directory Not Found'
        }`);
        return;
    }
    let modules = fs.readdirSync($mroot).filter(f => f.toLowerCase().endsWith('.json'));
    let RET = [];
    modules.forEach(m => {
        let C = getConfig(path.join($mroot, m))
        if (!C.ERROR) {
            RET.push(C);
        }

    });
    //   console.log(RET);
    RES.end(JSON.stringify(RET));
}
function autoScriptName(name) {
    return `do_module_${name}.sh`;

}
function getConfig($jFile) {
    // console.log($jFile);
    try {
        js = JSON.parse(fs.readFileSync($jFile).toString());
        js.RUNNING = isRunning(js.PROCESSNAME);
        let xPath = path.join(path.dirname($jFile), js.FILENAME);
        //  console.log(xPath);
        js.EXISTS = fs.existsSync(xPath) && fs.statSync(xPath).isFile();
        js.AUTOLAUNCH = fs.existsSync(path.join('/media/662522/Addons', autoScriptName(js.PROCESSNAME)));
        if (!js.ARGUMENTS) js.ARGUMENTS = [];
        js.ERROR = false;
        return js;
        // console.log(helper.shellSync(`pidof blas`).toString());

    }
    catch (e) {
        console.log(e);
        return { ERROR: true };

    }

}

function isRunning(p) {
    const { execSync } = require('child_process');
    try {
        let pid = execSync(`pidof ${p}`);
        return true;
    }
    catch (e) { return false; }

}


function UPDATE() {
    // console.log('uupdate request');
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
            JSN = JSON.parse($payload);

            //console.log(JSN);
            if (JSN.RUNNING) {
                // console.log('launching');
                // helper.shellSync(`/media/662522/AddOns/nodeServer/modules/${JSN.PROCESSNAME}&`);
                const { spawn } = require('child_process');
                let args = [];
                if (JSN.ARGUMENTS && JSN.ARGUMENTS.length > 0) {
                    args = JSN.ARGUMENTS.map(A => A.VALUE);
                }
                spawn(`/media/662522/AddOns/nodeServer/modules/${JSN.PROCESSNAME}`, args,
                    { stdio: 'ignore', detached: true }).unref()
                //  console.log('launched');
            }
            else {
                if (isRunning(JSN.PROCESSNAME)) helper.shellSync(`killall ${JSN.PROCESSNAME}`);
            }


            $auto = path.join('/media/662522/AddOns', autoScriptName(JSN.PROCESSNAME))
            //console.log($auto);
            if (JSN.AUTOLAUNCH && !fs.existsSync($auto)) {
                let args = JSN.ARGUMENTS.map(A => `"${A.VALUE}"`).join(' ').trim();
                //  console.log(args);

                let $script = `#!/bin/sh
killall ${JSN.PROCESSNAME}
/media/662522/AddOns/nodeServer/modules/${JSN.PROCESSNAME} ${args} &
`;
                //       console.log($script);
                fs.writeFileSync($auto, $script);
                helper.shellSync(`chmod +x ${$auto}`);
            }
            else {
                if (!JSN.AUTOLAUNCH && fs.existsSync($auto)) fs.unlinkSync($auto);
            }
            setTimeout(() => {
                JSN.RUNNING = isRunning(JSN.PROCESSNAME);
                JSN.AUTOLAUNCH = fs.existsSync($auto);
                //      console.log('done');
                RES.end(JSON.stringify(JSN));


            }, 500);


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
