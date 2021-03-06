const TASKS = require(__dirname + '/../ENDPOINTS.js');
let RES = null;
let REQ = null;
let URL = null;
const version = "1.36beta"
let $NOHEADER = false;
const fs = require('fs');
let JSFILES = [
    "/static/js/libs/jquery-3.5.1.min.js",
    "/static/js/libs/jquery-ui.min.js"

];

function INIT($req, $res) {
    RES = $res;
    REQ = $req;
    $URL = $req.url.split("/").slice(2).join('/');
    //    RES.writeHead(200, { 'Content-Type': 'text/html' });
    $staticroot = `${__dirname}/../../client/`;
    $tfile = $staticroot + $URL;

    if (!fs.existsSync($tfile)) {
        RES.writeHead(404, {
            'Content-Type': 'text/plain'
        });
        RES.write('NOT FOUND' + $tfile);
        RES.end();
        return;
    }
    $data = fs.readFileSync($tfile);
    let MIME = getMIME($tfile);
    RES.writeHead(200, {
        'Content-Type': `${MIME}`
    });
    RES.write($data);
    RES.end();


}

function CSS() {
    let files = [
        "/static/css/jquery-ui.min.css",
        "/static/css/style.css"
    ]
    return files.map(cssTag);


}

function cssTag($item) {
    return `<link type="text/css" rel="stylesheet" href="${$item}" \>`;
}

function jsTag($item) {
    let item = $item.split("|");
    let defer = item[1] == 'defer' ? 'defer' : '';
    return `<script type="text/javascript" ${defer} src="${item[0]}"></script>`;
}

function JS() {
    return JSFILES.map(jsTag);
}

function HEAD(res, title = 'myApp', css = [], js = []) {
    res.write(`<!DOCTYPE html > <html lang="en">`);
    res.write(`<head>`);
    res.write(`<title>${title}</title>`);
    res.write(`<meta name="viewport" content="width=device-width, initial-scale=1.0">`);
    let $css = CSS().concat(css.map(cssTag));
    let $js = JS().concat(js.map(jsTag));
    $css.forEach(css => res.write(css));
    $js.forEach(js => res.write(js));
    res.write("</head>");
}

function CLOSE(res) {
    res.write(`</body></html>`);
}

function MENU(req, res) {
    res.write("<nav><div id='sub-nav'>");
    res.write(`<div class="mtitle"><span class="credit">MOCKBA & Amit Talwar's</span>
    <span>AKAI FORCE App Server <span class="version">v${version}</span></span></div>`);
    res.write('<div class="menu"><div class="menu-icon">MENU</div><ul>');

    TASKS.forEach(t => {
        $selected = '';
        if ((req.url.startsWith(t.PARAM) && t.PARAM != "/") || req.url == t.PARAM) $selected = "active";
        if (!t.HIDDEN) res.write(`<li class="${$selected}"><a href="${escape(t.URL)}">${t.NAME}</a></li>`);

    });
    res.write("</ul></div></div></nav>");

}

function getMIME($f) {
    //$e = $f.substr(-3).toUpperCase();
    $ext = $f.split('.').pop().toUpperCase();
    switch ($ext) {
        case "CSS":
            return 'text/css';
        case "JS":
            return 'text/javascript';
        case "VUE":
            return 'text/javascript';
        case "JPG":
            return 'image/jpeg';
        case "PNG":
            return 'image/png';
        case "OTF":
        case "TTF":
        case "WOFF":
        case "WOFF2": return `font/${$ext}`;
            return "text/plain";
    }

}

function INCLUDE(res, $file) {
    res.write(fs.readFileSync($file));
}

function queJS($js) {
    JSFILES.push($js);
}

function SAVECONFIG($data) {
    fs.writeFileSync(`${__dirname}/config.json`, JSON.stringify($data));
}

let CONFIG = {};
refresh();
function refresh() {
    CONFIG = JSON.parse(fs.readFileSync(`${__dirname}/../../config.json`));
}
function NOHEADER() {
    $NOHEADER = true;
}


module.exports = {
    INIT,
    CSS,
    JS,
    HEAD,
    TASKS,
    MENU,
    queJS,
    CONFIG,
    SAVECONFIG,
    CLOSE,
    INCLUDE,
    refresh,
    NOHEADER,
};