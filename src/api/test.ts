import request from '@/api/request'

export function getTestUserList() {
  return request.get('/test/user/list')
}
