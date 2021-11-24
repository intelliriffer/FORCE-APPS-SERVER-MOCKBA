let Model = {
    CONFIG: {},
    SAVE() {

        fetch("/config/SAVE", {
            method: "post",
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },

            //make sure to serialize your JSON body
            body: JSON.stringify(Model.CONFIG, null, 2)
        })
            .then((response) => {
                alert('Config Saved');
            });


    }
};

(async () => {
    let res = await fetch('/config/LOAD');
    let result = await res.json();
    Model.CONFIG = result;
})();