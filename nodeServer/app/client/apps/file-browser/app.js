//Vue.use(httpVueLoader);
Vue.use(httpVueLoader);

const vApp = new Vue({
    el: "#vuecontainer",
    data: {
        model: Model,

    },
    components: {
        browser: "url:/static/apps/file-browser/components/browser.vue"
        /*
        synthnob: "url:js/components/synthknob.vue?v=123",
        synthbutton: "url:js/components/synthbutton.vue?v=123",
        mselect: "url:js/components/mselect.vue?v=123",*/
    },

    mounted: function () {
        console.log("mounted");



    },

    computed: {


    },
    watch: {

    },
    methods: {
        close() {

            this.$refs.browser.closeBrowser();

        },
        reload() {
            window.location.reload();
        }

    }
});
function browserDone() {
    vApp.close();
}


