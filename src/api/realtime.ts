// src/api/realtime.ts
import request from '@/api/request'

export async function getRealtimePeek(nodeType: string, nodeId: string) {
  return await request.get('/api/realtime/peek', {
    params: { nodeType, nodeId },
    headers: { isToken: false },
  })
}

export async function getRealtimeNext(nodeType: string, nodeId: string, cursor?: number) {
  // ✅ cursor 为 undefined 时不要塞进 params（避免 Spring 把空字符串转 Long 报错）
  const params: any = { nodeType, nodeId }
  if (cursor !== undefined && cursor !== null) params.cursor = cursor

  return await request.get('/api/realtime/next', {
    params,
    headers: { isToken: false },
  })
}
