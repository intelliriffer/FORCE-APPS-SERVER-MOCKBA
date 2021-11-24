let Model = {
    IMAGES: [],
    DELETE(file) {

        fetch("/captures/DELETE", {
            method: "post",
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },

            //make sure to serialize your JSON body
            body: file
        })
            .then((response) => {
                let fi = Model.IMAGES.findIndex(f => f == file);
                console.log(fi, file);
                Model.IMAGES.splice(fi, 1);
            });


    },

    async CAPTURE() {
        await fetch("/captures/CAPTURE").then(response => {
            response.json().then(json => {
                Model.IMAGES.splice(0, 0, json.filename);
            });


            //  setTimeout(() => { location.reload() }, 500);
        });

    },
    async VCAPTURE() {
        await fetch("/captures/VCAPTURE").then(response => {
            response.json().then(json => {
                Model.IMAGES.splice(0, 0, json.filename);
            });


            //  setTimeout(() => { location.reload() }, 500);
        });

    }
};

(async () => {
    let res = await fetch('/captures/SCAN');
    let result = await res.json();
    Model.IMAGES = result;

})();