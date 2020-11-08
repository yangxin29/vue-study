import Vue from 'vue'
import App from './App.vue'
import './registerServiceWorker'
import router from './krouter'
import store from './store'

Vue.config.productionTip = false

new Vue({
  router, // 挂载, 目的是: 让我们可以在插件中访问到Router实例
  store,
  render: h => h(App)
}).$mount('#app')
