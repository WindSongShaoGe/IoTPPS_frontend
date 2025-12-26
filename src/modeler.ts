import { createApp } from 'vue'
import App from './modeler/index.vue'
import './style.css'

import Antd from 'ant-design-vue'
import 'ant-design-vue/dist/antd.css'

// ✅ 门禁：没 token 先回登录页（并带上 redirect）
import { getToken } from '@/utils/token'

if (!getToken()) {
  const redirect = encodeURIComponent('/modeler.html' + location.search)
  location.replace(`./index.html?redirect=${redirect}`)
  throw new Error('Not authenticated')
}

// ✅ 你的测试接口（注意：这时已经有 token 了）
import { getTestUserList } from '@/api/test'

getTestUserList()
  .then((res) => {
    console.log('✅ 后端返回：', res)
  })
  .catch((err) => {
    console.error('❌ 请求失败：', err)
  })

const app = createApp(App)
app.use(Antd)
app.mount('#app')
