import { createApp } from 'vue'
import App from './modeler/index.vue'
import './style.css'

import Antd from 'ant-design-vue'
import 'ant-design-vue/dist/antd.css'

// ✅ 加上：你的测试接口
import { getTestUserList } from '@/api/test'

getTestUserList()
  .then(res => {
    console.log('✅ 后端返回：', res)
  })
  .catch(err => {
    console.error('❌ 请求失败：', err)
  })

const app = createApp(App)
app.use(Antd)
app.mount('#app')
