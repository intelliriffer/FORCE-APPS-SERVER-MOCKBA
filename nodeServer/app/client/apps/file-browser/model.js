let Model = {
    PATH: '/media',
    FILES: [],
    FOLDERS: [],
    FAVS: [],
    UPDATED: false,
    SORTBY: 'name',
    SORTDESC: false,
    CONFIG:{},
    CLIPBOARD: {
        PATH: '',
        OPERARATION: "COPY",
        NODES: []

    },
    READONLY: [
        '/media/acvs-synths',
        '/media/az01-internal',
    ],

    browse(path) {
        Model.PATH = path;
        Model.refresh();
    },
    refresh() {
        fetch("/file-browser/LIST", {
            method: "post",
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },

            body: JSON.stringify({ PATH: Model.PATH })
        })
            .then((response) => {
                response.json().then(data => {
                    Model.FILES = data.FILES;
                    Model.FOLDERS = data.FOLDERS;
                    Model.FAVS = data.FAVS;
                    Model.CONFIG=data.CONFIG;
                    Model.doSorting(Model.SORTBY, false, true);

                    Model.update();

                });
            });

    },
    doSorting(fld, numbered, forced = false) {
        let excludes = ['size', 'type'];
        if (Model.SORTBY == fld && !forced) {
            Model.SORTDESC = !Model.SORTDESC;
            Model.FILES = Model.FILES.reverse();
            if (!excludes.includes(fld)) Model.FOLDERS = Model.FOLDERS.reverse();
        }
        else {

            Model.SORTBY = fld;
            Model.FILES.sort((a, b) => {
                if (!numbered) return compare(a[fld], b[fld]);
                return Number(a[fld]) - Number(b[fld]);
            });
            if (!excludes.includes(fld)) {

                Model.FOLDERS.sort((a, b) => {
                    if (!numbered) return compare(a[fld], b[fld]);
                    return Number(a[fld]) - Number(b[fld]);

                });
            }
            // Model.SORTDESC = !Model.SORTDESC;
            if (Model.SORTDESC) {

                Model.FILES = Model.FILES.reverse();
                if (!['size'].includes(fld)) Model.FOLDERS = Model.FOLDERS.reverse();
                Model.FOLDERS = Model.FOLDERS.reverse();
            }
        }


        Model.update();


    },

    update() {
        Model.UPDATED = true;
        setTimeout(() => { Model.UPDATED = false }, 500);
    }

};

function compare(a, b) {
    try {
        a = a.toLowerCase();
        b = b.toLowerCase();

        if (a < b) return -1;
        if (a > b) return 1;
    } catch (e) { }
    return 0;
}

(async () => {
    Model.refresh();
    // let res = await fetch('/config/LOAD');
    //  let result = await res.json();
    //Model.CONFIG = result;
})();