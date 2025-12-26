import request from './request'

export function getCaptchaImage() {
  // 如果你后端没有验证码接口，这个请求会失败；我们在页面里会自动降级
  return request.get('/captchaImage', { headers: { isToken: false } })
}

export function loginApi(data: { username: string; password: string; code?: string; uuid?: string }) {
  return request.post('/login', data, { headers: { isToken: false } })
}
