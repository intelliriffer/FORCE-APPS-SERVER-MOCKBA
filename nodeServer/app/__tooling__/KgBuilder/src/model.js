let fs = require('fs');
let path = require('path');
let ANSI = require('./ansi');
let helpers = require('./helpers');
let midi = require('./midihelpers')
let WAVF = require('./waveFile');
const execSync = require('child_process').execSync;
const MODEL = {
    DEFAULTS: {
        DOLOOP: 0,
        CENTS: 0,
        ROOT: 0,
        SAMPLE: '',
        END: 0,
        ID: 0,
        LOW: 0,
        HIGH: 127,
        LOOPSTART: 0,
        VOLUME: '1.000000'


    },
    OPTIONS: {
        SCW_WRITE_SMPL_CHUNK: false,
        PREFER_WAV_EMBEDDED_ROOT: false,
        SCW_HALF_VOLUME: false,
        BUZZFIX: true

    }
    ,
    MODES: {
        SCW: {
            ROOTREQUIRED: false,
            SINGLECYCLE: true,
            MULTISAMPLE: false


        },
        MULTIS: {
            ROOTREQUIRED: true,
            SINGLECYCLE: false,
            MULTISAMPLE: true
        },
        SINGLES: {
            ROOTREQUIRED: false,
            SINGLECYCLE: false,
            MULTISAMPLE: false
        }
    },
    ModeList() {
        return Object.keys(this.MODES);
    },
    isValidMode($mode) {
        return this.ModeList().includes($mode);

    },
    Process($ITEM) {
        log('CYAN', `>>>> Processing as ${$ITEM.MODE} >> ${$ITEM.FOLDER}`);
        //this.ExtprocessWavs($ITEM.FOLDER, $ITEM.MODE);
        processWavs($ITEM.FOLDER, $ITEM.MODE);

    },
    RemoteProcess($ITEM) {
        //console.log($ITEM);
        processWavs($ITEM.FOLDER, $ITEM.MODE);
    },

    TEMPLATES: {
        MASTER: fs.readFileSync(path.join(__dirname, 'keyMasterTemplate.xml')).toString(),
        INSTRUMENT: fs.readFileSync(path.join(__dirname, 'keyInstrumentTemplate.xml')).toString(),

    },
    ExtprocessWavs($path, $mode) {
        try {
            console.log('running');
            console.log(execSync(`node ${__dirname}/extprocess.js ${$mode}  "${$path}"`, { stdio: 'ignore' }).toString());
        } catch (e) {
            console.log(e);
        }

    }


};

function SaveMultisampleKeygroup(wData) {
    let count = wData.length;
    if (!count) return;
    let odata = '';
    let name = path.basename(path.dirname(wData[0].FILE).replaceAll("'", "_"));
    let fn = path.join(path.dirname(wData[0].FILE), name + ' - KG.xpm');

    for (let i = 1; i <= 128; i++) {
        let $i = MODEL.TEMPLATES.INSTRUMENT;
        $i = $i.replace('##ID##', i);
        if (i <= count) { //use multisample
            let wav = wData[i - 1];
            let $END = Samples(wav.WINFO.numsamples);
            if (wav.WINFO.hasSMPL && wav.WINFO.SMPL.NUMLOOPS > 0) {
                $i = $i.replace('##LOOPSTART##', wav.WINFO.SMPL.LOOPS[0].START);
                $END = Math.min(wav.WINFO.SMPL.LOOPS[0].END, $END);
            }
            $i = $i.replace('##LOW##', wav.LO);
            $i = $i.replace('##HIGH##', wav.HI);
            $i = $i.replace('##CENTS##', wav.CENTS);
            $i = $i.replace('##DOLOOP##', 1);
            $i = $i.replace('##END##', $END);
            $i = $i.replace('##ROOT##', wav.ROOT);
            $i = $i.replace('##SAMPLE##', wav.SAMPLE);


            $i = resetInstrument($i);
            odata += "\n" + $i;

        } else {
            /*$i = resetInstrument($i);
            odata += "\n" + $i;*/
        }

    }

    $t = MODEL.TEMPLATES.MASTER.replace("##NAME##", name);
    $t = $t.replace('##INSTRUMENTS##', odata);
    $t = $t.replace('##GROUPS##', count);

    fs.writeFileSync(fn, $t);
    log('YELLOW', `      <<< Keygroup Generated ${MODEL.OPTIONS.BUZZFIX ? 'with BuzzFix' : ''} => ${fn} <<<<`);

}
function SaveSingleKeygroup(wav, $mode) {
    let ID = 1;
    let $i = MODEL.TEMPLATES.INSTRUMENT;
    let $END = Samples(wav.WINFO.numsamples);
    if (!MODEL.MODES[$mode].SINGLECYCLE && (wav.WINFO.hasSMPL && wav.WINFO.SMPL.NUMLOOPS > 0)) {
        $i = $i.replace('##LOOPSTART##', wav.WINFO.SMPL.LOOPS[0].START);
        $END = Math.min(wav.WINFO.SMPL.LOOPS[0].END, $END);
    }
    $i = $i.replace('##ID##', 1);
    $i = $i.replace('##LOW##', wav.LO);
    $i = $i.replace('##HIGH##', wav.HI);
    $i = $i.replace('##CENTS##', wav.CENTS);
    $i = $i.replace('##DOLOOP##', 1);
    $i = $i.replace('##END##', $END);
    $i = $i.replace('##ROOT##', wav.ROOT);
    $i = $i.replace('##SAMPLE##', wav.SAMPLE);
    $i = $i.replaceAll('##VOLUME##', getVolume($mode));


    $i = resetInstrument($i);
    /* for (let i = 2; i <= 128; i++) {
         $di = MODEL.TEMPLATES.INSTRUMENT.replace('##ID##', i);
         $di = resetInstrument($di);
         $i += "\n" + $di;
     }
 */

    $t = MODEL.TEMPLATES.MASTER.replace("##NAME##", wav.SAMPLE);
    $t = $t.replace('##INSTRUMENTS##', $i);
    $t = $t.replace('##GROUPS##', 1);
    let fn = path.join(path.dirname(wav.FILE), wav.SAMPLE + ' - KG.xpm');
    fs.writeFileSync(fn, $t);
    log('YELLOW', `      <<< Keygroup Generated ${MODEL.OPTIONS.BUZZFIX ? 'with BuzzFix' : ''} => ${fn} <<<<`);


}

function getVolume($mode) {
    let volume = MODEL.DEFAULTS.VOLUME;
    if (MODEL.OPTIONS.SCW_HALF_VOLUME && MODEL.MODES[$mode].SINGLECYCLE) {
        volume = '0.500000';
    }
    return volume;
}

function resetInstrument($i) {
    Object.keys(MODEL.DEFAULTS).forEach(v => {
        $i = $i.replaceAll(`##${v}##`, MODEL.DEFAULTS[v]);
    });
    return $i;

}


function log(COLOR, what) {
    console.log(ANSI[COLOR](what));
}

function getPitch(samples, samplerate) {
    let f = samplerate / samples;
    const notes = "C,C#,D,D#,E,F,F#,G,G#,A,A#,B".split(',');
    let s = parseFloat((Math.log10(f / 440) / Math.log10(2 ** (1 / 12))).toFixed(2)); //semitones for equal temprament scale @a440
    //69 is A440 note
    let tones = parseInt(s);
    let cents = parseFloat(((s - tones) * 100).toFixed(2));
    let add = 0;
    if (cents < -50) {
        add = -1;
        cents += 100;
    } else if (cents > 50) {
        cents -= 100;
        add = 1;

    }

    let root = Math.abs((tones + 57)) + add;
    let sem = notes[Math.abs((tones + 57)) % 12] + '' + [Math.floor((tones + 57) / 12)];
    return {
        ROOT: root + 24,
        CENTS: cents * -1
    };

}


isSCW = function (v) {
    let valid = true
    valid = fs.statSync(v).size <= (30 * 1024);
    if (!valid) log('ERROR', `   >>>> Skipping ${v}, FileSize > 30KB (Too Large to be a SCW)`);
    return valid;
}
processWavs = function ($path, $mode) {


    if (MODEL.MODES[$mode].MULTISAMPLE) {
        let wavs = getMultiSamples($path, $mode);
        SaveMultisampleKeygroup(wavs);
        return;
    }

    /*** non Multisamples */
    let waves = [];
    if (fs.statSync($path).isDirectory()) {
        waves = fs.readdirSync($path).map(n => path.join($path, n)).filter(v => {
            valid = helpers.isFile(v) && isWavNamed(v);
            if (valid && MODEL.MODES[$mode].SINGLECYCLE) {
                valid = isSCW(v);
            }
            return valid;
        });
    } else {
        waves = [$path];
        if (MODEL.MODES[$mode].SINGLECYCLE && !isSCW($path))
            waves = [];
    }

    waves = waves.map((v, i) => {
        let match = /\.[Ww][Aa][Vv]$/.exec(v);
        let wFile = path.basename(v, match[0]);
        log('GREEN', ` <<< Processing Sample [${i + 1} of ${waves.length}]  <<< ${wFile}`);
        WINFO = WAVF.read(v, MODEL.MODES[$mode].SINGLECYCLE);
        let root = 36;
        let $CENTS = 0;
        if (MODEL.MODES[$mode].SINGLECYCLE) {
            let P = getPitch(WINFO.numsamples, WINFO.samplerate);
            if (P.ROOT < 0 || P.ROOT > 127) {
                log('ERROR', `      >>> ${wFile} >>> Sample too long to be Single Cycle, Could not determine Root, defaulting to C1 >>>`);
                P.ROOT = 12;
                P.CENTS = 0;
            }
            root = P.ROOT + 1;
            $CENTS = P.CENTS;
            if (MODEL.OPTIONS.SCW_WRITE_SMPL_CHUNK) {
                let smpl = WAVF.createSMPLChunk(root, $CENTS, 0, Samples(WINFO.numsamples));
                let akai = WAVF.createAkaiChunk(0, Samples(WINFO.numsamples), 0, 1);
                let chunk = smpl.concat(akai);
                WAVF.write(v, WINFO.channels, WINFO.format, WINFO.samplerate, WINFO.depth, WINFO.data, chunk);
                log('GREEN', ` <<<< SMPL INFO WRITTEN TO WAV FILE ${MODEL.OPTIONS.BUZZFIX ? 'with BuzzFix' : ''}`);
            }
        }
        else {
            let root = -1 //failure
            if (WINFO.hasSMPL) {
                root = WINFO.SMPL.MIDINOTE;
            }
            let file_root = getNoteNumber(v, $mode);
            root = selectRoot(root, file_root);
            if (root == -1) root = 60;
            root += 1;
        }

        let wav = {
            FILE: v,
            SAMPLE: wFile,
            SKIP: false,
            ROOT: root,
            LO: 0,
            HI: 127,
            CENTS: $CENTS,
            MULTI: false,
        }
        wav.WINFO = WINFO;
        SaveSingleKeygroup(wav, $mode);

    });

    //waves[ix].WINFO = WAVF.read(v.FILE, false);

}
function selectRoot(SMPL, FILE) {
    if (FILE == -1 || (MODEL.OPTIONS.PREFER_WAV_EMBEDDED_ROOT && SMPL != -1)) {
        if (SMPL != -1) console.log(`           << Using Embedded root: [${SMPL}] from Sample`);
        return SMPL;
    }
    return FILE;
}

function getMultiSamples($path, $mode) {
    let waves = fs.readdirSync($path).map(n => path.join($path, n)).filter(v => {
        return helpers.isFile(v) && isWavNamed(v);
    });

    waves = waves.map((v, ix) => {
        let match = /\.[Ww][Aa][Vv]$/.exec(v);
        let wFile = path.basename(v, match[0]);
        let last = waves.length - 1;
        log('GREEN', ` <<< Reading MultiSammple [${ix + 1} of ${last + 1}]  <<< ${wFile}`)
        let root = -1 //failure
        let WINFO = WAVF.read(v, false);
        if (WINFO.hasSMPL) {
            root = WINFO.SMPL.MIDINOTE;
        }
        let file_root = getNoteNumber(v, $mode);
        root = selectRoot(root, file_root);

        /**
         * 
         *  let file_root = getNoteNumber(v, $mode);
                    root = selectRoot(root, file_root);
                    if (root == -1) root = 60;
         *  */

        //root += 1;
        let wav = {
            FILE: v,
            SAMPLE: wFile,
            SKIP: false,
            ROOT: root,
            LO: root,
            HI: 127,
            CENTS: 0,
            MULTI: true,
            WINFO: WINFO
        }
        wav.SKIP = wav.ROOT < 0;
        if (wav.SKIP) log('ERROR', ` SKIPPED >> Key Note Defined in Name End or Sample >>> ${v} `);
        return wav;
    }).filter(v => !v.SKIP);

    waves.sort((a, b) => { return a.ROOT - b.ROOT });
    last = waves.length - 1;

    waves.forEach((v, ix) => {
        if (ix < last) {
            waves[ix].HI = waves[ix + 1].LO - 1;
        }
        if (ix == 0) {
            waves[ix].LO = 0;
        }

    });

    return waves;
}


function isWavNamed($path) {
    return /\.[Ww][Aa][Vv]$/.test($path);
}
function Samples(n) {
    return MODEL.OPTIONS.BUZZFIX ? n : n - 1;
}

function getNoteNumber($file, $mode) {
    let match = /\.[Ww][Aa][Vv]$/.exec($file);
    let wFile = path.basename($file, match[0]);
    hFile = wFile.replaceAll(/\s+/g, '-');
    Almatch = /-(([CDEFGAB][#|b]?)(-?[0-9]))$/.exec(hFile);
    if (Almatch) {

        return parseInt(midi.getNote(Almatch[1]).VALUE) + 24;
    }
    Nummatch = /-([0-9]{1,3})$/.exec(hFile);
    if (!Almatch && !Nummatch) {
        return -1;
    }
    return parseInt(Nummatch[1]);
}

let PRIVATE = {
    getPitch: getPitch,
    getNoteNumber: getNoteNumber,
    isWavNamed: isWavNamed,
    Samples: Samples


}; //for unit testing

module.exports = { MODEL, PRIVATE };
