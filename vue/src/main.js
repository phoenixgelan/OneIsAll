import Vue from 'vue'
import App from './App.vue'

import { routes } from './routes'

import VueRouter from 'vue-router'

import VXETable from 'vxe-table'
import 'vxe-table/lib/style.css'
Vue.use(VXETable)

Vue.use(VueRouter);

Vue.config.productionTip = false

const router = new VueRouter({
    routes
})

new Vue({
    router,
    render: h => h(App),
}).$mount('#app')
