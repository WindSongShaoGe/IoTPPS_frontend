import axios from 'axios'

const request = axios.create({
  baseURL: '/dev-api', // ✅ 关键：走 Vite 代理
  timeout: 10000,
})

// 请求拦截：将来你要带 token，就在这里统一加
request.interceptors.request.use(
  (config) => {
    // 先不加 token（你现在在测 /test/** 这种放行接口）
    // 以后需要登录接口时再打开：
    // const token = localStorage.getItem('token')
    // if (token) config.headers.Authorization = `Bearer ${token}`
    return config
  },
  (error) => Promise.reject(error),
)

// 响应拦截：统一处理 401、错误提示等
request.interceptors.response.use(
  (response) => response.data,
  (error) => {
    console.error('请求出错：', error?.response?.status, error?.response?.data || error.message)
    return Promise.reject(error)
  },
)

export default request
