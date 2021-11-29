

let Model = {
    CONFIG: {},
    WORKING: false,
    UPDATED: false,
    UPDATE($payload, index) {
        this.WORKING = true;
        fetch("/moduler/UPDATE", {
            method: "post",
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },

            //make sure to serialize your JSON body
            body: JSON.stringify($payload, null, 2)
        }).then((response) => response.json()).then(data => {
            this.CONFIG[index] = data;
            this.UPDATED = !this.UPDATED;
            this.WORKING = false;
        });

    }
};

(async () => {
    let res = await fetch('/moduler/LOAD');
    let result = await res.json();
    Model.CONFIG = result;
    // console.log(Model.CONFIG);
})();