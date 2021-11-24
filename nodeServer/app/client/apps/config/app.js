//Vue.use(httpVueLoader);
const vApp = new Vue({
    el: "#vuecontainer",
    data: {
        model: Model,

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
            return Object.keys(this.model.CONFIG)
        }



    },
    methods: {
        reload() {
            window.location.reload();
        }

    }
});


