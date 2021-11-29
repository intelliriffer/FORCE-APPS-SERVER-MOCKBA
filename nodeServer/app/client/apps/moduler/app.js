//Vue.use(httpVueLoader);
const vApp = new Vue({
    el: "#vuecontainer",
    data: {
        model: Model,
        working: false
    },
    components: {
        /*
        synthnob: "url:js/components/synthknob.vue?v=123",
        synthbutton: "url:js/components/synthbutton.vue?v=123",
        mselect: "url:js/components/mselect.vue?v=123",*/
    },

    mounted: function () {
        console.log("mounted");

    },

    computed: {
        nodes() {
            console.log(this.model.CONFIG);
            return Object.keys(this.model.CONFIG)
        },
        updated() {
            return this.model.UPDATED;
        }




    },
    watch: {
        updated(val) {
            console.log('updated');

            console.log(this.working);
            this.$forceUpdate();
        }

    },
    methods: {
        run(key, mode) {
            let $payload = Object.assign({}, this.model.CONFIG[key]);
            $payload.RUNNING = mode;
            this.model.UPDATE($payload, key);
        },
        update(key) {
            let $payload = Object.assign({}, this.model.CONFIG[key]);

            this.model.UPDATE($payload, key);

        },


        reload() {
            window.location.reload();
        }

    }
});


