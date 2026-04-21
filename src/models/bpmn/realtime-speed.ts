export type RealtimeSpeedMode = 'normal' | 'demo'

const MODE_KEY = 'swatRealtimeSpeedMode'
const STEP_KEY = 'swatPlaybackStep'
const POLL_KEY = 'swatPollIntervalMs'
const FORCE_DIFF_KEY = 'swatForceDifferentEachTick'
const EVENT_NAME = 'swat-realtime-speed-change'

const PRESET: Record<RealtimeSpeedMode, { step: number; pollMs: number; forceDifferentEachTick: boolean }> = {
  // normal mode: sequential playback
  normal: { step: 1, pollMs: 1000, forceDifferentEachTick: false },
  // demo mode: changed value each tick, every 2s
  demo: { step: 1, pollMs: 2000, forceDifferentEachTick: true },
}

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n))
}

function readNumber(key: string): number | null {
  try {
    const raw = Number(window.localStorage.getItem(key))
    return Number.isFinite(raw) ? raw : null
  } catch {
    return null
  }
}

function readBoolean(key: string): boolean | null {
  try {
    const raw = String(window.localStorage.getItem(key) || '').toLowerCase()
    if (!raw) return null
    if (raw === '1' || raw === 'true') return true
    if (raw === '0' || raw === 'false') return false
    return null
  } catch {
    return null
  }
}

function emitChange() {
  try {
    window.dispatchEvent(new CustomEvent(EVENT_NAME, { detail: status() }))
  } catch {
    // ignore
  }
}

export function getRealtimeSpeedMode(): RealtimeSpeedMode {
  try {
    const raw = String(window.localStorage.getItem(MODE_KEY) || '').toLowerCase()
    return raw === 'demo' ? 'demo' : 'normal'
  } catch {
    return 'normal'
  }
}

export function setRealtimeSpeedMode(next: RealtimeSpeedMode) {
  const mode: RealtimeSpeedMode = next === 'demo' ? 'demo' : 'normal'
  try {
    window.localStorage.setItem(MODE_KEY, mode)
    // clear manual overrides so mode switch is deterministic
    window.localStorage.removeItem(STEP_KEY)
    window.localStorage.removeItem(POLL_KEY)
    window.localStorage.removeItem(FORCE_DIFF_KEY)
  } catch {
    // ignore
  }
  emitChange()
}

export function getRealtimePlaybackStep() {
  const mode = getRealtimeSpeedMode()
  const fromStorage = readNumber(STEP_KEY)
  if (fromStorage == null) return PRESET[mode].step
  const step = clamp(Math.round(fromStorage), 1, 500)
  // demo mode is fixed to step=1 for stable, readable playback
  if (mode === 'demo') return 1
  return step
}

export function getRealtimePollIntervalMs() {
  const mode = getRealtimeSpeedMode()
  const fromStorage = readNumber(POLL_KEY)
  if (fromStorage == null) return PRESET[mode].pollMs
  const pollMs = clamp(Math.round(fromStorage), 150, 5000)
  // demo mode must stay readable: at least 2 seconds per change
  if (mode === 'demo') return Math.max(2000, pollMs)
  return pollMs
}

export function shouldForceDifferentEachTick() {
  const mode = getRealtimeSpeedMode()
  const fromStorage = readBoolean(FORCE_DIFF_KEY)
  if (fromStorage == null) return PRESET[mode].forceDifferentEachTick
  return fromStorage
}

export function setRealtimeSpeed(step: number, pollMs: number) {
  try {
    window.localStorage.setItem(STEP_KEY, String(clamp(Math.round(step), 1, 500)))
    window.localStorage.setItem(POLL_KEY, String(clamp(Math.round(pollMs), 150, 5000)))
  } catch {
    // ignore
  }
  emitChange()
}

export function setForceDifferentEachTick(force: boolean) {
  try {
    window.localStorage.setItem(FORCE_DIFF_KEY, force ? 'true' : 'false')
  } catch {
    // ignore
  }
  emitChange()
}

export function clearRealtimeSpeedOverride() {
  try {
    window.localStorage.removeItem(STEP_KEY)
    window.localStorage.removeItem(POLL_KEY)
    window.localStorage.removeItem(FORCE_DIFF_KEY)
  } catch {
    // ignore
  }
  emitChange()
}

export function onRealtimeSpeedChange(handler: (s: ReturnType<typeof status>) => void) {
  const fn = (ev: Event) => {
    const detail = (ev as CustomEvent<any>).detail
    if (detail && typeof detail === 'object') {
      handler(detail as ReturnType<typeof status>)
      return
    }
    handler(status())
  }
  window.addEventListener(EVENT_NAME, fn as EventListener)
  return () => window.removeEventListener(EVENT_NAME, fn as EventListener)
}

export function status() {
  return {
    mode: getRealtimeSpeedMode(),
    step: getRealtimePlaybackStep(),
    pollMs: getRealtimePollIntervalMs(),
    forceDifferentEachTick: shouldForceDifferentEachTick(),
  }
}

export function installRealtimeSpeedConsoleApi() {
  if (typeof window === 'undefined') return
  if ((window as any).swatRealtime) return

  const api = {
    status,
    demo() {
      setRealtimeSpeedMode('demo')
      return status()
    },
    normal() {
      setRealtimeSpeedMode('normal')
      return status()
    },
    set(step: number, pollMs: number) {
      setRealtimeSpeed(step, pollMs)
      return status()
    },
    different(force: boolean) {
      setForceDifferentEachTick(force)
      return status()
    },
    reset() {
      clearRealtimeSpeedOverride()
      return status()
    },
  }

  ;(window as any).swatRealtime = api
  ;(window as any).swatDemoMode = (on: boolean) => {
    setRealtimeSpeedMode(on ? 'demo' : 'normal')
    return status()
  }
}
