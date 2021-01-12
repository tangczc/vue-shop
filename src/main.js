import Vue from 'vue'
import App from './App.vue'
import router from './router'
import './plugins/element.js'
// 导入全局样式
import './assets/css/global.css'
// 导入图标库 官网：https://fontawesome.dashgame.com/
import 'font-awesome/css/font-awesome.min.css'
// 导入axios
import axios from 'axios'
// 配置请求跟路径
axios.defaults.baseURL = 'http://timemeetyou.com:8889/api/private/v1/'
// 配置axios请求拦截器
axios.interceptors.request.use(config => {
  config.headers.Authorization = window.sessionStorage.getItem('token')
  console.log(config)
  // 最后必须return config
  return config
})
Vue.prototype.$http = axios
Vue.config.productionTip = false
new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
