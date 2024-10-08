import Vue from 'vue'
import Cookies from 'js-cookie'

import Element from 'element-ui'
import './assets/styles/element-variables.scss'

import '@/assets/styles/index.scss' // global css
import '@/assets/styles/jingxuan.scss' // jingxuan cs s
import App from './App'
import permission from './directive/permission'
import router from './router'
import store from './store'

import { getConfigKey } from "@/api/system/config"
import { getDicts } from "@/api/system/dict/data"
import Pagination from "@/components/Pagination"
import { getToken } from "@/utils/auth"
import {
  addDateRange,
  download,
  exportExcel,
  handleTree,
  parseTime,
  resetForm,
  selectDictLabel,
  selectDictLabels
} from "@/utils/jingxuan"
import axios from 'axios'
import vSelectPage from 'v-selectpage'
import VueAxios from "vue-axios"
import './assets/icons'; // icon
import './permission'; // permission control
// 自定义表格工具扩展
import RightToolbar from "@/components/RightToolbar"
// 图片上传组件
import ImageUpload from "@/components/ImageUpload"
// 可编辑表格
import VXETable from 'vxe-table'
import XEUtils from 'xe-utils'
import 'vxe-table/lib/style.css'
// 
import Router from 'vue-router'
//引入移动端



// 全局方法挂载
Vue.prototype.$Utils = XEUtils
Vue.prototype.getDicts = getDicts
Vue.prototype.getConfigKey = getConfigKey
Vue.prototype.parseTime = parseTime
Vue.prototype.resetForm = resetForm
Vue.prototype.addDateRange = addDateRange
Vue.prototype.selectDictLabel = selectDictLabel
Vue.prototype.selectDictLabels = selectDictLabels
Vue.prototype.download = download
Vue.prototype.exportExcel = exportExcel
Vue.prototype.handleTree = handleTree


Vue.prototype.msgSuccess = function (msg) {
  this.$message({
    showClose: true,
    message: msg,
    type: "success"
  });
}

Vue.prototype.msgError = function (msg) {
  this.$message({
    showClose: true,
    message: msg,
    type: "error"
  });
}

Vue.prototype.msgInfo = function (msg) {
  this.$message.info(msg);
}

// 全局组件挂载
Vue.component('Pagination', Pagination)
Vue.component('RightToolbar', RightToolbar)
Vue.component('ImageUpload', ImageUpload)
Vue.use(VXETable)
Vue.use(VueAxios, axios)
Vue.use(permission);
Vue.use(Router);
Vue.use(vSelectPage, {
  // server side data loader
  dataLoad: async function (vue, data, params) {
    try {
      return await new Promise((resolve, reject) => {
        this.axios
          .get(process.env.VUE_APP_BASE_API + data, {
            params: params,
            headers: {
              Authorization: "Bearer " + getToken()
            }
          })
          .then(resp => resolve(resp), resp_1 => reject(resp_1))
      })
    } catch (error) {
      // 请求失败处理
      console.log('error', error)
    }
  }
})

/**
 * If you don't want to use mock-server
 * you want to use MockJs for mock api
 * you can execute: mockXHR()
 *
 * Currently MockJs will be used in the production environment,
 * please remove it before going online! ! !
 */

Vue.use(Element, {
  size: Cookies.get('size') || 'medium' // set element-ui default size
})
//axios.defaults.timeout = 5000 // 请求超时
//axios.defaults.baseURL = 'http://localhost:8080' + process.env.VUE_APP_BASE_API + '/'  // api 即上面 vue.config.js 中配置的地址
Vue.config.productionTip = false

new Vue({
  el: '#app',
  router,
  store,
  render: h => h(App)
})
