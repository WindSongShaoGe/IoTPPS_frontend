import axios, { AxiosError } from 'axios'
import { clearToken, getToken } from '@/utils/token'

const request = axios.create({
  baseURL: import.meta.env.VITE_API_BASE || '/dev-api',
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
    if (err.response?.status === 401) {
      clearToken()
      const redirect = encodeURIComponent(location.pathname + location.search)
      location.href = `/?redirect=${redirect}`
    }
    return Promise.reject(err)
  }
)

export default request
