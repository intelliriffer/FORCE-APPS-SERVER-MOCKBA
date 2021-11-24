/**
 * copyright © Amit Talwar
 *  www.amitszone.com
 *  * */
let fs = require('fs');
let ANSI = require(__dirname + '/ansi.js');

const template = fs.readFileSync(__dirname + "/templates/master.xml").toString();
const instrument = fs.readFileSync(__dirname + "/templates/instrument.xml").toString();

let path = require('path');
var ITEMS = [];
const samples = {
    count: 0,
    KICKS: {
        TOKENS: "KICK,KIK,BD",
        SLOTS: [0, 4, 8, 12, 16, 20, 24, 28, 32],
        SAMPLES: []
    },
    SNARES: {
        TOKENS: "SNARE,SNR,SD",
        SLOTS: [1, 5, 9, 13, 17, 21, 25, 29, 33],
        SAMPLES: []
    },
    HATS: {
        TOKENS: "HAT,CHH,OHH,CH ,OH, HH,RIDE,CRASH,CYM ",
        SLOTS: [2, 3, 6, 7, 10, 11, 14, 15, 18, 19],
        SAMPLES: []
    },

    OTHER: {
        TOKENS: "",
        SLOTS: [],
        SAMPLES: []
    },

}
if (process.argv.length !== 3)
    throw ('Wav Folder not Provided');
var root = process.argv[2];
if (!fs.existsSync(root)) throw (ANSI.ERROR('Provided Wav Path does not Exist!'));
if (!fs.lstatSync(root).isDirectory()) throw (ANSI.ERROR('Provided Wav Path is not a Directory'));

let dir = fs.readdirSync(process.argv[2]);

dir.forEach(w => {
    if (isWavFile(w)) {
        samples.count++;
        allocate(w);
    }

});


if (samples.count) {
    ITEMS = Array(samples.count).fill('');
    allot('KICKS');
    allot('SNARES');
    allot('HATS');
    allotOthers();
    //  console.log(samples);

    if (ITEMS.length > 128) {
        ITEMS = ITEMS.slice(0, 128);
        console.log(ANSI.ERROR(" >>>>> More than 128 Samples Found  >>>>>> Kit Truncated to 128 Pads"));
    };
    let $I = '';
    for (let i = 1; i <= 128; i++) {
        $I += getInstrument(i) + "\n";
    }
    $name = path.basename(root) + " Kit.xpm";
    $T = template.replace('##NAME##', $name);
    $T = $T.replace('##INSTRUMENTS##', $I);
    fs.writeFileSync(root + "/" + $name, $T);
    console.log(ANSI.CYAN("Written: " + $name));

}

function getInstrument($index) {

    $item = instrument.replace('##NUM##', $index);
    let $END = 0;
    let $SAMPLE = '';

    if ($index <= ITEMS.length && ITEMS[$index - 1].trim() != '') {
        //     console.log($index);
        let w = wavInfo(ITEMS[$index - 1]);
        $END = Math.ceil(w.SAMPLES) - 1;
        $SAMPLE = w.name;
    }
    $item = $item.replace('##NAME##', $SAMPLE);
    $item = $item.replace('##END##', $END);
    return $item;
}


//console.log(template);

//console.log(samples);
function allotOthers() {
    let s = samples['OTHER'].SAMPLES;
    for (let i = 0; i < s.length; i++) {
        let p = ITEMS.indexOf('');
        ITEMS[p] = s[i];
    }

}

function allot($key) {
    samples[$key].SAMPLES.sort();
    let s = samples[$key].SAMPLES;
    for (let i = 0; i < s.length; i++) {
        let done = false;
        //console.log(`i: ${i}`)
        if (i > samples[$key].SLOTS.length) { //out of bounds to add it to others
            console.log(ANSI.BLUE(`___________ Sample: ${s[i]} Exceeded Slot Level : Queued at End`));
            samples['OTHER'].SAMPLES.push(s[i]);
            done = true;
        }

        let item = -1;
        while (!done) {
            item++;
            let index = samples[$key].SLOTS[item];
            if (index > samples.count - 1) {
                samples['OTHER'].SAMPLES.push(s[i]);
                done = true;
            }
            if (ITEMS[index] == '') {
                ITEMS[index] = s[i];
                done = true;

            }

            if (!done && item >= samples[$key].SLOTS.length) {
                samples['OTHER'].SAMPLES.push(s[i]);
                done = true;
            }

        }
    }

}


function allocate($wav) {
    if (matched($wav, "KICKS")) return;
    if (matched($wav, "SNARES")) return;
    if (matched($wav, "HATS")) return;

    samples.OTHER.SAMPLES.push($wav);
}

function matched($w, $key) {

    $wL = $w.toLowerCase();
    let terms = samples[$key].TOKENS.toLowerCase().split(",");
    for (let i = 0; i < terms.length; i++) {
        if ($wL.includes(terms[i])) {
            samples[$key].SAMPLES.push($w);
            return true;
        }
    }
    return false;

}

function isWavFile($file) {

    return $file.toLowerCase().endsWith(".wav") && !$file.toLowerCase().startsWith('.');

}



function wavInfo($w) {
    $fb = fs.readFileSync(root + "/" + $w).toString();
    $header = $fb.substr(0, 12);

    $skip = false;
    if ($header.substr(0, 4) != "RIFF" && $header.substr(8, 4) != "WAVE") {
        $skip = true;
        console.log(ANSI.ERROR('Skipping Invalid Wave File: ' + $w));
        $o = {
            file: '',
            name: '',
            samples: 1,
            depth: 16,
            channels: 1,
            samplerate: 44100
        };
        return $o;
    }
    if (!$skip) {
        $fmtpos = $fb.indexOf('fmt', 12);
        $fmtsize = byteSum($fb.substr($fmtpos + 4, 4));

        //if ($fmtsize == 16) {
        $format = byteSum($fb.substr($fmtpos + 8, 2));
        $channels = byteSum($fb.substr($fmtpos + 10, 2));
        $samplerate = byteSum($fb.substr($fmtpos + 12, 4));
        $depth = byteSum($fb.substr($fmtpos + 22, 2));
        $datapos = $fb.indexOf('data', 32);

        $datasize = byteSum($fb.substr($datapos + 4, 4));
        $sampleend = $datasize / ($channels * ($depth / 8));
        $o = {
            file: $w,
            name: getChunks($w)[1],
            samples: $sampleend,
            depth: $depth,
            channels: $channels,
            samplerate: $samplerate
        };
        return $o;

    }

}

function byteSum(bytes) {
    $bytes = unpack(bytes);
    $sum = 0;
    for (let i = 0; i < $bytes.length; i++) {
        $sum += ($bytes[i] << (8 * i));
    }
    return $sum;
}


function unpack(str) {
    return str.split('').map(b => b.charCodeAt(0));


}
function getChunks($n) {
    $r = RegExp('^(.+)(\.[w|W][a|A][v|V])$');
    return $r.exec($n);
}