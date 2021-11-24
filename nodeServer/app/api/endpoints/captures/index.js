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
let $cScript = "/media/662522/AddOns/nodeServer/app/api/sh/sc.sh";
let $captures = static.CONFIG.SCREENSHOTS_DIR || "/media/662522/Screenshots";
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

        case "RENDER":
            RENDER(); break;

        case "SCAN":
            SCAN(); break;
        case "CAPTURE":
            CAPTURE();
            break;
        case "DELETE":
            DELETE();
            break;
    }
    try {
        if ($captures.trim() == '') $captures = "/media/662522/Screenshots";
        if (!fs.existsSync($captures)) fs.mkdirSync($captures);
    } catch (e) { }
}

function RENDER() {
    $file = path.join($captures, URL[3] || 'xx.png');
    if (!fs.existsSync($file)) {
        return;
    }

    if ($file.endsWith('.mp4')) {

        var total;

        total = fs.statSync($file);

        // ... [snip] ... handle two other formats for the video
        var range = REQ.headers.range || 'bytes=0-';

        var positions = range.replace(/bytes=/, "").split("-");
        var start = parseInt(positions[0], 10);
        var end = positions[1] ? parseInt(positions[1], 10) : total - 1;
        var chunksize = (end - start) + 1;
        movieStream = fs.createReadStream($file);
        movieStream.on('open', function () {
            RES.setHeader('Content-Type', 'video/mp4');
            /*RES.writeHead(206, {
                "Content-Range": "bytes " + start + "-" + end + "/" + total,
                "Accept-Ranges": "bytes",
                "Content-Length": chunksize,
                "Content-Type": "video/mp4"
            });
            // This just pipes the read stream to the response object (which goes 
            //to the client)*/
            movieStream.pipe(RES);
        });
        return;
    }

    let $data = fs.readFileSync($file);
    $mime = $file.endsWith('.mp4') ? 'video/avi' : 'image/png';
    RES.setHeader('Content-Type', $mime);
    //console.log($file, $mime);
    RES.write($data);
    RES.end();
}

function SCAN() {
    files = fs.readdirSync($captures).reverse();
    RES.writeHead(200, {
        'Content-Type': 'text/json'
    });
    RES.end(JSON.stringify(files));

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
        '/static/apps/captures/model.js',
        '/static/apps/captures/app.js|defer',
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

function CAPTURE() {
    RES.writeHead(200, {
        'Content-Type': 'text/json'
    });
    $cFile = new Date().toISOString().replace(/[:\.]/g, '') + '.png';
    cPath = path.join($captures, $cFile);
    $cScript = `/media/662522/Tools/ffmpeg -y -crtc_id 0 -framerate 60 -f kmsgrab -i - -vf 'hwdownload,format=bgr0,transpose=1' -vframes 1 -c:v png ${cPath}`;
    // let capture = helper.shellSync($cScript).toString();
    let { exec } = require('child_process');
    exec($cScript, { stdio: ['ignore'] }, (err, stdin, stderr) => {
        RES.end(JSON.stringify({ filename: $cFile }));
    });

}

function DELETE() {
    RES.writeHead(200, {
        'Content-Type': 'text/html'
    });
    if (REQ.method == "POST") {
        let $body = '';
        REQ.on('data', chunk => {
            $body += chunk.toString();
        });

        REQ.on('end', () => {
            $dfile = path.join($captures, $body);
            fs.unlinkSync($dfile);

        });
    }
    RES.end();
}
