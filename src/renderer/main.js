import Vue from 'vue'
import axios from 'axios'

import App from './App'
import router from './router'
import store from './store'

import ElementUI from 'element-ui'
import '@/assets/css/global.css'
import '@/assets/css/iconfont/iconfont.css'
import 'element-ui/lib/theme-chalk/index.css'

import '@/components/app.components'
import api from '@/api'
import global from '@/global'

Vue.use(ElementUI)
if (!process.env.IS_WEB) Vue.use(require('vue-electron'))
Vue.http = Vue.prototype.$http = axios
Vue.config.productionTip = false
//页面刷新处理
{
  if(sessionStorage.getItem('sid') && sessionStorage.getItem('uid')){
     global.sid = sessionStorage.getItem('sid')
     global.uid = sessionStorage.getItem('uid')
     global.roleId = sessionStorage.getItem('roleId')
     global.roleName = sessionStorage.getItem('roleName')
     global.nickName = sessionStorage.getItem('nickName')
     global.schoolName = sessionStorage.getItem('schoolName')
     global.schoolId = sessionStorage.getItem('schoolId')
  }
}
Vue.prototype.api = api
Vue.prototype.global = global

/* eslint-disable no-new */
new Vue({
  components: { App },
  router,
  store,
  template: '<App/>'
}).$mount('#app')
