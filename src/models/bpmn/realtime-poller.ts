import type { BaseNodeModel } from '@logicflow/core'
import { getRealtimeNext, getRealtimePeek } from '@/api/realtime'
import { normalizeType } from './type-compat'
import { getRealtimeScenario } from './realtime-scenario'
import {
  getRealtimePlaybackStep,
  getRealtimePollIntervalMs,
  installRealtimeSpeedConsoleApi,
  shouldForceDifferentEachTick,
} from './realtime-speed'

type Owner = 'bubble' | 'panel' | 'auto'

type RtState = {
  owners: Set<Owner>
  timer: number | null
  started: boolean
  inflight: Promise<void> | null
  supportsNext: boolean | null
}

const states = new Map<string, RtState>()
installRealtimeSpeedConsoleApi()

// Auto stream allocation by component type.
// Example for flow-transmitter:
// 1st node -> swat-fit101
// 2nd node -> swat-fit201
const AUTO_STREAMS_BY_TYPE: Record<string, string[]> = {
  'bpmn:flow-transmitter': [
    'swat-fit101',
    'swat-fit201',
    'swat-fit301',
    'swat-fit401',
    'swat-fit501',
    'swat-fit502',
    'swat-fit503',
    'swat-fit504',
    'swat-fit601',
  ],
  'bpmn:level-transmitter': [
    'swat-lit101',
    'swat-lit301',
    'swat-lit401',
  ],
  'bpmn:motorized-valve': [
    'swat-mv101',
    'swat-mv201',
    'swat-mv301',
    'swat-mv302',
    'swat-mv303',
    'swat-mv304',
  ],
  'bpmn:conductivity-analyzer': [
    'swat-ait201',
    'swat-ait401',
    'swat-ait501',
  ],
  'bpmn:ph-analyzer': [
    'swat-ait202',
    'swat-ait402',
    'swat-ait502',
  ],
  'bpmn:orp-analyzer': [
    'swat-ait203',
    'swat-ait503',
  ],
  'bpmn:hardness-meter': [
    'swat-ait504',
  ],
  'bpmn:differential-pressure-transmitter': [
    'swat-dpit301',
  ],
  'bpmn:pressure-meter': [
    'swat-pit501',
    'swat-pit502',
    'swat-pit503',
  ],
  'bpmn:dechlorination-unit': [
    'swat-uv401',
  ],
}

const autoAllocCursor = new Map<string, number>()
const autoBindByNode = new Map<string, string>()

function nodeIdOf(model: BaseNodeModel) {
  return String((model as any).id)
}

function getGraphModel(model: any) {
  return model?.graphModel || model?.__graphModel || model?.props?.graphModel || null
}

function emitPropsChanged(model: BaseNodeModel) {
  const gm: any = getGraphModel(model as any)
  if (!gm?.eventCenter?.emit) return

  const id = nodeIdOf(model)
  const payload = { data: { id, properties: model.getProperties?.() ?? (model as any).properties } }

  gm.eventCenter.emit('node:properties-change', payload)
  gm.eventCenter.emit('node:propertiesChange', payload)
  gm.eventCenter.emit('properties:change', payload)
}

function parseValueText(valueText: string) {
  const text = String(valueText ?? '').trim()
  const m = text.match(/^(.+?):\s*([+-]?\d+(?:\.\d+)?)\s*([^\s:()]+)?\s*(.*)$/)
  if (!m) return { param: '', value: null as number | null, unit: '', suffix: '' }

  const param = (m[1] ?? '').trim()
  const value = Number(m[2])
  const unit = (m[3] ?? '').trim()
  const suffix = (m[4] ?? '').trim()

  return { param, value: Number.isFinite(value) ? value : null, unit, suffix }
}

function decimalsByType(nodeType: string, param: string) {
  if (nodeType === 'bpmn:ph-analyzer') return 2
  if (nodeType === 'bpmn:orp-analyzer') return 2
  if (nodeType === 'bpmn:conductivity-analyzer') return 2
  if (nodeType === 'bpmn:flow-transmitter') return 3
  if (nodeType === 'bpmn:level-transmitter') return 3
  if (nodeType === 'bpmn:pressure-meter') return 3
  if (nodeType === 'bpmn:differential-pressure-transmitter') return 3
  if (nodeType === 'bpmn:hardness-meter') return 3
  if (/^pH$/i.test(param)) return 2
  return 3
}

function formatNumber(value: number, decimals: number) {
  if (!Number.isFinite(value)) return ''
  return value.toFixed(Math.max(0, Math.min(6, decimals))).replace(/\.?0+$/, '')
}

function normalizeValueText(
  nodeType: string,
  parsed: { param: string; value: number | null; unit: string; suffix: string },
  fallbackText: string
) {
  if (!parsed.param || parsed.value == null) return fallbackText
  const decimals = decimalsByType(nodeType, parsed.param)
  const num = formatNumber(parsed.value, decimals)
  if (!num) return fallbackText

  const unit = parsed.unit ? ` ${parsed.unit}` : ''
  const suffix = parsed.suffix ? ` ${parsed.suffix}` : ''
  return `${parsed.param}: ${num}${unit}${suffix}`.trim()
}

function unwrapRt(res: any) {
  const d = res?.data ?? res
  const payload = d?.data ?? d

  return {
    valueText: payload?.valueText ?? '(no data)',
    updatedAt: payload?.updatedAt ?? null,
    cursor: payload?.cursor ?? null,
    done: payload?.done ?? false,
  }
}

function signatureOfValueText(valueText: string) {
  const p = parseValueText(valueText)
  if (p.param && p.value != null) {
    return `${p.param}|${p.value.toFixed(6)}|${p.unit || ''}`
  }
  return String(valueText ?? '').trim()
}

function autoBackendNodeId(nodeType: string, model: BaseNodeModel) {
  const props: any = model.getProperties?.() ?? (model as any).properties ?? {}
  const bindRule = String(props.__autoRtBindRule || '')
  const fixed = String(props.__autoRtNodeId || '').trim()
  if (fixed && bindRule === 'rank-v1') return fixed

  const nodeId = nodeIdOf(model)
  const key = `${nodeType}#${nodeId}`
  const existing = autoBindByNode.get(key)
  if (existing) return existing

  const pool = AUTO_STREAMS_BY_TYPE[nodeType]
  if (!pool || pool.length === 0) return null

  const gm: any = getGraphModel(model as any)
  const sameTypeNodes = Array.isArray(gm?.nodes)
    ? gm.nodes
        .filter((n: any) => normalizeType(String(n?.type || '')) === nodeType)
        .slice()
    : []

  const numericTail = (id: string) => {
    const m = String(id).match(/(\d+)(?!.*\d)/)
    return m ? Number(m[1]) : Number.MAX_SAFE_INTEGER
  }

  if (sameTypeNodes.length > 0) {
    sameTypeNodes.sort((a: any, b: any) => {
      const idA = String(a?.id || '')
      const idB = String(b?.id || '')
      const nA = numericTail(idA)
      const nB = numericTail(idB)
      if (nA !== nB) return nA - nB
      return idA.localeCompare(idB)
    })
  }

  const rank = sameTypeNodes.findIndex((n: any) => String(n?.id || '') === nodeId)
  const idx = rank >= 0 ? rank : (autoAllocCursor.get(nodeType) ?? 0)
  const chosen = pool[idx % pool.length]

  autoAllocCursor.set(nodeType, idx + 1)
  autoBindByNode.set(key, chosen)

  // Persist auto mapping onto node so it keeps stable after refresh/save/load.
  model.setProperties?.({
    __autoRtNodeId: chosen,
    __autoRtBindRule: 'rank-v1',
  })
  emitPropsChanged(model)

  return chosen
}

function withScenario(nodeId: string) {
  const scenario = getRealtimeScenario()

  // swat-fit101-normal / swat-fit101-attack -> rewrite suffix by current scenario
  if (/^swat-[a-z0-9-]+-(normal|attack)$/i.test(nodeId)) {
    return nodeId.replace(/-(normal|attack)$/i, `-${scenario}`)
  }
  // swat-fit101 -> append current scenario
  if (/^swat-[a-z0-9-]+$/i.test(nodeId)) {
    return `${nodeId}-${scenario}`
  }
  return nodeId
}

function backendNodeIdOf(model: BaseNodeModel, nodeType: string, props: any) {
  const bind = props?.rtNodeId || props?.backendNodeId || props?.deviceNodeId
  if (bind) return withScenario(String(bind))

  const auto = autoBackendNodeId(nodeType, model)
  if (auto) return withScenario(auto)

  return nodeIdOf(model)
}

function shouldUseStrictNodeId(backendNodeId: string) {
  return /^swat-[a-z0-9-]+-(normal|attack)$/i.test(backendNodeId)
}

function effectivePlaybackStep(forceDifferent: boolean) {
  // demo mode should progress one readable point per tick
  return forceDifferent ? 1 : getRealtimePlaybackStep()
}

async function fetchOnce(model: BaseNodeModel, st: RtState) {
  const nodeType = normalizeType(String((model as any).type))
  const props: any = model.getProperties?.() ?? (model as any).properties ?? {}
  const backendNodeId = backendNodeIdOf(model, nodeType, props)
  const strictNodeId = shouldUseStrictNodeId(backendNodeId)

  const scenario = getRealtimeScenario()
  const prevScenario = String(props.__rtScenario || '').toLowerCase()
  const scenarioChanged = prevScenario !== scenario

  const cursorRaw = scenarioChanged
    ? null
    : (props.__peekCursor ?? props.__rtCursor ?? null)

  if (scenarioChanged) {
    model.setProperties?.({
      __rtScenario: scenario,
      __peekCursor: null,
      __rtCursor: null,
      __peekRawText: null,
      __rtRawText: null,
    })
    emitPropsChanged(model)
  }

  const cursor = cursorRaw === null || cursorRaw === undefined ? undefined : Number(cursorRaw)
  const forceDifferent = shouldForceDifferentEachTick()
  const playbackStep = effectivePlaybackStep(forceDifferent)
  const prevText = String(props.__rtRawText ?? props.__peekRawText ?? props.__rtText ?? props.__peekText ?? '')
  const prevSig = signatureOfValueText(prevText)

  if (st.supportsNext === false) {
    const peek = await getRealtimePeek(nodeType, backendNodeId, strictNodeId)
    const rt = unwrapRt(peek)
    return { ...rt, cursor: cursorRaw }
  }

  try {
    const nxt = await getRealtimeNext(nodeType, backendNodeId, cursor, playbackStep, strictNodeId)
    st.supportsNext = true

    let rt = unwrapRt(nxt)
    if (rt.done) {
      const again = await getRealtimeNext(nodeType, backendNodeId, undefined, playbackStep, strictNodeId)
      const rt2 = unwrapRt(again)
      if (rt2.done) {
        const peek = await getRealtimePeek(nodeType, backendNodeId, strictNodeId)
        const rt3 = unwrapRt(peek)
        return { ...rt3, cursor: cursorRaw }
      }
      rt = { ...rt2, cursor: rt2.cursor ?? null }
    } else {
      rt = { ...rt, cursor: rt.cursor ?? cursorRaw }
    }

    if (!forceDifferent || !prevSig) return rt

    let nextRt = rt
    let hop = 0
    const maxHop = 120

    while (hop < maxHop) {
      const curSig = signatureOfValueText(nextRt.valueText)
      if (curSig !== prevSig) break
      const nextCursor = nextRt.cursor === null || nextRt.cursor === undefined ? undefined : Number(nextRt.cursor)
      const rr = unwrapRt(await getRealtimeNext(nodeType, backendNodeId, nextCursor, playbackStep, strictNodeId))
      if (rr.done) {
        const restart = unwrapRt(await getRealtimeNext(nodeType, backendNodeId, undefined, playbackStep, strictNodeId))
        if (restart.done) break
        nextRt = { ...restart, cursor: restart.cursor ?? null }
      } else {
        nextRt = { ...rr, cursor: rr.cursor ?? nextCursor ?? null }
      }
      hop++
    }

    return nextRt
  } catch (e: any) {
    const status = e?.response?.status
    if (status === 404) st.supportsNext = false

    const peek = await getRealtimePeek(nodeType, backendNodeId, strictNodeId)
    const rt = unwrapRt(peek)
    return { ...rt, cursor: cursorRaw }
  }
}

function applyRealtime(model: BaseNodeModel, rt: { valueText: string; updatedAt: any; cursor: any }) {
  const nodeType = normalizeType(String((model as any).type))
  const parsed = parseValueText(rt.valueText)
  const text = normalizeValueText(nodeType, parsed, rt.valueText)
  const decimals = decimalsByType(nodeType, parsed.param)
  const rounded = parsed.value == null ? null : Number(formatNumber(parsed.value, decimals))

  const patch: Record<string, any> = {
    __peekText: text,
    __peekRawText: rt.valueText,
    __peekUpdatedAt: rt.updatedAt,
    __peekCursor: rt.cursor,
    __rtText: text,
    __rtRawText: rt.valueText,
    __rtUpdatedAt: rt.updatedAt,
    __rtCursor: rt.cursor,
  }

  if (parsed.param) patch.param = parsed.param
  if (parsed.unit) patch.unit = parsed.unit
  if (rounded != null && Number.isFinite(rounded)) patch.setpoint = rounded

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
  if (st.started) return
  st.started = true
  tick(model).catch(() => {})

  const loop = () => {
    if (!st.started || st.owners.size === 0) return
    st.timer = window.setTimeout(async () => {
      st.timer = null
      if (!st.started || st.owners.size === 0) return
      await tick(model).catch(() => {})
      if (st.started && st.owners.size > 0) loop()
    }, getRealtimePollIntervalMs())
  }
  loop()
}

function stop(id: string) {
  const st = states.get(id)
  if (!st) return
  st.started = false
  if (st.timer != null) {
    clearTimeout(st.timer)
    st.timer = null
  }
  st.inflight = null
  if (st.owners.size === 0) states.delete(id)
}

export function acquireRealtime(model: BaseNodeModel, owner: Owner) {
  const id = nodeIdOf(model)
  let st = states.get(id)
  if (!st) {
    st = { owners: new Set<Owner>(), timer: null, started: false, inflight: null, supportsNext: null }
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
