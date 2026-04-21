import request from '@/api/request'

export async function getRealtimePeek(nodeType: string, nodeId: string, strictNodeId?: boolean) {
  const params: any = { nodeType, nodeId }
  if (strictNodeId !== undefined) params.strictNodeId = strictNodeId

  return await request.get('/api/realtime/peek', {
    params,
    headers: { isToken: false },
  })
}

export async function getRealtimeNext(
  nodeType: string,
  nodeId: string,
  cursor?: number,
  step?: number,
  strictNodeId?: boolean,
) {
  const params: any = { nodeType, nodeId }
  if (cursor !== undefined && cursor !== null) params.cursor = cursor
  if (step !== undefined && step !== null) params.step = step
  if (strictNodeId !== undefined) params.strictNodeId = strictNodeId

  return await request.get('/api/realtime/next', {
    params,
    headers: { isToken: false },
  })
}

