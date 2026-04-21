export type RealtimeScenario = 'normal' | 'attack'

const STORAGE_KEY = 'swatRealtimeScenario'
const EVENT_NAME = 'swat-realtime-scenario-change'

export function getRealtimeScenario(): RealtimeScenario {
  try {
    const raw = String(window.localStorage.getItem(STORAGE_KEY) || '').toLowerCase()
    return raw === 'attack' ? 'attack' : 'normal'
  } catch {
    return 'normal'
  }
}

export function setRealtimeScenario(next: RealtimeScenario) {
  const value: RealtimeScenario = next === 'attack' ? 'attack' : 'normal'
  try {
    window.localStorage.setItem(STORAGE_KEY, value)
    window.dispatchEvent(new CustomEvent(EVENT_NAME, { detail: { scenario: value } }))
  } catch {
    // ignore
  }
}

export function onRealtimeScenarioChange(handler: (scenario: RealtimeScenario) => void) {
  const fn = (ev: Event) => {
    const detail = (ev as CustomEvent<any>).detail
    const scenario: RealtimeScenario = detail?.scenario === 'attack' ? 'attack' : 'normal'
    handler(scenario)
  }
  window.addEventListener(EVENT_NAME, fn as EventListener)
  return () => window.removeEventListener(EVENT_NAME, fn as EventListener)
}

