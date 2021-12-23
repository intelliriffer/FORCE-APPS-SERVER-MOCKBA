//Vue.use(httpVueLoader);
const vApp = new Vue({
    el: "#vuecontainer",
    data: {
        project: $PROJECT_TARGET.PROJECT,
        tracks: JSON.parse($PROJECT_TARGET.META),
        custom_colors: JSON.parse($PROJECT_TARGET.CUSTOM_COLORS),
        working: false,
        done: false,
        deg: 0,
        wi: null


    },
    components: {
    },

    mounted: function () {


    },

    computed: {


        OPERATIONS() {
            return this.model.OPERATIONS.filter(o => o.TARGET == this.target_type);
        },

        COLORS() {
            return {
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

                }].concat(this.custom_colors),
                RGB(CODE) {
                    return {
                        R: parseInt(CODE.slice(0, 2), 16),
                        G: parseInt(CODE.slice(2, 4), 16),
                        B: parseInt(CODE.slice(4, 6), 16),
                    }
                },
                TITLECOLOR(HEX) {
                    let C = this.RGB(HEX);
                    let I = (C.R * 0.299) + (C.G * 0.587) + (C.B * 0.114);
                    //console.log(HEX, I);
                    return I > 100 ? '000000' : 'FFFFFF';

                },
                ASINT(HEX) {
                    HEX = HEX.replace(/^0x/, '');
                    let BS = parseInt(HEX, 16).toString(2).padStart(32, 0);
                    return parseInt(BS, 2);

                },
                HEXFROMINT(I) {
                    HARR = I.toString(2).padStart(32, 0).match(/[0|1]{8}/g)
                        .map(v => parseInt(v, 2).toString(16).padStart(2, 0));
                    return HARR.slice(1).join('');
                },
                NAMEFROMCODE(CODE) {
                    let ix = this.COLORS.findIndex(C => C.CODT == CODE);
                    ix = ix < 0 ? 0 : ix;
                    return this.COLORS[ix].NAME;
                }
            }
        }

    },
    watch: {
        deg(val) {
            this.deg = val > 360 ? 0 : val;
        }

    },
    methods: {
        validName(s) {
            if (s == null) return true;
            return /^[A-Za-z0-9-#_]+[A-Za-z0-9-#_ ]*[A-Za-z0-9-#_]$/.test(s) && s.trim().length > 0;

        },
        rename(t) {
            let fn = t.NAME;
            let valid = true;

            do {
                $p = valid ? '' : " Please Provide a Valid Name! \n\n"
                fn = prompt(`${$p}Rename Track (A-Z,0-9, -#): ${t.NAME} to`, fn);
                fn = fn == null ? t.NAME : fn;
                valid = this.validName(fn);
            } while (!this.validName(fn))
            if (fn != null) {
                t.NAME = fn;
            }



        },
        setColor(C, t) {
            this.tracks[t].COLOR = this.COLORS.ASINT(C.CODE);
            this.$forceUpdate();

        },
        COLORSTYLE(C) {
            let BG = this.COLORS.HEXFROMINT(C);
            // let FG = (Number(`0x1${BG}`) ^ 0xFFFFFF).toString(16).substr(1).toUpperCase()

            let FG = this.COLORS.TITLECOLOR(BG);
            //console.log(t.COLOR, FG, BG);
            let css = `background-color:#${BG};color:#${FG}`;
            //console.log(css);
            return css;

        },
        COLORSTYLEFROMCODE(C) {
            return this.COLORSTYLE(this.COLORS.ASINT(C));

        },

        headClass(i) {
            return this.trackType(i).replaceAll(' ', '-').toLowerCase();
        },
        mytracks() {
            return this.tracks.filter(t => t.TYPE < 7);
        },
        doreset() {
            this.tracks.sort((a, b) => a.INDEX - b.INDEX);
            this.tracks.forEach(t => {
                t.COLOR = t.DEFAULT_COLOR;
                t.NAME = t.DEFAULT_NAME;
            });
            this.$forceUpdate();
        },
        doSave() {
            let purl = `/track-arranger/SAVE`
            let $payload = {
                PROJECT: this.project,
                META: this.tracks
            };
            // this.working = true;
            this.wi = setInterval(() => { this.deg += 15; }, 30);
            fetch(purl, {
                method: "post",
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },

                body: JSON.stringify($payload)
            })
                .then((response) => {
                    //  this.working = false;
                    this.deg = 0;
                    clearInterval(this.wi);
                    response.json().then(data => {
                        alert(data);
                        if (window.top.browserDone) {
                            window.top.browserDone();
                        }
                    });
                });
        },
        clone(what) {
            return JSON.parse(JSON.stringify(what));

        },
        move(index, pos) {
            let temp = this.clone(this.tracks[index]);
            this.tracks[index] = this.clone(this.tracks[index + pos]);
            this.tracks[index + pos] = temp;
            this.$forceUpdate();

        },




        trackType(i) {
            let types = [
                'Drum Kit',
                'KeyGroup',
                'Program',
                'Plugin',
                'MIDI',
                'CV',
                'Audio',
                'Return',
                'SubMix',
                'Output'
            ];
            return types[i];

        },
        icon(type) {
            return type == "KIT" ? 'grid_on' : 'straighten';
        },
        DO_TOOL(TOOL) {
            $turl = `/tooling/${TOOL.COMMAND}/${encodeURIComponent(this.target)}`;
            this.toolurl = '';
            this.done = true;
            setTimeout(() => { this.toolurl = $turl; }, 500);


        },
        reload() {
            window.location.reload();
        }

    }
});


