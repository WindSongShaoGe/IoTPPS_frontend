// src/utils/request.ts
import axios, { AxiosError } from 'axios'
import { clearToken, getToken } from '@/utils/token'

// ✅ 默认沿用 RuoYi/Vite 常见的 /dev-api 代理前缀（这样 /login 之类也能走代理）
const rawBase = import.meta.env.VITE_API_BASE || '/dev-api'
// ✅ 去掉末尾 /，避免拼接出现双斜杠
const base = rawBase.replace(/\/+$/, '')

const request = axios.create({
  baseURL: base,
  timeout: 15000,
})

request.interceptors.request.use((config) => {
  const token = getToken()
  const isToken = (config.headers as any)?.isToken === false

  if (token && !isToken) {
    config.headers = config.headers ?? {}
    ;(config.headers as any).Authorization = `Bearer ${token}`
  }

  return config
})

request.interceptors.response.use(
  (res) => res.data,
  (err: AxiosError<any>) => {
    const status = err.response?.status

    // ✅ 401：清 token 并回到登录页
    if (status === 401) {
      clearToken()
      const redirect = encodeURIComponent(location.pathname + location.search)
      location.href = `/?redirect=${redirect}`
    }

    // ✅ 404：打印到底哪个接口 404（方便你抓鬼）
    if (status === 404) {
      const cfg: any = err.config || {}
      const full = `${cfg.baseURL || ''}${cfg.url || ''}`
      console.warn('[HTTP 404]', cfg.method?.toUpperCase?.() || 'GET', full, cfg.params || '')
    }

    return Promise.reject(err)
  }
)

export default request
