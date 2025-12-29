// src/api/realtime.ts
import axios from 'axios'

const http = axios.create({
  baseURL: import.meta.env.VITE_API_BASE || '',
  timeout: 15000,
})

export async function getRealtimePeek(nodeType: string, nodeId?: string) {
  const { data } = await http.get('/api/realtime/peek', { params: { nodeType, nodeId } })
  return data?.data ?? data
}

// ✅ 新增：顺序取下一条（播放用）
export async function getRealtimeNext(nodeType: string, cursor?: number) {
  const { data } = await http.get('/api/realtime/next', { params: { nodeType, cursor } })
  return data?.data ?? data
}
