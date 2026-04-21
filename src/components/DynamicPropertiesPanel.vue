<!-- src/components/DynamicPropertiesPanel.vue -->
<script setup lang="ts">
import type { PipeTypes } from '@/models/bpmn/pipes/pipe-types'
import type { FieldSchema } from '@/models/bpmn/schemas/commonSchema'
import { computed, onBeforeUnmount, onMounted, reactive, ref, watch } from 'vue'
import { PIPE_LABEL } from '@/models/bpmn/pipes/pipe-types'
import { acquireRealtime, releaseRealtime } from '@/models/bpmn/realtime-poller'

const props = defineProps<Props>()

console.log('[DynamicPropertiesPanel] loaded:', import.meta.url)

/** 画布永远不显示文字（仅写 properties） */
const SHOW_TEXT_ON_CANVAS = false

interface Props {
  lf: any
  selectedId: string | null
}
const selectedId = computed(() => props.selectedId ?? '')
const base = reactive({ name: '', desc: '' })
const schema = ref<FieldSchema[]>([])
const map = reactive<Record<string, any>>({})
const rangeCache = reactive<Record<string, any>>({})

/** ✅ 用来触发 titleInfo 重新计算（因为 lf 的 model/properties 本身不是 Vue 响应式） */
const propsTick = ref(0)

const PIPE_TYPE_OPTIONS = Object.keys(PIPE_LABEL) as PipeTypes[]
const PIPE_EDGE_SCHEMA: FieldSchema[] = [
  { key: 'pipeType', label: '管道类型', type: 'select', options: PIPE_TYPE_OPTIONS as string[] },
  { key: 'pipeWidth', label: '管径/宽度', type: 'number', step: 1 },
  { key: 'note', label: '备注', type: 'textarea', placeholder: '无内容' },
]

const PIPE_TYPE_LABEL_TO_KEY: Record<string, PipeTypes> = Object.fromEntries(
  Object.entries(PIPE_LABEL).map(([k, v]) => [v, k as PipeTypes]),
) as Record<string, PipeTypes>

function normalizePipeType(raw: any): PipeTypes {
  const value = String(raw || '').trim()
  if (PIPE_LABEL[value as PipeTypes])
    return value as PipeTypes
  if (PIPE_TYPE_LABEL_TO_KEY[value])
    return PIPE_TYPE_LABEL_TO_KEY[value]
  return 'Connection_Galvanized Steel Pipe'
}

function getOptionLabel(fieldKey: string, optionValue: string) {
  if (fieldKey === 'pipeType') {
    return PIPE_LABEL[normalizePipeType(optionValue)] || optionValue
  }
  return optionValue
}

function getSelectedModelById(id: string | null) {
  if (!id)
    return null
  return props.lf?.getNodeModelById?.(id) || props.lf?.getEdgeModelById?.(id) || null
}

function isPipeEdgeModel(model: any) {
  return String(model?.type ?? '') === 'pipe-edge'
}

function getPipeTitle(pipeTypeRaw: any) {
  const pipeType = normalizePipeType(pipeTypeRaw)
  const nameZh = PIPE_LABEL[pipeType] || '管道连接'
  const nameEn = pipeType.replace(/^Connection_/, '').trim() || 'Pipe Connection'
  return { nameZh, nameEn, pipeType }
}

/** ✅ 只读模式：对“泵”启用只读 */
const isReadOnly = computed(() => {
  if (!props.selectedId)
    return false
  const model = getSelectedModelById(props.selectedId)
  if (!model || isPipeEdgeModel(model))
    return false
  return String(model?.type ?? '') === 'bpmn:pump'
})

const isNameReadOnly = computed(() => {
  if (!props.selectedId)
    return false
  const model = getSelectedModelById(props.selectedId)
  if (isPipeEdgeModel(model))
    return true
  return isReadOnly.value
})

/** ====== 精确映射（键=nodes下文件名，不带 .ts） ====== */
const DEVICE_MAP: Record<string, { nameZh: string, nameEn: string, categoryZh: string, categoryEn: string }> = {
  // ---- Actuating
  'Actuating Devices_Motor': { nameZh: '电机', nameEn: 'Motor', categoryZh: '驱动类设备', categoryEn: 'Actuating Devices' },
  'Actuating Devices_Relay': { nameZh: '继电器', nameEn: 'Relay', categoryZh: '驱动类设备', categoryEn: 'Actuating Devices' },
  'Actuating Devices_Solenoid Valve': {
    nameZh: '电磁阀',
    nameEn: 'Solenoid Valve',
    categoryZh: '驱动类设备',
    categoryEn: 'Actuating Devices',
  },

  // ---- Cloud
  'Cloud Server_Cloud Database': {
    nameZh: '云数据库',
    nameEn: 'Cloud Database',
    categoryZh: '云服务器',
    categoryEn: 'Cloud Server',
  },
  // 兼容旧拼写
  'Cloud Serve_Cloud Database': {
    nameZh: '云数据库',
    nameEn: 'Cloud Database',
    categoryZh: '云服务器',
    categoryEn: 'Cloud Server',
  },
  'Cloud Server_Data Visualization Platform': {
    nameZh: '数据可视化平台',
    nameEn: 'Data Visualization Platform',
    categoryZh: '云服务器',
    categoryEn: 'Cloud Server',
  },
  'Cloud Server_Intelligent Analytics Module': {
    nameZh: '智能分析模块',
    nameEn: 'Intelligent Analytics Module',
    categoryZh: '云服务器',
    categoryEn: 'Cloud Server',
  },
  'Cloud Server_Remote Console': { nameZh: '远程控制台', nameEn: 'Remote Console', categoryZh: '云服务器', categoryEn: 'Cloud Server' },

  // ---- Communication
  'Communication Devices_Communication Protocol Module': {
    nameZh: '通信协议模块',
    nameEn: 'Communication Protocol Module',
    categoryZh: '通信类设备',
    categoryEn: 'Communication Devices',
  },
  'Communication Devices_Data Transmission Unit': {
    nameZh: '数据采集网关',
    nameEn: 'Data Transmission Unit',
    categoryZh: '通信类设备',
    categoryEn: 'Communication Devices',
  },
  'Communication Devices_Wireless Communication Module': {
    nameZh: '无线通信模块',
    nameEn: 'Wireless Communication Module',
    categoryZh: '通信类设备',
    categoryEn: 'Communication Devices',
  },

  // ---- Control
  'Control Devices_Chemical Dosing Controller': {
    nameZh: '配药控制器',
    nameEn: 'Chemical Dosing Controller',
    categoryZh: '控制类设备',
    categoryEn: 'Control Devices',
  },
  'Control Devices_Data Logger': { nameZh: '数据记录器', nameEn: 'Data Logger', categoryZh: '控制类设备', categoryEn: 'Control Devices' },
  'Control Devices_Differential Pressure Controller': {
    nameZh: '压差控制器',
    nameEn: 'Differential Pressure Controller',
    categoryZh: '控制类设备',
    categoryEn: 'Control Devices',
  },
  'Control Devices_PLC': { nameZh: 'PLC 控制器', nameEn: 'PLC', categoryZh: '控制类设备', categoryEn: 'Control Devices' },

  // ---- Mechatronic
  'Mechatronic Devices_Backwash Pump': { nameZh: '反洗泵', nameEn: 'Backwash Pump', categoryZh: '机电类设备', categoryEn: 'Mechatronic Devices' },
  'Mechatronic Devices_Cartridge Filter': { nameZh: '滤芯过滤器', nameEn: 'Cartridge Filter', categoryZh: '机电类设备', categoryEn: 'Mechatronic Devices' },
  'Mechatronic Devices_Chemical Dosing Tank': {
    nameZh: '药剂罐',
    nameEn: 'Chemical Dosing Tank',
    categoryZh: '机电类设备',
    categoryEn: 'Mechatronic Devices',
  },
  'Mechatronic Devices_Dosing Pump': { nameZh: '计量泵', nameEn: 'Dosing Pump', categoryZh: '机电类设备', categoryEn: 'Mechatronic Devices' },
  'Mechatronic Devices_Mixer': { nameZh: '搅拌器', nameEn: 'Mixer', categoryZh: '机电类设备', categoryEn: 'Mechatronic Devices' },
  'Mechatronic Devices_Motorized Valve': { nameZh: '电动阀门', nameEn: 'Motorized Valve', categoryZh: '机电类设备', categoryEn: 'Mechatronic Devices' },
  'Mechatronic Devices_Pump': { nameZh: '泵', nameEn: 'Pump', categoryZh: '机电类设备', categoryEn: 'Mechatronic Devices' },
  'Mechatronic Devices_Reverse Osmosis Unit': {
    nameZh: '反渗透装置',
    nameEn: 'Reverse Osmosis Unit',
    categoryZh: '机电类设备',
    categoryEn: 'Mechatronic Devices',
  },
  'Mechatronic Devices_Static Mixer': { nameZh: '静态混合器', nameEn: 'Static Mixer', categoryZh: '机电类设备', categoryEn: 'Mechatronic Devices' },
  'Mechatronic Devices_Ultrafiltration Unit': {
    nameZh: '超滤单元',
    nameEn: 'Ultrafiltration Unit',
    categoryZh: '机电类设备',
    categoryEn: 'Mechatronic Devices',
  },
  'Mechatronic Devices_Ultraviolet Dechlorination': {
    nameZh: '脱氯装置',
    nameEn: 'Ultraviolet Dechlorination',
    categoryZh: '机电类设备',
    categoryEn: 'Mechatronic Devices',
  },
  'Mechatronic Devices_Water Pipeline': { nameZh: '水管道', nameEn: 'Water Pipeline', categoryZh: '机电类设备', categoryEn: 'Mechatronic Devices' },
  'Mechatronic Devices_Water Tank': { nameZh: '水箱', nameEn: 'Water Tank', categoryZh: '机电类设备', categoryEn: 'Mechatronic Devices' },

  // ---- Sensing
  'Sensing Devices_Conductivity Analyzer': {
    nameZh: '电导率分析仪',
    nameEn: 'Conductivity Analyzer',
    categoryZh: '感知类设备',
    categoryEn: 'Sensing Devices',
  },
  'Sensing Devices_ Conductivity Analyzer': {
    nameZh: '电导率分析仪',
    nameEn: 'Conductivity Analyzer',
    categoryZh: '感知类设备',
    categoryEn: 'Sensing Devices',
  },
  'Sensing Devices_Differential Pressure Indicating Transmitter': {
    nameZh: '差压指示变送器',
    nameEn: 'Differential Pressure Indicating Transmitter',
    categoryZh: '感知类设备',
    categoryEn: 'Sensing Devices',
  },
  'Sensing Devices_Flow Transmitter': { nameZh: '流量变送器', nameEn: 'Flow Transmitter', categoryZh: '感知类设备', categoryEn: 'Sensing Devices' },
  'Sensing Devices_Hardness Meter of Water': {
    nameZh: '水硬度计',
    nameEn: 'Hardness Meter of Water',
    categoryZh: '感知类设备',
    categoryEn: 'Sensing Devices',
  },
  'Sensing Devices_Level Transmitter': { nameZh: '液位变送器', nameEn: 'Level Transmitter', categoryZh: '感知类设备', categoryEn: 'Sensing Devices' },
  'Sensing Devices_ORP Analyzer': { nameZh: '氧化还原电位分析仪', nameEn: 'ORP Analyzer', categoryZh: '感知类设备', categoryEn: 'Sensing Devices' },
  'Sensing Devices_PH Analyzer': { nameZh: 'pH分析仪', nameEn: 'pH Analyzer', categoryZh: '感知类设备', categoryEn: 'Sensing Devices' },
  'Sensing Devices_Pressure Meter': { nameZh: '液体压力计', nameEn: 'Pressure Meter', categoryZh: '感知类设备', categoryEn: 'Sensing Devices' },

  // ---- BPMN
  'StartEvent': { nameZh: '开始事件', nameEn: 'Start Event', categoryZh: 'BPMN', categoryEn: 'BPMN' },
  'EndEvent': { nameZh: '结束事件', nameEn: 'End Event', categoryZh: 'BPMN', categoryEn: 'BPMN' },
  'ServiceTask': { nameZh: '服务任务', nameEn: 'Service Task', categoryZh: 'BPMN', categoryEn: 'BPMN' },
  'UserTask': { nameZh: '用户任务', nameEn: 'User Task', categoryZh: 'BPMN', categoryEn: 'BPMN' },
}

/** type → 文件名 的别名 */
const TYPE_ALIAS: Record<string, string> = {
  'bpmn:pump': 'Mechatronic Devices_Pump',
  'bpmn:backwash-pump': 'Mechatronic Devices_Backwash Pump',
  'bpmn:cartridge-filter': 'Mechatronic Devices_Cartridge Filter',
  'bpmn:chemical-tank': 'Mechatronic Devices_Chemical Dosing Tank',
  'bpmn:dosing-pump': 'Mechatronic Devices_Dosing Pump',
  'bpmn:mixer': 'Mechatronic Devices_Mixer',
  'bpmn:motorized-valve': 'Mechatronic Devices_Motorized Valve',
  'bpmn:reverse-osmosis-unit': 'Mechatronic Devices_Reverse Osmosis Unit',
  'bpmn:static-mixer': 'Mechatronic Devices_Static Mixer',
  'bpmn:uf-unit': 'Mechatronic Devices_Ultrafiltration Unit',
  'bpmn:dechlorination-unit': 'Mechatronic Devices_Ultraviolet Dechlorination',
  'bpmn:water-pipeline': 'Mechatronic Devices_Water Pipeline',
  'bpmn:water-tank': 'Mechatronic Devices_Water Tank',

  'bpmn:motor': 'Actuating Devices_Motor',
  'bpmn:relay': 'Actuating Devices_Relay',
  'bpmn:solenoid-valve': 'Actuating Devices_Solenoid Valve',

  'bpmn:plc': 'Control Devices_PLC',
  'bpmn:chemical-dosing-controller': 'Control Devices_Chemical Dosing Controller',
  'bpmn:differential-pressure-controller': 'Control Devices_Differential Pressure Controller',
  'bpmn:data-logger': 'Control Devices_Data Logger',

  'bpmn:conductivity-analyzer': 'Sensing Devices_Conductivity Analyzer',
  'bpmn:orp-analyzer': 'Sensing Devices_ORP Analyzer',
  'bpmn:hardness-meter': 'Sensing Devices_Hardness Meter of Water',
  'bpmn:ph-analyzer': 'Sensing Devices_PH Analyzer',
  'bpmn:flow-transmitter': 'Sensing Devices_Flow Transmitter',
  'bpmn:level-transmitter': 'Sensing Devices_Level Transmitter',
  'bpmn:pressure-meter': 'Sensing Devices_Pressure Meter',
  'bpmn:differential-pressure-transmitter': 'Sensing Devices_Differential Pressure Indicating Transmitter',

  'bpmn:protocol-module': 'Communication Devices_Communication Protocol Module',
  'bpmn:wireless-module': 'Communication Devices_Wireless Communication Module',
  'bpmn:dtu-gateway': 'Communication Devices_Data Transmission Unit',

  'bpmn:cloud-database': 'Cloud Server_Cloud Database',
  'bpmn:data-visualization-platform': 'Cloud Server_Data Visualization Platform',
  'bpmn:intelligent-analytics-module': 'Cloud Server_Intelligent Analytics Module',
  'bpmn:remote-console': 'Cloud Server_Remote Console',

  'bpmn:startEvent': 'StartEvent',
  'bpmn:endEvent': 'EndEvent',
  'bpmn:userTask': 'UserTask',
  'bpmn:serviceTask': 'ServiceTask',
}

/** 规范化：去空格、转小写、去 -_. */
function norm(s: string) {
  return String(s || '')
    .toLowerCase()
    .replace(/\s+/g, '')
    .replace(/[-_.]/g, '')
}
function hasChinese(s: string) {
  return /[\u4E00-\u9FA5]/.test(String(s || ''))
}
function sameLoose(a: string, b: string) {
  const n = (x: string) =>
    String(x || '')
      .toLowerCase()
      .replace(/\s+/g, '')
      .replace(/[-_.]/g, '')
  return n(a) === n(b)
}

/** 设备名称别名(中/英) → 文件键 */
const NAME_ALIAS_TO_KEY: Record<string, string> = {
  [norm('Pump')]: 'Mechatronic Devices_Pump',
  [norm('泵')]: 'Mechatronic Devices_Pump',
  [norm('Backwash Pump')]: 'Mechatronic Devices_Backwash Pump',
  [norm('反冲洗泵')]: 'Mechatronic Devices_Backwash Pump',

  [norm('UF Unit')]: 'Mechatronic Devices_Ultrafiltration Unit',
  [norm('Ultrafiltration Unit (UF)')]: 'Mechatronic Devices_Ultrafiltration Unit',
  [norm('超滤装置')]: 'Mechatronic Devices_Ultrafiltration Unit',
  [norm('超滤单元')]: 'Mechatronic Devices_Ultrafiltration Unit',
  [norm('超滤单元(UF)')]: 'Mechatronic Devices_Ultrafiltration Unit',
  [norm('超滤单元（UF）')]: 'Mechatronic Devices_Ultrafiltration Unit',

  [norm('Agitator')]: 'Mechatronic Devices_Mixer',
  [norm('Agitator / Mixer')]: 'Mechatronic Devices_Mixer',
  [norm('搅拌器')]: 'Mechatronic Devices_Mixer',
  [norm('混合器')]: 'Mechatronic Devices_Mixer',
  [norm('搅拌器(混合器)')]: 'Mechatronic Devices_Mixer',
  [norm('搅拌器（混合器）')]: 'Mechatronic Devices_Mixer',

  [norm('Protocol Module')]: 'Communication Devices_Communication Protocol Module',
  [norm('Communication Protocol Module')]: 'Communication Devices_Communication Protocol Module',
  [norm('协议模块')]: 'Communication Devices_Communication Protocol Module',
  [norm('通信协议模块')]: 'Communication Devices_Communication Protocol Module',

  [norm('DTU Gateway')]: 'Communication Devices_Data Transmission Unit',
  [norm('Data Transmission Unit')]: 'Communication Devices_Data Transmission Unit',
  [norm('Data Transmission Unit (DTU)')]: 'Communication Devices_Data Transmission Unit',
  [norm('DTU网关')]: 'Communication Devices_Data Transmission Unit',
  [norm('数据采集网关')]: 'Communication Devices_Data Transmission Unit',
  [norm('数据采集网关(DTU)')]: 'Communication Devices_Data Transmission Unit',
  [norm('数据采集网关（DTU）')]: 'Communication Devices_Data Transmission Unit',

  [norm('Conductivity Analyzer')]: 'Sensing Devices_Conductivity Analyzer',
  [norm('电导率分析仪')]: 'Sensing Devices_Conductivity Analyzer',
  [norm('ORP Analyzer')]: 'Sensing Devices_ORP Analyzer',
  [norm('氧化还原电位分析仪')]: 'Sensing Devices_ORP Analyzer',
  [norm('Hardness Meter')]: 'Sensing Devices_Hardness Meter of Water',
  [norm('Hardness Meter of Water')]: 'Sensing Devices_Hardness Meter of Water',
  [norm('水硬度计')]: 'Sensing Devices_Hardness Meter of Water',
  [norm('pH Analyzer')]: 'Sensing Devices_PH Analyzer',
  [norm('pH分析仪')]: 'Sensing Devices_PH Analyzer',
  [norm('Pressure Meter')]: 'Sensing Devices_Pressure Meter',
  [norm('液体压力计')]: 'Sensing Devices_Pressure Meter',
  [norm('Differential Pressure Transmitter')]: 'Sensing Devices_Differential Pressure Indicating Transmitter',
  [norm('Differential Pressure Indicating Transmitter')]: 'Sensing Devices_Differential Pressure Indicating Transmitter',
  [norm('差压指示变送器')]: 'Sensing Devices_Differential Pressure Indicating Transmitter',

  [norm('Cloud Database')]: 'Cloud Server_Cloud Database',
  [norm('云数据库')]: 'Cloud Server_Cloud Database',
}

/** 从 properties 里尽可能拿到“设备名称”（中/英） */
function getDeviceNameFromProps(p: Record<string, any>) {
  if (!p)
    return { nameZh: '', nameEn: '' }

  const preferZh = ['nameZh', '设备名称', 'deviceNameZh', 'deviceZh', 'cnName', 'devNameZh']
  const preferEn = ['nameEn', 'deviceNameEn', 'Device Name', 'device_en', 'devName', 'enName']

  let nameZh = preferZh.map(k => p[k]).find(v => typeof v === 'string' && v.trim()) || ''
  let nameEn = preferEn.map(k => p[k]).find(v => typeof v === 'string' && v.trim()) || ''

  const genericName = typeof p.deviceName === 'string' ? p.deviceName.trim() : ''
  if (!nameZh && genericName && hasChinese(genericName))
    nameZh = genericName
  if (!nameEn && genericName && !hasChinese(genericName))
    nameEn = genericName

  if (!nameZh || !nameEn) {
    for (const [k, v] of Object.entries(p)) {
      if (typeof v !== 'string')
        continue
      const val = v.trim()
      if (!val)
        continue
      const keyNorm = norm(k)
      const looksLikeNameKey = /(device|dev|name)/.test(keyNorm)
      if (!nameZh && /[\u4E00-\u9FA5]/.test(val) && looksLikeNameKey)
        nameZh = val
      if (!nameEn && !/[\u4E00-\u9FA5]/.test(val) && looksLikeNameKey)
        nameEn = val
    }
  }
  return { nameZh, nameEn }
}

/** 计算映射 Key：设备名 → 显式 fileName → type 别名 */
function deriveKey(model: any, p: Record<string, any>) {
  const { nameZh, nameEn } = getDeviceNameFromProps(p)

  // ① 先走手动别名
  const enKey = NAME_ALIAS_TO_KEY[norm(nameEn)]
  if (enKey && DEVICE_MAP[enKey])
    return enKey

  const zhKey = NAME_ALIAS_TO_KEY[norm(nameZh)]
  if (zhKey && DEVICE_MAP[zhKey])
    return zhKey

  // ② 再走显式字段
  const explicit = p.fileName || p.nodeKey || p.titleKey
  if (explicit && DEVICE_MAP[explicit])
    return explicit as string

  // ③ 再按 DEVICE_MAP 里的 nameZh / nameEn 自动匹配
  for (const [key, item] of Object.entries(DEVICE_MAP)) {
    if (
      (nameZh && norm(item.nameZh) === norm(nameZh))
      || (nameEn && norm(item.nameEn) === norm(nameEn))
    ) {
      return key
    }
  }

  // ④ 最后再走 type 别名
  if (model?.type && TYPE_ALIAS[model.type]) {
    const k = TYPE_ALIAS[model.type]
    if (DEVICE_MAP[k])
      return k
  }

  return ''
}

/** 抬头信息 */
const titleInfo = computed(() => {
  propsTick.value // ✅ 依赖 tick，properties-change 时也会重算

  if (!props.selectedId)
    return { nameZh: '', nameEn: '', categoryZh: '', categoryEn: '' }
  const model = getSelectedModelById(props.selectedId)
  if (!model)
    return { nameZh: '', nameEn: '', categoryZh: '', categoryEn: '' }
  const p = model?.properties ?? {}

  if (isPipeEdgeModel(model)) {
    const { nameZh, nameEn } = getPipeTitle(p.pipeType || model.pipeType)
    return {
      nameZh,
      nameEn,
      categoryZh: '管道系统',
      categoryEn: 'Piping',
    }
  }

  let { nameZh, nameEn } = getDeviceNameFromProps(p)
  if (!nameZh)
    nameZh = p.nameZh || base.name || ''
  if (!nameEn)
    nameEn = p.nameEn || p.enName || ''

  let categoryZh = p.categoryZh || ''
  let categoryEn = p.categoryEn || ''
  if (categoryZh === '执行类设备')
    categoryZh = '驱动类设备'

  const needDict = !categoryZh || !categoryEn || !nameEn || hasChinese(nameEn) || sameLoose(nameEn, nameZh)
  const key = needDict ? deriveKey(model, p) : ''
  const dict = key ? DEVICE_MAP[key] : undefined

  if (dict) {
    categoryZh = categoryZh || dict.categoryZh
    categoryEn = categoryEn || dict.categoryEn
    if (!nameZh || !hasChinese(nameZh))
      nameZh = dict.nameZh
    if (!nameEn || hasChinese(nameEn) || sameLoose(nameEn, nameZh))
      nameEn = dict.nameEn
  }

  return { nameZh, nameEn, categoryZh, categoryEn }
})

/** 自动写回（不覆盖用户已填；画布文字始终隐藏） */
function autoFill(nodeId: string) {
  const model = props.lf?.getNodeModelById?.(nodeId)
  if (!model)
    return
  const p = model.properties ?? {}

  const key = deriveKey(model, p)
  const dict = key ? DEVICE_MAP[key] : undefined
  const { nameZh: devZh, nameEn: devEn } = getDeviceNameFromProps(p)
  const patch: Record<string, any> = {}

  const zhNow = p.nameZh || devZh || ''
  if (dict && (!zhNow || !hasChinese(zhNow)))
    patch.nameZh = dict.nameZh

  const enNow = p.nameEn || p.enName || devEn || ''
  const zhForCompare = patch.nameZh || zhNow
  if (dict && (!enNow || hasChinese(enNow) || sameLoose(enNow, zhForCompare)))
    patch.nameEn = dict.nameEn

  if (dict) {
    if (!p.categoryZh || p.categoryZh === '执行类设备')
      patch.categoryZh = dict.categoryZh
    if (!p.categoryEn)
      patch.categoryEn = dict.categoryEn
  }

  if (Object.keys(patch).length)
    props.lf.setProperties(nodeId, patch)
  if (!SHOW_TEXT_ON_CANVAS)
    props.lf.updateText(nodeId, '')

  base.name = patch.nameZh || (hasChinese(zhNow) ? zhNow : (dict?.nameZh || zhNow))
  map.nameEn = (patch.nameEn || enNow) || ''
}

/** 刷新右侧面板（只在选中节点变化时完整刷新） */
function syncFromSelected() {
  resetAll()
  if (!props.selectedId)
    return
  const model = getSelectedModelById(props.selectedId)
  if (!model)
    return
  const p = model.properties || {}

  if (isPipeEdgeModel(model)) {
    const { nameZh, nameEn, pipeType } = getPipeTitle(p.pipeType || model.pipeType)
    const width = Number(p.pipeWidth ?? model.pipeWidth ?? 12)

    base.name = nameZh
    base.desc = ''
    schema.value = PIPE_EDGE_SCHEMA
    map.nameEn = nameEn
    map.pipeType = pipeType
    map.pipeWidth = Number.isFinite(width) ? width : 12
    propsTick.value++
    return
  }

  base.name = getDeviceNameFromProps(p).nameZh || p.nameZh || model.text?.value || ''
  base.desc = p.note || ''

  schema.value = (model?.constructor as any)?.formSchema || []
  for (const f of schema.value) {
    if (f.type === 'range' && f.minKey && f.maxKey) {
      rangeCache[f.minKey] = getByPath(p, f.minKey)
      rangeCache[f.maxKey] = getByPath(p, f.maxKey)
    }
    else {
      map[f.key] = p[f.key] ?? ''
    }
  }
  map.nameEn = getDeviceNameFromProps(p).nameEn || p.nameEn || p.enName || ''

  autoFill(props.selectedId!)
  console.log('[schema keys]', schema.value.map(s => `${s.label}:${s.key}`))
}

/** ====== ✅ 统一 realtime：面板不再自己轮询后端，只做订阅/取消订阅 ====== */
let rtOwnerId: string | null = null

function attachRealtimeIfNeeded(id: string) {
  const model = props.lf?.getNodeModelById?.(id)
  if (!model)
    return
  const t = String(model?.type ?? '')
  if (t === 'bpmn:pump') {
    acquireRealtime(model, 'panel')
    rtOwnerId = id
  }
}

function detachRealtime() {
  if (rtOwnerId) {
    releaseRealtime(rtOwnerId, 'panel')
    rtOwnerId = null
  }
}

/** ✅ ✅ ✅ 关键：uiSyncTimer 必须在 watch 之前声明（避免 TDZ 报错） */
let uiSyncTimer: number | null = null

function stopUiSync() {
  if (uiSyncTimer != null) {
    clearInterval(uiSyncTimer)
    uiSyncTimer = null
  }
}

/** 只读泵：面板跟随 properties 变化（不请求后端） */
function syncRealtimeFromModelId(id: string) {
  const model = getSelectedModelById(id)
  if (!model)
    return
  const p = model?.properties ?? {}

  if (isPipeEdgeModel(model)) {
    const { pipeType } = getPipeTitle(p.pipeType || model.pipeType)
    const width = Number(p.pipeWidth ?? model.pipeWidth ?? 12)
    map.pipeType = pipeType
    map.pipeWidth = Number.isFinite(width) ? width : 12
    map.nameEn = pipeType.replace(/^Connection_/, '').trim() || 'Pipe Connection'
    propsTick.value++
    return
  }

  // ✅ poller 写入的业务字段（右侧表单要跟着动就同步它们）
  if (p.param !== undefined)
    map.param = p.param ?? ''
  if (p.unit !== undefined)
    map.unit = p.unit ?? ''
  if (p.setpoint !== undefined)
    map.setpoint = p.setpoint ?? ''

  // ✅ 需要的话可用于调试，不影响表单
  ;(map as any).__peekText = p.__peekText
  ;(map as any).__peekUpdatedAt = p.__peekUpdatedAt
  ;(map as any).__peekCursor = p.__peekCursor

  // ✅ 触发 titleInfo 重新算
  propsTick.value++
}

function startUiSyncIfPump(id: string) {
  const model = props.lf?.getNodeModelById?.(id)
  if (String(model?.type ?? '') !== 'bpmn:pump')
    return

  stopUiSync()
  uiSyncTimer = window.setInterval(() => {
    if (!props.selectedId)
      return
    syncRealtimeFromModelId(props.selectedId)
  }, 200) // 200ms 顺滑；改成 500ms 更省
}

/** 新拖入节点：自动填充并隐藏文字 */
function onNodeAdd({ data }: any) {
  if (data?.id)
    autoFill(data.id)
}

/** properties 变化：收到事件就同步一次（比定时器更“实时”） */
function onPropsChanged(e: any) {
  const id = e?.data?.id ?? e?.id ?? e?.node?.id
  if (!id || id !== props.selectedId)
    return
  syncRealtimeFromModelId(id)
}

/** ✅ ✅ ✅ 更稳：等 lf 和 selectedId 都就绪再工作 */
watch(
  [() => props.lf, () => props.selectedId],
  ([lf, id]) => {
    detachRealtime()
    stopUiSync()

    if (!lf || !id) {
      resetAll()
      return
    }

    syncFromSelected()

    attachRealtimeIfNeeded(id)
    startUiSyncIfPump(id)
    syncRealtimeFromModelId(id) // 立刻同步一次
  },
  { immediate: true },
)

onMounted(() => {
  props.lf?.on?.('node:add', onNodeAdd)

  props.lf?.on?.('node:properties-change', onPropsChanged)
  props.lf?.on?.('edge:properties-change', onPropsChanged)
  props.lf?.on?.('node:propertiesChange', onPropsChanged)
  props.lf?.on?.('edge:propertiesChange', onPropsChanged)
  props.lf?.on?.('properties:change', onPropsChanged)
})

onBeforeUnmount(() => {
  detachRealtime()
  stopUiSync()

  props.lf?.off?.('node:add', onNodeAdd)

  props.lf?.off?.('node:properties-change', onPropsChanged)
  props.lf?.off?.('edge:properties-change', onPropsChanged)
  props.lf?.off?.('node:propertiesChange', onPropsChanged)
  props.lf?.off?.('edge:propertiesChange', onPropsChanged)
  props.lf?.off?.('properties:change', onPropsChanged)
})

/** 名称输入：仅更新 properties，不写画布文本 */
function onNameInput() {
  if (!props.selectedId || isReadOnly.value)
    return
  const model = getSelectedModelById(props.selectedId)
  if (isPipeEdgeModel(model))
    return
  props.lf?.setProperties?.(props.selectedId, { nameZh: base.name || '' })
  if (!SHOW_TEXT_ON_CANVAS)
    props.lf?.updateText?.(props.selectedId, '')
}

function commitKey(key: string, toNumber = false) {
  if (!props.selectedId || isReadOnly.value)
    return
  const val = map[key]
  props.lf?.setProperties?.(props.selectedId, { [key]: toNumber ? numberOrNull(val) : val })
}

function commitRange(f: FieldSchema) {
  if (!props.selectedId || !f.minKey || !f.maxKey || isReadOnly.value)
    return
  const min = numberOrNull(rangeCache[f.minKey])
  const max = numberOrNull(rangeCache[f.maxKey])
  const containerKey = f.minKey.split('.')[0]
  props.lf?.setProperties?.(props.selectedId, { [containerKey]: { min, max } })
}

/** 工具 */
function resetAll() {
  base.name = ''
  base.desc = ''
  schema.value = []
  for (const k in map) delete map[k]
  for (const k in rangeCache) delete rangeCache[k]
}

function numberOrNull(v: any) {
  const n = Number(v)
  return Number.isFinite(n) ? n : null
}

function getByPath(obj: any, path?: string) {
  if (!path)
    return undefined
  return path.split('.').reduce((o, k) => o?.[k], obj)
}
</script>

<template>
  <div class="prop-panel">
    <div v-if="selectedId" class="title-block">
      <div class="title-row zh">
        <span class="title-name">{{ titleInfo.nameZh || '-' }}</span>
        <span class="title-dot">·</span>
        <span class="title-cat">{{ titleInfo.categoryZh || '未分类' }}</span>
      </div>
      <div class="title-row en">
        <span class="title-name">{{ titleInfo.nameEn || 'English name' }}</span>
        <span class="title-dot">·</span>
        <span class="title-cat">{{ titleInfo.categoryEn || 'Category' }}</span>
      </div>
    </div>

    <div class="form-item">
      <label>名称</label>
      <input
        v-model="base.name"
        class="ipt"
        placeholder="显示在节点上的文字"
        :readonly="isNameReadOnly"
        @input="onNameInput"
      >
    </div>

    <div class="form-item">
      <label>英文名</label>
      <input
        v-model="map.nameEn"
        class="ipt"
        placeholder="English name"
        :readonly="isNameReadOnly"
        @change="commitKey('nameEn')"
      >
    </div>

    <hr class="sep">

    <template v-if="schema.length">
      <div class="section-title">
        节点属性
      </div>
      <div class="grid">
        <template v-for="f in schema" :key="f.key">
          <div v-if="f.type === 'text'" class="form-item">
            <label>{{ f.label }}</label>
            <input
              v-model="map[f.key]"
              class="ipt"
              :placeholder="f.placeholder"
              :readonly="isReadOnly"
              @change="commitKey(f.key)"
            >
          </div>

          <div v-else-if="f.type === 'number'" class="form-item">
            <label>{{ f.label }}</label>
            <input
              v-model.number="map[f.key]"
              class="ipt"
              type="number"
              :step="f.step || 1"
              :disabled="isReadOnly"
              @change="commitKey(f.key, true)"
            >
          </div>

          <div v-else-if="f.type === 'textarea'" class="form-item form-item--full">
            <label>{{ f.label }}</label>
            <textarea
              v-model="map[f.key]"
              class="ipt"
              rows="3"
              :placeholder="f.placeholder"
              :readonly="isReadOnly"
              @change="commitKey(f.key)"
            />
          </div>

          <div v-else-if="f.type === 'date'" class="form-item">
            <label>{{ f.label }}</label>
            <input
              v-model="map[f.key]"
              class="ipt"
              type="date"
              :disabled="isReadOnly"
              @change="commitKey(f.key)"
            >
          </div>

          <div v-else-if="f.type === 'select' || f.type === 'radio'" class="form-item">
            <label>{{ f.label }}</label>
            <select
              v-model="map[f.key]"
              class="ipt"
              :disabled="isReadOnly"
              @change="commitKey(f.key)"
            >
              <option v-for="op in f.options || []" :key="op" :value="op">
                {{ op }}
              </option>
            </select>
          </div>

          <div v-else-if="f.type === 'range'" class="form-item form-item--full">
            <label>{{ f.label }}</label>
            <div class="range">
              <input
                v-model.number="rangeCache[f.minKey!]"
                class="ipt"
                type="number"
                :step="f.step || 1"
                placeholder="最小值"
                :disabled="isReadOnly"
                @change="commitRange(f)"
              >
              <span class="range__sep">~</span>
              <input
                v-model.number="rangeCache[f.maxKey!]"
                class="ipt"
                type="number"
                :step="f.step || 1"
                placeholder="最大值"
                :disabled="isReadOnly"
                @change="commitRange(f)"
              >
            </div>
          </div>
        </template>
      </div>
    </template>

    <template v-else>
      <div class="empty">
        该类型暂未提供字段定义（formSchema）。
      </div>
    </template>
  </div>
</template>

<style scoped>
.prop-panel {
  background: #fff;
  padding: 16px 16px 28px;
  overflow: auto;
  height: 100%;
}
.title-block {
  padding: 6px 0 10px;
  border-bottom: 1px solid #eee;
  margin-bottom: 12px;
}
.title-row {
  display: flex;
  align-items: baseline;
  gap: 8px;
  line-height: 1.2;
}
.title-row.zh {
  font-size: 16px;
  font-weight: 700;
  color: #222;
}
.title-row.en {
  font-size: 13px;
  color: #666;
  margin-top: 6px;
}
.title-name {
  white-space: nowrap;
}
.title-dot {
  color: #aaa;
}
.title-cat {
  white-space: nowrap;
}

.section-title {
  font-weight: 600;
  margin: 8px 0 6px;
}
.sep {
  border: none;
  border-top: 1px solid #eee;
  margin: 14px 0;
}
.form-item {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-bottom: 10px;
}
.form-item--full {
  grid-column: 1 / -1;
}
label {
  font-size: 12px;
  color: #666;
}
.ipt {
  width: 100%;
  box-sizing: border-box;
  border: 1px solid #dcdfe6;
  border-radius: 6px;
  padding: 8px 10px;
  outline: none;
}
.grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px 12px;
}
.range {
  display: flex;
  align-items: center;
  gap: 8px;
}
.range__sep {
  color: #999;
}
.empty {
  color: #888;
  font-size: 12px;
  margin-top: 8px;
}

/* ✅ disabled 也保持“看起来正常”，不要灰成一片 */
.ipt:disabled {
  background: #fff;
  color: #222;
  opacity: 1;
  cursor: not-allowed;
}
</style>
