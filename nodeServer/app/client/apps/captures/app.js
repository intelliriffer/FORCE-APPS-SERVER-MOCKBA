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
        },
        available() {
            avail = this.model.ALL.filter(f => !this.model.ENABLED.includes(f));
            return avail;
        },
        enabled() {
            return this.model.ENABLED;
        }

    },
    methods: {
        reload() {
            window.location.reload();
        },
        getName(item) {
            item = item.toString();
            item = item.replace(' - Template.xpj', '').trim();
            item = item.replace(' - template.xpj', '').trim();
            return item;
        },
        add(index) {
            this.model.ENABLED.push(this.available[index]);

        },
        remove(index) {
            this.model.ENABLED.splice(index, 1);
        },
        move(index, dir) {
            let temp = this.model.ENABLED[index];
            let next = index + dir;
            console.log(index, next);
            if (next >= 0 && next < this.model.ENABLED.length - 1) {
                this.model.ENABLED[index] = this.model.ENABLED[next];
                this.model.ENABLED[next] = temp;
                this.$forceUpdate();
            }
        }


    }
});


