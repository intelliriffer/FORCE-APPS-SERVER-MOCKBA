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
const { captureRejectionSymbol } = require('events');
const COLORS = {
    COLORS: [{
        NAME: "Fire",
        CODE: "FF0000"
    },
    {
        NAME: "Orange",
        CODE: "FF6D17"
    },
    {
        NAME: "Tangerine",
        CODE: "FF4400"
    },
    {
        NAME: "Apricot",
        CODE: "FF8800"
    },
    {
        NAME: "Yellow",
        CODE: "ECEC24"
    },
    {
        NAME: "Canary",
        CODE: "FFD500"
    },
    {
        NAME: "Lemon",
        CODE: "E6FF00"
    },
    {
        NAME: "Chartreuse",
        CODE: "A2FF00"
    },
    {
        NAME: "Neon",
        CODE: "55FF00"
    },
    {
        NAME: "Lime",
        CODE: "11FF00"
    },
    {
        NAME: "Clover",
        CODE: "00FF33"
    },
    {
        NAME: "Sea",
        CODE: "00FF80"
    },
    {
        NAME: "Mint",
        CODE: "00FFC4"
    },
    {
        NAME: "Cyan",
        CODE: "00F7FF"
    },
    {
        NAME: "Sky",
        CODE: "00AAFF"
    },
    {
        NAME: "Azure",
        CODE: "0066FF"
    },
    {
        NAME: "Grey",
        CODE: "A2A9AD"
    },
    {
        NAME: "Midnight",
        CODE: "0022FF"
    },
    {
        NAME: "Indigo",
        CODE: "5200FF"
    },
    {
        NAME: "Violet",
        CODE: "6F00FF"
    },
    {
        NAME: "Grape",
        CODE: "B200FF"
    },
    {
        NAME: "Fuschia",
        CODE: "FF00FF"

    },
    {
        NAME: "Magenta",
        CODE: "FF00BB"
    },
    {
        NAME: "Coral",
        CODE: "FF0077"

    }],
    RGB(CODE) {
        return {
            R: parseInt(CODE.slice(0, 2), 16),
            G: parseInt(CODE.slice(2, 4), 16),
            B: parseInt(CODE.slice(40, 6), 16),
        }
    },
    ASINT(HEX) {
        HEX = HEX.replace(/^0x/, '');
        let BS = parseInt(HEX, 16).toString(2).padStart(32, 0);
        return parseInt(BS, 2);

    },
    HEXFROMINT(I) {
        HARR = I.toString(2).pad(32, 0).match(/[0|1]{8}/g)
            .map(v => parseInt(v, 2).toString(16).padStart(2, 0));
        return HARR.slice(1).join('');
    },
    NAMEFROMCODE(CODE) {
        let ix = this.COLORS.findIndex(C => C.CODT == CODE);
        ix = ix < 0 ? 0 : ix;
        return this.COLORS[ix].NAME;
    }
};
let $configFile = null;
let $SaveConfigFile = null;
function INIT($req, $res) {
    RES = $res;
    REQ = $req;
    URL = $req.url.replace("/^\//", '').split('/');
    $target = getURLDir();
    switch (URL[2]) {
        case '':
        case undefined:
        case "/":
        case "LIST":
            LIST();
            break;
        case "PROCESS":
            PROCESS($target);
            break;
        case "SAVE":
            SAVE();
            break;
    }
}

function isType($path, EXT) {
    return $path.toLowerCase().endsWith(EXT.toLowerCase());
}

function LIST() {
    RES.writeHead(503, {
        'Content-Type': 'text/html'
    });
    RES.end('LOADED');
    return;
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

function errMsg(m) {
    RES.writeHead(503, {
        'Content-Type': 'text/html'
    });
    RES.end(m);
}

function getURLDir() {
    return unescape(URL.slice(3).join("/"));
}

function PROCESS($p) {
    if (!isType($p, ".xpj") || !(fs.existsSync($p) && fs.statSync($p).isFile())) {
        errMsg('INVALID PROJECT FILE');
        return;
    }
    const { spawn } = require('child_process');
    const gz = spawn('gzip', ['-dc', $p]);
    let gzStream = '';
    let hadError = false;
    gz.stdout.on('data', data => {
        //   console.log('data');
        gzStream += data.toString();
    });
    gz.stderr.on('data', data => {
        hadError = true;
        RES.write(data);

    });
    gz.on('close', data => {
        if (!hadError) {
            RES.writeHead(200, { 'content-type': 'text/html' })
            gzStream = gzStream.trim();
            let DS = parse(gzStream);

            let js = JSON.parse(DS.JS);
            let tcount = js.data.tracks.length;

            if (tcount < 2) {
                RES.write('Project Has Less than 2 Tracks! Rearranging not possible!');
            }
            else { //servce the UI
                let CSS = [];
                let JS = [
                    '/static/js/libs/jquery-3.5.1.min.js',
                    '/static/js/libs/vue.js',
                    '/static/js/libs/http_vue_loader.js',
                    '/static/apps/track-arranger/app.js|defer'
                ];

                let pMeta = js.data.tracks.map((t, i) => {
                    return {
                        NAME: t.name,
                        INDEX: i,
                        TYPE: t.program.type,
                        DEFAULT_NAME: t.name,
                        COLOR: t.colour,
                        DEFAULT_COLOR: t.colour
                    }
                });
                console.log(customColors());

                static.HEAD(RES, "MPC / Force Server", CSS, JS);
                RES.write('<body>');
                RES.write(`
    <script language="javascript">
    var $PROJECT_TARGET = {
                            PROJECT: "${$p}",
                            META: \`${JSON.stringify(pMeta)}\`,
                            CUSTOM_COLORS:\`${JSON.stringify(customColors())}\`
                            };
        </script >
                `);
                // static.MENU(REQ, RES);
                static.INCLUDE(RES, `${__dirname} /template.html`);
                static.CLOSE(RES);
            }

        }
        RES.end();
    });



}

function parse(s) {
    let x = s.indexOf('{');
    return {
        HEADER: s.slice(0, x),
        JS: s.slice(x)
    };
}


function SAVE() {
    RES.writeHead(200, {
        'Content-Type': 'text/JSON'
    });



    if (REQ.method == "POST") {
        let $body = '';
        REQ.on('data', chunk => {
            $body += chunk.toString();
        });

        REQ.on('end', () => {
            doSave(JSON.parse($body));

        });
    }


}
function doSave($payload) {

    // console.log($paylaod);
    const { spawn } = require('child_process');
    const gz = spawn('gzip', ['-dc', $payload.PROJECT]);
    let gzStream = '';
    let hadError = false;
    gz.stdout.on('data', data => {
        //   console.log('data');
        gzStream += data.toString();
    });
    gz.stderr.on('data', data => {
        hadError = true;
        RES.write(data);
    });
    gz.on('close', data => {
        let oLines = gzStream.split("\n").length;

        let JSN = chunkify(gzStream);
        /* total = (JSN.HEADER + "\n" + JSN.TRACKS.join("\n") + "\n" + JSN.FOOTER).split("\n").length;
         console.log(oLines, total);
 */
        if ($payload.META.length != JSN.TRACKS.length) {
            RES.end(JSON.stringify(`Error, Unable to Parse Project, Track Count Mistmatch`));
            return;
        }

        let OTS = Array.from(JSN.TRACKS);
        JSN.TRACKS = [];
        $payload.META.forEach((T, I) => {
            //          console.log(T.NAME);
            let OT = OTS[T.INDEX];
            if (T.NAME != T.DEFAULT_NAME) {
                //"name": "Audio 001",
                let src = `"name": "${T.DEFAULT_NAME}",`;
                let rep = `"name": "${T.NAME}",`;
                let before = `"programPads":`;
                OT = tReplace(OT, src, rep, before);

            }
            if (T.COLOR != T.DEFAULT_COLOR) {
                let src = `"colour": ${T.DEFAULT_COLOR},`;
                let rep = `"colour": ${T.COLOR},`;
                let before = `"program":`;
                OT = tReplace(OT, src, rep, before);

            }

            JSN.TRACKS.push(OT);
        });
        $oData = JSN.HEADER + "\n" + JSN.TRACKS.join(",\n") + "\n" + JSN.FOOTER;
        try {
            let $tfile = path.join(path.dirname($payload.PROJECT), 'ra_temp.xpj');
            let $ofile = $payload.PROJECT;
            fs.writeFileSync($tfile, $oData);
            helper.shellSync(`gzip -f "${$tfile}"`);
            $bFile = $payload.PROJECT.slice(0, -4) + '-[[' + (new Date().toISOString()).replace(/[:\.]/g, '-') + ']].xpjbk';
            helper.shellSync(`mv -f "${$ofile}" "${$bFile}"`);
            helper.shellSync(`mv -f "${$tfile}.gz" "${$ofile}"`);
        } catch (e) {
            console.log(e);
            RES.end(JSON.stringify(e.toString()));
            return;

        }
        //console.log($oData);
        console.log('Zipped');
        //console.log(DS.HEADER);

        RES.end(JSON.stringify(`Project ReArranged!

                Project: ${$payload.PROJECT}
                Backup: ${$bFile}
Test your Project by Loading Force.Not All ReArranged Projects Currennly Load Correctly.!

                    `));

        /* if (!hadError) {
             RES.writeHead(200, { 'content-type': 'text/html' })
             gzStream = gzStream.trim();
             let DS = parse(gzStream);
             RES.end(JSON.stringify('OK'));
         }*/
    });
}

function tReplace(str, what, by, before = '') {

    if (before.trim() == '') return str.replaceAll(what, by);

    let i = str.indexOf(before);
    let search = str.slice(0, i);
    let append = str.slice(i);
    return search.replaceAll(what, by) + append;

}


function chunkify($input) {
    let lines = $input.split("\n");
    // console.log(lines.length);

    let started = false;
    let done = false;
    $nspaces = 0;
    $tspaces = 0;
    $chunk = [];
    let pre = [];
    let post = [];
    let btoken = [];
    let stoken = [];
    let tracks = [];
    lines.forEach((line, i) => {

        if (!started) {
            pre.push(line);
            let tp = line.indexOf('"tracks":');
            //  stoken.push('[');
            if (tp >= 0) {
                $nspaces = tp;
                started = true;
                //     console.log('Track at', i + 1);
                if (line.indexOf('[') >= 0) {
                    stoken.push('[');
                    return;
                }
            }
        }
        if (started && !done) {
            $chunk.push(line);
            if (line.indexOf('[') >= 0) {
                stoken.push('[');
                //   console.log('sqppush', line);

            }
            if (line.indexOf('{') >= 0) {
                btoken.push('{');
            }
            if (line.indexOf('}') >= 0) {
                //console.log(btoken);
                btoken.pop();
            }
            if (line.indexOf(']') >= 0) {
                //console.log(stoken);
                stoken.pop();
                //    console.log(line);
            }
            if (btoken.length == 0) {
                //      console.log('track end', i + 1)
                $chunk[$chunk.length - 1] = $chunk[$chunk.length - 1].replace(',', '');
                //   console.log($chunk[$chunk.length - 1]);
                tracks.push($chunk.join("\n"));
                $chunk = [];
            }
            if (stoken.length == 0) {
                // console.log('empty stoken', i + 1);
                done = true;
            }
        }

        if (done) {
            post.push(line);
        }
    });
    tracks = tracks.filter(t => t.indexOf('{') >= 0);

    //    console.log(tracks);
    // console.log(lines.length);
    return {
        HEADER: pre.join("\n"),
        FOOTER: post.join("\n"),
        TRACKS: tracks
    }
}

function customColors() {

    let token = 'TRACK_COLOR_';

    return Object.keys(static.CONFIG).filter(k => {
        if (!k.startsWith(token)) return false;

        let p = static.CONFIG[k].trim().replace('#', '');
        console.log(p);
        return isHEXCOLOR(p);
    }).map(k => {
        return {
            CODE: static.CONFIG[k].trim().replace('#', ''),
            NAME: k
        }
    });

}

function isHEXCOLOR(v) {
    if (v.trim().length != 6) return false;
    return /^[A-Fa-f0-9]+$/.test(v);
}

function RESTART() {
    let script = path.join(path.dirname(path.dirname(__dirname)), 'restart');
    console.log(helper.shellSync(script)).toString();
}
