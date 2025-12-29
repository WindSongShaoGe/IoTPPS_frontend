// src/models/bpmn/type-compat.ts
export const LEGACY_TYPE_MAP: Record<string, string> = {
  // ===== Actuating =====
  'bpmn:solenoidValve': 'bpmn:solenoid-valve',
  'bpmn:motorizedValve': 'bpmn:motorized-valve',

  // ===== Control =====
  'bpmn:chemicalDosingController': 'bpmn:chemical-dosing-controller',
  'bpmn:dosingController': 'bpmn:chemical-dosing-controller', // 额外兼容
  'bpmn:dataLogger': 'bpmn:data-logger',
  'bpmn:differentialPressureController': 'bpmn:differential-pressure-controller',
  'bpmn:dpController': 'bpmn:differential-pressure-controller', // 额外兼容

  // ===== Sensing =====
  'bpmn:conductivityAnalyzer': 'bpmn:conductivity-analyzer',
  'bpmn:differentialPressureTransmitter': 'bpmn:differential-pressure-transmitter',
  'bpmn:dpit': 'bpmn:differential-pressure-transmitter', // 额外兼容
  'bpmn:flowTransmitter': 'bpmn:flow-transmitter',
  'bpmn:hardnessMeter': 'bpmn:hardness-meter',
  'bpmn:levelTransmitter': 'bpmn:level-transmitter',
  'bpmn:orpAnalyzer': 'bpmn:orp-analyzer',
  'bpmn:phAnalyzer': 'bpmn:ph-analyzer',
  'bpmn:pressureMeter': 'bpmn:pressure-meter',

  // ===== Communication =====
  'bpmn:protocolModule': 'bpmn:protocol-module',
  'bpmn:dtuGateway': 'bpmn:dtu-gateway',
  'bpmn:wirelessModule': 'bpmn:wireless-module',

  // ===== Mechatronic（本次统一新增的映射）=====
  'bpmn:backwashPump': 'bpmn:backwash-pump',
  'bpmn:dosingPump': 'bpmn:dosing-pump',
  'bpmn:staticMixer': 'bpmn:static-mixer',
  'bpmn:roUnit': 'bpmn:reverse-osmosis-unit',
  'bpmn:ufUnit': 'bpmn:uf-unit',
  'bpmn:uvDechlorination': 'bpmn:dechlorination-unit',
  'bpmn:waterTank': 'bpmn:water-tank',
  'bpmn:pipeline': 'bpmn:water-pipeline',
  'bpmn:cartridgeFilter': 'bpmn:cartridge-filter',
  'bpmn:chemicalDosingTank': 'bpmn:chemical-tank',

  // ===== Cloud（本次统一新增的映射）=====
  'bpmn:cloudDatabase': 'bpmn:cloud-database',
  'bpmn:dataVisualizationPlatform': 'bpmn:data-visualization-platform',
  'bpmn:intelligentAnalyticsModule': 'bpmn:intelligent-analytics-module',
  'bpmn:remoteConsole': 'bpmn:remote-console',
}

export function normalizeType(t: any) {
  const s = String(t || '')
  return LEGACY_TYPE_MAP[s] || s
}

export function migrateGraphData(data: any) {
  if (!data) return data
  const cloned = JSON.parse(JSON.stringify(data))

  if (Array.isArray(cloned.nodes)) {
    cloned.nodes.forEach((n: any) => {
      n.type = normalizeType(n.type)
    })
  }

  if (Array.isArray(cloned.edges)) {
    cloned.edges.forEach((e: any) => {
      // 一般不需要动 edge type（pipe-edge 不属于 bpmn:*）
      // e.type = normalizeType(e.type)
    })
  }

  return cloned
}
