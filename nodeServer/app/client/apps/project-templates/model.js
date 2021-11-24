let Model = {
    ALL: [],
    ENABLED: [],
    SAVE() {

        fetch("/project-templates/SAVE", {
            method: "post",
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },

            //make sure to serialize your JSON body
            body: JSON.stringify(Model.ENABLED)
        })
            .then((response) => {
                alert('Saved!');
            });


    }
};

(async () => {
    let res = await fetch('/project-templates/LOAD');
    let result = await res.json();

    Model.ALL = result.ALL;
    Model.ENABLED = result.ENABLED;
    console.log(Model);
})();