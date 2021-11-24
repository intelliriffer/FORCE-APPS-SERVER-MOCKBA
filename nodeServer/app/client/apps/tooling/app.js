//Vue.use(httpVueLoader);
const vApp = new Vue({
    el: "#vuecontainer",
    data: {
        model: Model,
        target: $TOOLING_TARGET,
        target_type: $TOOLING_TARGET_TYPE,
        toolurl: '',
        done: false,
        hovering: false

    },
    components: {
        /*
        synthnob: "url:js/components/synthknob.vue?v=123",
        synthbutton: "url:js/components/synthbutton.vue?v=123",
        mselect: "url:js/components/mselect.vue?v=123",*/
    },

    mounted: function () {
        console.log(this.target);

    },

    computed: {
        OPERATIONS() {
            return this.model.OPERATIONS.filter(o => o.TARGET == this.target_type);
        }

    },
    methods: {
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


