module.exports = {
    INIT
};
let RES = null;
let REQ = null;
let URL = null;
let BASE = "/media";
const fs = require('fs');
const path = require('path');
const static = require('../static.js');
const helper = require('../helper.js');
const { unzip } = require('zlib');
const { DH_CHECK_P_NOT_SAFE_PRIME } = require('constants');



function INIT($req, $res) {
    RES = $res;
    REQ = $req;
    URL = $req.url.replace("/^\//", '').split('/');

    switch (URL[2]) {
        case '':
        case undefined:
        case "/":
            HOME();
            break;
        case "LIST":
            LIST();
            break;
        case "READ":
            READ();
            break;
        case "FSCOMMAND":
            FSCOMMAND();
            break;
        case "DOWNLOAD":
            DOWNLOAD();
            break;
    }
}

function READ() {
    let ret = {
        DATA: '',
        ERROR: false,
    }
    $f = unescape(URL.slice(3).join("/"));

    fs.readFile($f, (err, data) => {
        if (err) {
            ret.ERROR = true;
            endJSON(ret);
            return;
        }
        ret.DATA = data.toString();
        endJSON(ret);
    });
}

function isHidden(f){
let hidden = static.CONFIG.HIDDEN_FILES.toLowerCase().replaceAll(' ',',').trim().split(',').filter(e=>e.startsWith('.'));
return hidden.includes(path.extname(f).toLowerCase());
}

function getDir(dir, ScanFiles = true) {
    let all = fs.readdirSync(dir);
    let dirs = [];
    let files = [];
    let hidden = static.CONFIG.ADVANCED_MODE != '1';

    all.forEach(e => {
        let full = path.join(dir, e);
        if (!fs.existsSync(full)) return;
        let info = fs.statSync(full);
        let meta = {
            path: full,
            name: e,
            type: path.extname(e).toUpperCase().substring(1),
            mtime: info.mtime,
            mstime: info.mtimeMs,
            size: info.size,
            ctime: info.ctime,
            playing: false
        }

        if (info.isDirectory()) {
            if (e != 'az01-internal' && (!hidden || !e.startsWith('.'))) dirs.push(meta);

        } else {
           
            if (!e.trim().startsWith('.') && !isHidden(e)) {
                files.push(meta);
            }

        }

    });
    return {
        FOLDERS: dirs,
        FILES: files,
        FAVS: getFAVS(),
        CONFIG: static.CONFIG
    }

}
function getFAVS() {
    let token = 'BROWSER_FAV_';

    return Object.keys(static.CONFIG).filter(k => {
        if (!k.startsWith(token)) return false;
        let p = static.CONFIG[k]; if (p.trim() == '' || !p.trim().startsWith('/media')) return false; return isDir(p);
    }).map(p => static.CONFIG[p]);

}


function HOME() {
    RES.writeHead(200, {
        'Content-Type': 'text/html'
    });
    let files = [];
    let CSS = [];
    let JS = [
        '/static/js/libs/jquery-3.5.1.min.js',
        '/static/js/libs/vue.js',
        '/static/js/libs/http_vue_loader.js',
        '/static/apps/file-browser/model.js',
        '/static/apps/file-browser/app.js|defer',
    ];

    static.HEAD(RES, "MPC / Force Server", CSS, JS);
    RES.write('<body>');
    static.MENU(REQ, RES);
    static.INCLUDE(RES, `${__dirname}/template.html`);

    static.CLOSE(RES);
    RES.end();
}

function LIST() {
    let $LISTING = {
        FILES: [],
        FOLDERS: []
    };
    if (!REQ.method == "POST") {
        RES.writeHead(503, {
            'Content-Type': 'text/plain'
        });
        RES.end('INVALID REQUEST');
    }
    let $body = '';
    REQ.on('data', chunk => {
        $body += chunk.toString();
    });
    REQ.on('end', () => {
        $pl = JSON.parse($body);
        $LISTING = getDir($pl.PATH);
        endJSON($LISTING);
    });


}

function endJSON($js) {
    RES.writeHead(200, {
        'Content-Type': 'text/json'
    });
    RES.end(JSON.stringify($js));
}


function FSCOMMAND() {
    $rsp = {
        RESULT: 'OK',
        MESSAGE: 'OK'
    }
    RES.writeHead(200, {
        'Content-Type': 'text/json'
    });
    if (REQ.method == "POST") {
        let $body = '';
        REQ.on('data', chunk => {
            $body += chunk.toString();
        });

        REQ.on('end', () => {
            $pl = JSON.parse($body);
            $ocmd = $pl.COMMAND;
            $source = $pl.SOURCE;
            $target = $pl.TARGET;
            try {
                let fpath = '';
                switch ($ocmd) {
                    case 'CREATE-FOLDER':
                        fpath = path.join($source, $target);
                        $rsp.MESSAGE = `Folder ${fpath} Created!`;
                        CreateFolder(fpath, $rsp);

                        break;
                    case 'DELETE':
                        $rsp.MESSAGE = `${$source} Deleted Successfully!`;
                        doDelete($source, $rsp);

                        break;
                    case 'COPY':
                        $rsp.MESSAGE = `Files/Folders Copied Successfully!`;
                        doCopy($source, $target, 'COPY', $rsp);

                        break;
                    case 'MOVE':
                        $rsp.MESSAGE = `Files/Folders Moved Successfully!`;
                        doCopy($source, $target, 'MOVE', $rsp);

                        break;
                    case 'RENAME':
                        $rsp.MESSAGE = `Renamed ${$source} >> ${$target}`;
                        doRename($source, $target, $rsp);
                        break;
                    case 'RESTORE':
                        $rsp.MESSAGE = `Restored ${$target} >> ${$source}`;
                        RESTORE($source, $target, $rsp);
                        break;
                    case 'UNZIP':

                        $rsp.MESSAGE = `UN-ZIPPED ${$source} >> ${$target}`;
                        doUNZIP($source, $target, $rsp);

                        break;

                }
            } catch (e) {
                console.log(e);
                $rsp.RESULT = "ERROR";
                $rsp.MESSAGE = `********************************
${e.message}
********************************`;
                RES.end(JSON.stringify($rsp));
                return;
            }
            // RES.end(JSON.stringify($rsp));
            return;
        });

        return;
    }

    //  RES.end();

}

function CreateFolder($path, $msg) {
    fs.mkdirSync($path);
    RES.end(JSON.stringify($msg));
}

function doDelete($path, $msg) {
    let $cmd = isDir($path) ? 'rm -rf ' : 'rm -f ';
    $cmd = $cmd + `"${$path}"`;
    helper.shellSync($cmd);
    RES.end(JSON.stringify($msg));
}

function RESTORE($source, $target, $msg) {
    helper.shellSync(`cp -f "${$source}" "${$target}"`);
    console.log('RESTORED');
    RES.end(JSON.stringify($msg));
}

function doCopy($sources, $target, $mode, $msg) {
    let $ccmd = $mode == 'MOVE' ? 'mv' : 'cp';
    let cmds = ['#!/bin/sh'];
    $sources.forEach(s => {
        let $factor = s.TYPE == 'FOLDER' && $mode != "MOVE" ? ' -r' : '';
        let c = `${$ccmd} ${$factor} "${s.PATH}" "${$target}/"`;
        cmds.push(c);
        if (s.TYPE == "FILE" && isProject(s.PATH)) {
            let $pname = projectDirName(path.basename(s.PATH));
            let $pdir = path.join(path.dirname(s.PATH), $pname);
            if (!$sources.map(p => p.PATH).includes($pdir)) {
                $factor = $mode != "MOVE" ? ' -r' : ' ';
                let c = `${$ccmd} ${$factor} "${$pdir}" "${$target}/"`;
                cmds.push(c);
            }
        }
    });

    let $script = '/tmp/' + Date.now() + '_copy.sh';
    try {
        fs.writeFileSync($script, cmds.join("\n"));
    } catch (e) {
        console.log(e);
        throw ({ message: 'Unable To Write Batch File to /tmp' });
    }
    const { exec } = require('child_process');
    exec(`sh ${$script}`, { stdio: ['ignore'] }, (err, stdout, stderr) => {
        if (err) {
            console.log(err);
            helper.shellSync(`rm -f ${$script}`);
            throw (stderr.toString());
        }
        helper.shellSync(`rm -f ${$script}`);
        RES.end(JSON.stringify($msg));
    });
}



function doUNZIP($source, $target, $msg) {

    let hadError = false;
    const { spawn } = require('child_process');
    const uz = spawn('unzip', ['-qo', $source, '-d', $target]);
    uz.stderr.on('data', data => {
        $msg.RESULT = "ERROR";
        $msg.MESSAGE = data.toString();
        RES.end(JSON.stringify($msg));
        return;
    });

    uz.on('close', code => {
        if (hadError) return;
        RES.end(JSON.stringify($msg));
    });
}


function doRename($source, $target, $msg) {
    let $ccmd = 'mv';
    let cmds = ['#!/bin/sh'];
    let c = `${$ccmd} "${$source}" "${$target}"`;
    cmds.push(c);
    let fn = path.basename($source);
    let nfn = path.basename($target);
    if (isProject($source)) {
        if (isType(nfn, ".xpj")) {
            $pname = projectDirName(fn);
            $nname = projectDirName(nfn);
            $base = path.dirname($source);
            $nc = `${$ccmd} "${$base}/${$pname}" "${$base}/${$nname}"`;
            cmds.push($nc);

        } else {
            throw ({ message: 'Project Extention Renaming Not Allowed' });
            return;

        }
    }
    let $script = '/tmp/' + Date.now() + '_copy.sh';
    try {
        fs.writeFileSync($script, cmds.join("\n"));
    } catch (e) {
        console.log(e);
        throw ({ message: 'Unable To Write Batch File to /tmp' });
    }
    const { exec } = require('child_process');
    exec(`sh ${$script}`, { stdio: ['ignore'] }, (err, stdout, stderr) => {
        if (err) {
            console.log(err);
            helper.shellSync(`rm -f ${$script}`);
            throw (stderr.toString());
        }
        helper.shellSync(`rm -f ${$script}`);
        console.log($msg);
        RES.end(JSON.stringify($msg));
    });

}


function sendERROR(msg) {
    RES.writeHead(503, 'content-type:text/plain');
    RES.end(msg);
}

function isType($path, EXT) {
    return $path.toLowerCase().endsWith(EXT.toLowerCase());
}
function isProject($path) {
    $file = path.basename($path);
    $dir = path.dirname($path);
    if (!isType($file, ".xpj")) return false;
    if (!isDir(path.join($dir, projectDirName($file)))) return false;
    return true;



}
function projectDirName($file) {
    let fbase = $file.slice(0, -4);
    return `${fbase}_[ProjectData]`;

}
function isDir($path) {
    return fs.existsSync($path) && fs.statSync($path).isDirectory();

}

function waitHeader() {
    $html = `
    <html>
    <head>
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title> Archive Download</title>
    </head>
    <style>
    pre {
    display:block;
    padding:16px;
    max-height: calc(100vh - 250px);
    overflow-y:scroll;
    border:1px dotted #000;
    font-size:10px;
   }
   .error {
       font-size:12px;
       font-weight:bold;
       margin:8px;
       color:red;
   }
   body {padding:16px;}
   .download{
       display:block;
       width:100%;
       background-color:#fff;
       height:32px;
       position:absolute;
       top:0px;
       left:16px;
       right:16px;
   }
    </style>
    </html>
    <body>
    <p>Generating Archive ... Please Wait..</p><hr/>    
    `;
    RES.write($html);

}
function DownloadDIR() {

    $d = static.CONFIG.DOWNLOADS_DIR || '';
    if ($d.trim() == '') $d = '/media/662522/Downloads';
    if (!isDir($d)) fs.mkdirSync($d);
    return $d;
}

function GENERATE_ARCHIVE($path) {
    let fn = path.basename($path);
    let dir = path.dirname($path);
    let $tar = '';
    if (isDir($path)) {
        $tar = `${DownloadDIR()}/${fn}.tar`;
        $cmd = `tar -cvf ${$tar} -C "${dir}" "${fn}"`;
        $opts = ['-cvf', `${$tar}`, '-C', `${dir}/${fn}`, '.'];

    }
    else { //project
        let bfn = fn.slice(0, -4);
        $tar = `${DownloadDIR()}/${bfn}.tar`;
        let pname = projectDirName(fn);
        $cmd = `tar -cvf ${$tar} -C "${dir}" "${fn}" ${pname}`;
        $opts = ['-cvf', `${$tar}`, '-C', `${dir}`, `${fn}`, `${pname}`];
    }


    waitHeader();
    const { spawn } = require('child_process');
    const tar = spawn('tar', $opts);
    let hadError = false;
    RES.write(`<pre>
Adding Files ....
`);
    tar.stdout.on('data', data => {
        RES.write(data);
    });
    tar.stderr.on('data', data => {
        hadError = true;
        RES.write(`</pre>

        <div class="error"><h2>ERROR</h2> ${data.toString()}</div>
        </body></html>
        `);

        console.log(data.toString());

    });
    tar.on('close', code => {
        if (hadError) return;
        RES.write('</pre>');
        let $tarname = path.basename($tar);
        writeArchivePost(`/file-browser/DOWNLOAD/${escape($tar)}`, $tarname);

    });

}
function writeArchivePost($url, $name) {
    $body = `
    <p> Archive Generated in ${DownloadDIR()}, You may want to Delete that after Downloading.</p>
    <h2 class="download"><a href="${$url}"> Download ${$name}</a></h2>
    </body></html>
    `;
    RES.end($body);
}

function DOWNLOAD() {
    $f = URL.slice(3).join("/");
    if (!$f || $f == undefined) {
        sendERROR('INVALID FILE');
        return;
    }
    let $file = unescape($f);
    $fn = $file.split('/').pop();
    if (isProject($file) || isDir($file)) {
        GENERATE_ARCHIVE($file);
        return;
    }

    let size = fs.statSync($file).size;
    RES.writeHead(200, {
        'Content-Length': size,
        'Content-disposition': 'attachment; filename="' + $fn + '"'
    });
    let fstream = fs.createReadStream($file);
    fstream.pipe(RES);
}