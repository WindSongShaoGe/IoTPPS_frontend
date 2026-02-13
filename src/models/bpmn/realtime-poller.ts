// src/models/bpmn/realtime-poller.ts
import type { BaseNodeModel } from '@logicflow/core'
import { getRealtimeNext, getRealtimePeek } from '@/api/realtime'
import { normalizeType } from './type-compat'

// 原来：type Owner = 'bubble' | 'panel'
type Owner = 'bubble' | 'panel' | 'auto'


type RtState = {
  owners: Set<Owner>
  timer: number | null
  inflight: Promise<void> | null
  supportsNext: boolean | null
}

const states = new Map<string, RtState>()

function nodeIdOf(model: BaseNodeModel) {
  return String((model as any).id)
}

/** 尝试从 model 上拿 graphModel（不同版本字段名可能不同） */
function getGraphModel(model: any) {
  return model?.graphModel || model?.__graphModel || model?.props?.graphModel || null
}

/** 主动通知属性面板刷新 */
function emitPropsChanged(model: BaseNodeModel) {
  const gm: any = getGraphModel(model as any)
  if (!gm?.eventCenter?.emit) return

  const id = nodeIdOf(model)
  const payload = { data: { id, properties: model.getProperties?.() ?? (model as any).properties } }

  gm.eventCenter.emit('node:properties-change', payload)
  gm.eventCenter.emit('node:propertiesChange', payload)
  gm.eventCenter.emit('properties:change', payload)
}

/** 从 valueText 解析：参数名 / 数值 / 单位 */
function parseValueText(valueText: string) {
  const text = String(valueText ?? '').trim()
  const m = text.match(/^(.+?)[：:]\s*([+-]?\d+(?:\.\d+)?)\s*([^\s（()]+)?/)
  if (!m) return { param: '', value: null as number | null, unit: '' }

  const param = (m[1] ?? '').trim()
  const value = Number(m[2])
  const unit = (m[3] ?? '').trim()

  return { param, value: Number.isFinite(value) ? value : null, unit }
}

/**
 * ✅ 统一解包：
 * - 后端 ApiResp: { code, msg, data: {...} }
 * - 或者直接 {...}
 */
function unwrapRt(res: any) {
  const d = res?.data ?? res              // 兼容 axios raw / request 已解包
  const payload = d?.data ?? d            // 兼容 ApiResp.data

  return {
    valueText: payload?.valueText ?? '（无数据）',
    updatedAt: payload?.updatedAt ?? null,
    cursor: payload?.cursor ?? null,
    done: payload?.done ?? false,
  }
}

/**
 * ✅ 关键：决定“请求后端用的 nodeId”
 * 你现在数据库里 pump 的 node_id=any，所以：
 * - 泵默认用 'any'
 * - 以后你想按真实节点分流，只要在节点 properties 写 rtNodeId 就行
 */
function backendNodeIdOf(model: BaseNodeModel, nodeType: string, props: any) {
  const bind = props?.rtNodeId || props?.backendNodeId || props?.deviceNodeId
  if (bind) return String(bind)

  // ✅ 你现在表里是 any，所以 pump 默认 any
  if (nodeType === 'bpmn:pump') return 'any'

  // 其它节点先用画布 id（以后你愿意也能改成 any/rtNodeId）
  return nodeIdOf(model)
}

async function fetchOnce(model: BaseNodeModel, st: RtState) {
  const nodeType = normalizeType(String((model as any).type))
  const props: any = model.getProperties?.() ?? (model as any).properties ?? {}
  const backendNodeId = backendNodeIdOf(model, nodeType, props)

  const cursorRaw = props.__peekCursor ?? props.__rtCursor ?? null
  const cursor = cursorRaw === null || cursorRaw === undefined ? undefined : Number(cursorRaw)

  // ✅ 已判定 next 不存在：直接 peek
  if (st.supportsNext === false) {
    const peek = await getRealtimePeek(nodeType, backendNodeId)
    const rt = unwrapRt(peek)
    return { ...rt, cursor: cursorRaw }
  }

  // ✅ 先 next（顺序），失败再 peek（最新）
  try {
    const nxt = await getRealtimeNext(nodeType, backendNodeId, cursor)
    st.supportsNext = true

    const rt = unwrapRt(nxt)

    // 🌈 ✅ 循环播放核心：如果 done=true，就从头再拿一次（cursor 不传）
    if (rt.done) {
      const again = await getRealtimeNext(nodeType, backendNodeId) // 不带 cursor → 第一条
      const rt2 = unwrapRt(again)

      // 如果还是 done（说明真的没数据），就 peek 兜底
      if (rt2.done) {
        const peek = await getRealtimePeek(nodeType, backendNodeId)
        const rt3 = unwrapRt(peek)
        return { ...rt3, cursor: cursorRaw }
      }

      return { ...rt2, cursor: rt2.cursor ?? null }
    }

    return { ...rt, cursor: rt.cursor ?? cursorRaw }
  } catch (e: any) {
    const status = e?.response?.status
    if (status === 404) st.supportsNext = false

    const peek = await getRealtimePeek(nodeType, backendNodeId)
    const rt = unwrapRt(peek)
    return { ...rt, cursor: cursorRaw }
  }
}

function applyRealtime(model: BaseNodeModel, rt: { valueText: string; updatedAt: any; cursor: any }) {
  const parsed = parseValueText(rt.valueText)

  const patch: Record<string, any> = {
    __peekText: rt.valueText,
    __peekUpdatedAt: rt.updatedAt,
    __peekCursor: rt.cursor,

    __rtText: rt.valueText,
    __rtUpdatedAt: rt.updatedAt,
    __rtCursor: rt.cursor,
  }

  if (parsed.param) patch.param = parsed.param
  if (parsed.unit) patch.unit = parsed.unit
  if (parsed.value != null) patch.setpoint = parsed.value

  model.setProperties?.(patch)
  emitPropsChanged(model)
}

async function tick(model: BaseNodeModel) {
  const id = nodeIdOf(model)
  const st = states.get(id)
  if (!st) return
  if (st.owners.size === 0) return
  if (st.inflight) return

  st.inflight = (async () => {
    try {
      if (st.owners.size === 0) return
      const rt = await fetchOnce(model, st)
      if (st.owners.size === 0) return
      applyRealtime(model, rt)
    } catch (e) {
      const status = (e as any)?.response?.status
      if (status !== 404) console.warn('[realtime-poller] tick failed:', e)
    } finally {
      const st2 = states.get(id)
      if (st2) st2.inflight = null
    }
  })()

  await st.inflight
}

function start(model: BaseNodeModel, st: RtState) {
  if (st.timer != null) return
  tick(model).catch(() => {})
  st.timer = window.setInterval(() => tick(model).catch(() => {}), 1000)
}

function stop(id: string) {
  const st = states.get(id)
  if (!st) return
  if (st.timer != null) {
    clearInterval(st.timer)
    st.timer = null
  }
  st.inflight = null
  if (st.owners.size === 0) states.delete(id)
}

export function acquireRealtime(model: BaseNodeModel, owner: Owner) {
  const id = nodeIdOf(model)
  let st = states.get(id)
  if (!st) {
    st = { owners: new Set<Owner>(), timer: null, inflight: null, supportsNext: null }
    states.set(id, st)
  }
  st.owners.add(owner)
  start(model, st)
}

export function releaseRealtime(nodeId: string, owner: Owner) {
  const id = String(nodeId)
  const st = states.get(id)
  if (!st) return
  st.owners.delete(owner)
  if (st.owners.size === 0) stop(id)
}
