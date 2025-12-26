import request from '@/utils/request'

export function getTestUserList() {
  return request.get('/test/user/list')
}
