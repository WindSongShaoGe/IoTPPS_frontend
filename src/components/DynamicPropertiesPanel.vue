<template>
  <div class="prop-panel">
    <!-- 顶部双语抬头（名称以“设备名称”为准；类别由映射推断） -->
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

    <!-- 表单：名称 / 英文名（只写 properties，不写画布文本） -->
    <div class="form-item">
      <label>名称</label>
      <input class="ipt" v-model="base.name" @input="onNameInput" placeholder="显示在节点上的文字" />
    </div>
    <div class="form-item">
      <label>英文名</label>
      <input class="ipt" v-model="map.nameEn" @change="commitKey('nameEn')" placeholder="English name" />
    </div>

    <hr class="sep" />

    <!-- 动态字段 -->
    <template v-if="schema.length">
      <div class="section-title">节点属性</div>
      <div class="grid">
        <template v-for="f in schema" :key="f.key">
          <div v-if="f.type==='text'" class="form-item">
            <label>{{ f.label }}</label>
            <input class="ipt" :placeholder="f.placeholder" v-model="map[f.key]" @change="commitKey(f.key)" />
          </div>

          <div v-else-if="f.type==='number'" class="form-item">
            <label>{{ f.label }}</label>
            <input class="ipt" type="number" :step="f.step || 1" v-model.number="map[f.key]" @change="commitKey(f.key,true)" />
          </div>

          <div v-else-if="f.type==='textarea'" class="form-item form-item--full">
            <label>{{ f.label }}</label>
            <textarea class="ipt" rows="3" :placeholder="f.placeholder" v-model="map[f.key]" @change="commitKey(f.key)"></textarea>
          </div>

          <div v-else-if="f.type==='date'" class="form-item">
            <label>{{ f.label }}</label>
            <input class="ipt" type="date" v-model="map[f.key]" @change="commitKey(f.key)" />
          </div>

          <div v-else-if="f.type==='select' || f.type==='radio'" class="form-item">
            <label>{{ f.label }}</label>
            <select class="ipt" v-model="map[f.key]" @change="commitKey(f.key)">
              <option v-for="op in (f.options||[])" :key="op" :value="op">{{ op }}</option>
            </select>
          </div>

          <div v-else-if="f.type==='range'" class="form-item form-item--full">
            <label>{{ f.label }}</label>
            <div class="range">
              <input class="ipt" type="number" :step="f.step || 1"
                     v-model.number="rangeCache[f.minKey!]" @change="commitRange(f)" placeholder="最小值" />
              <span class="range__sep">~</span>
              <input class="ipt" type="number" :step="f.step || 1"
                     v-model.number="rangeCache[f.maxKey!]" @change="commitRange(f)" placeholder="最大值" />
            </div>
          </div>
        </template>
      </div>
    </template>

    <template v-else>
      <div class="empty">该类型暂未提供字段定义（formSchema）。</div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed, reactive, ref, watch, onMounted, onBeforeUnmount } from 'vue'
import type { FieldSchema } from '@/models/bpmn/schemas/commonSchema'

/** 画布永远不显示文字 */
const SHOW_TEXT_ON_CANVAS = false

interface Props { lf: any; selectedId: string | null }
const props = defineProps<Props>()

const selectedId = computed(() => props.selectedId ?? '')
const base = reactive({ name: '', desc: '' })
const schema = ref<FieldSchema[]>([])
const map = reactive<Record<string, any>>({})
const rangeCache = reactive<Record<string, any>>({})

/** ====== 精确映射（键=nodes下文件名，不带 .ts） ====== */
const DEVICE_MAP: Record<string, {nameZh:string, nameEn:string, categoryZh:string, categoryEn:string}> = {
  // ---- Actuating
  'Actuating Devices_Motor': { nameZh:'电机', nameEn:'Motor', categoryZh:'执行类设备', categoryEn:'Actuating Devices' },
  'Actuating Devices_Relay': { nameZh:'继电器', nameEn:'Relay', categoryZh:'执行类设备', categoryEn:'Actuating Devices' },
  'Actuating Devices_Solenoid Valve': { nameZh:'电磁阀', nameEn:'Solenoid Valve', categoryZh:'执行类设备', categoryEn:'Actuating Devices' },

  // ---- Cloud
  'Cloud Serve_Cloud Database': { nameZh:'云数据库', nameEn:'Cloud Database', categoryZh:'云服务器', categoryEn:'Cloud Server' },
  'Cloud Server_Data Visualization Platform': { nameZh:'数据可视化平台', nameEn:'Data Visualization Platform', categoryZh:'云服务器', categoryEn:'Cloud Server' },
  'Cloud Server_Intelligent Analytics Module': { nameZh:'智能分析模块', nameEn:'Intelligent Analytics Module', categoryZh:'云服务器', categoryEn:'Cloud Server' },
  'Cloud Server_Remote Console': { nameZh:'远程控制台', nameEn:'Remote Console', categoryZh:'云服务器', categoryEn:'Cloud Server' },

  // ---- Communication
  'Communication Devices_Communication Protocol Module': { nameZh:'通信协议模块', nameEn:'Communication Protocol Module', categoryZh:'通信类设备', categoryEn:'Communication Devices' },
  'Communication Devices_Data Transmission Unit': { nameZh:'数据采集网关', nameEn:'Data Transmission Unit', categoryZh:'通信类设备', categoryEn:'Communication Devices' },
  'Communication Devices_Wireless Communication Module': { nameZh:'无线通信模块', nameEn:'Wireless Communication Module', categoryZh:'通信类设备', categoryEn:'Communication Devices' },

  // ---- Control
  'Control Devices_Chemical Dosing Controller': { nameZh:'配药控制器', nameEn:'Chemical Dosing Controller', categoryZh:'控制类设备', categoryEn:'Control Devices' },
  'Control Devices_Data Logger': { nameZh:'数据记录器', nameEn:'Data Logger', categoryZh:'控制类设备', categoryEn:'Control Devices' },
  'Control Devices_Differential Pressure Controller': { nameZh:'压差控制器', nameEn:'Differential Pressure Controller', categoryZh:'控制类设备', categoryEn:'Control Devices' },
  'Control Devices_PLC': { nameZh:'PLC 控制器', nameEn:'PLC', categoryZh:'控制类设备', categoryEn:'Control Devices' },

  // ---- Mechatronic
  'Mechatronic Devices_Backwash Pump': { nameZh:'反洗泵', nameEn:'Backwash Pump', categoryZh:'机电类设备', categoryEn:'Mechatronic Devices' },
  'Mechatronic Devices_Cartridge Filter': { nameZh:'滤芯过滤器', nameEn:'Cartridge Filter', categoryZh:'机电类设备', categoryEn:'Mechatronic Devices' },
  'Mechatronic Devices_Chemical Dosing Tank': { nameZh:'药剂罐', nameEn:'Chemical Dosing Tank', categoryZh:'机电类设备', categoryEn:'Mechatronic Devices' },
  'Mechatronic Devices_Dosing Pump': { nameZh:'计量泵', nameEn:'Dosing Pump', categoryZh:'机电类设备', categoryEn:'Mechatronic Devices' },
  'Mechatronic Devices_Mixer': { nameZh:'搅拌器', nameEn:'Mixer', categoryZh:'机电类设备', categoryEn:'Mechatronic Devices' },
  'Mechatronic Devices_Motorized Valve': { nameZh:'电动阀门', nameEn:'Motorized Valve', categoryZh:'机电类设备', categoryEn:'Mechatronic Devices' },
  'Mechatronic Devices_Pump': { nameZh:'泵', nameEn:'Pump', categoryZh:'机电类设备', categoryEn:'Mechatronic Devices' },
  'Mechatronic Devices_Reverse Osmosis Unit': { nameZh:'反渗透装置', nameEn:'Reverse Osmosis Unit', categoryZh:'机电类设备', categoryEn:'Mechatronic Devices' },
  'Mechatronic Devices_Static Mixer': { nameZh:'静态混合器', nameEn:'Static Mixer', categoryZh:'机电类设备', categoryEn:'Mechatronic Devices' },
  'Mechatronic Devices_Ultrafiltration Unit': { nameZh:'超滤单元', nameEn:'Ultrafiltration Unit', categoryZh:'机电类设备', categoryEn:'Mechatronic Devices' },
  'Mechatronic Devices_Ultraviolet Dechlorination': { nameZh:'脱氯装置', nameEn:'Ultraviolet Dechlorination', categoryZh:'机电类设备', categoryEn:'Mechatronic Devices' },
  'Mechatronic Devices_Water Pipeline': { nameZh:'水管道', nameEn:'Water Pipeline', categoryZh:'机电类设备', categoryEn:'Mechatronic Devices' },
  'Mechatronic Devices_Water Tank': { nameZh:'水箱', nameEn:'Water Tank', categoryZh:'机电类设备', categoryEn:'Mechatronic Devices' },

  // ---- Sensing（含“_ 后多空格”的兼容键）
  'Sensing Devices_Conductivity Analyzer': { nameZh:'电导率分析仪', nameEn:'Conductivity Analyzer', categoryZh:'感知类设备', categoryEn:'Sensing Devices' },
  'Sensing Devices_ Conductivity Analyzer': { nameZh:'电导率分析仪', nameEn:'Conductivity Analyzer', categoryZh:'感知类设备', categoryEn:'Sensing Devices' },
  'Sensing Devices_Differential Pressure Indicating Transmitter': { nameZh:'差压指示变送器', nameEn:'Differential Pressure Indicating Transmitter', categoryZh:'感知类设备', categoryEn:'Sensing Devices' },
  'Sensing Devices_Flow Transmitter': { nameZh:'流量变送器', nameEn:'Flow Transmitter', categoryZh:'感知类设备', categoryEn:'Sensing Devices' },
  'Sensing Devices_Hardness Meter of Water': { nameZh:'水硬度计', nameEn:'Hardness Meter of water', categoryZh:'感知类设备', categoryEn:'Sensing Devices' },
  'Sensing Devices_Level Transmitter': { nameZh:'液位变送器', nameEn:'Level Transmitter', categoryZh:'感知类设备', categoryEn:'Sensing Devices' },
  'Sensing Devices_ORP Analyzer': { nameZh:'氧化还原电位分析仪', nameEn:'ORP Analyzer', categoryZh:'感知类设备', categoryEn:'Sensing Devices' },
  'Sensing Devices_PH Analyzer': { nameZh:'pH分析仪', nameEn:'pH Analyzer', categoryZh:'感知类设备', categoryEn:'Sensing Devices' },
  'Sensing Devices_Pressure Meter': { nameZh:'液体压力计', nameEn:'Pressure Meter', categoryZh:'感知类设备', categoryEn:'Sensing Devices' },

  // ---- BPMN（可选）
  'EndEvent': { nameZh:'结束事件', nameEn:'End Event', categoryZh:'BPMN', categoryEn:'BPMN' },
  'ServiceTask': { nameZh:'服务任务', nameEn:'Service Task', categoryZh:'BPMN', categoryEn:'BPMN' },
  'UserTask': { nameZh:'用户任务', nameEn:'User Task', categoryZh:'BPMN', categoryEn:'BPMN' },
}

/** type → 文件名 的别名（若你的 model.type 用 bpmn:xxx） */
const TYPE_ALIAS: Record<string, string> = {
  'bpmn:pump': 'Mechatronic Devices_Pump',
  'bpmn:dosingPump': 'Mechatronic Devices_Dosing Pump',
  'bpmn:backwashPump': 'Mechatronic Devices_Backwash Pump',
  'bpmn:mixer': 'Mechatronic Devices_Mixer',
  'bpmn:staticMixer': 'Mechatronic Devices_Static Mixer',
  'bpmn:motorizedValve': 'Mechatronic Devices_Motorized Valve',
  'bpmn:roUnit': 'Mechatronic Devices_Reverse Osmosis Unit',
  'bpmn:ufUnit': 'Mechatronic Devices_Ultrafiltration Unit',
  'bpmn:uvDechlorination': 'Mechatronic Devices_Ultraviolet Dechlorination',
  'bpmn:waterTank': 'Mechatronic Devices_Water Tank',
  'bpmn:pipeline': 'Mechatronic Devices_Water Pipeline',

  'bpmn:plc': 'Control Devices_PLC',
  'bpmn:dosingController': 'Control Devices_Chemical Dosing Controller',
  'bpmn:dpController': 'Control Devices_Differential Pressure Controller',
  'bpmn:dataLogger': 'Control Devices_Data Logger',

  'bpmn:motor': 'Actuating Devices_Motor',
  'bpmn:relay': 'Actuating Devices_Relay',
  'bpmn:solenoidValve': 'Actuating Devices_Solenoid Valve',

  'bpmn:phAnalyzer': 'Sensing Devices_PH Analyzer',
  'bpmn:orpAnalyzer': 'Sensing Devices_ORP Analyzer',
  'bpmn:conductivityAnalyzer': 'Sensing Devices_Conductivity Analyzer',
  'bpmn:hardnessMeter': 'Sensing Devices_Hardness Meter of Water',
  'bpmn:flowTransmitter': 'Sensing Devices_Flow Transmitter',
  'bpmn:levelTransmitter': 'Sensing Devices_Level Transmitter',
  'bpmn:pressureMeter': 'Sensing Devices_Pressure Meter',
  'bpmn:dpit': 'Sensing Devices_Differential Pressure Indicating Transmitter',

  'bpmn:endEvent': 'EndEvent',
  'bpmn:serviceTask': 'ServiceTask',
  'bpmn:userTask': 'UserTask',
}

/** 规范化：去空格、转小写、去 -_. */
function norm(s: string) {
  return String(s || '').toLowerCase().replace(/\s+/g, '').replace(/[-_.]/g, '')
}
/** 是否包含中文 */
function hasChinese(s: string) {
  return /[\u4e00-\u9fa5]/.test(String(s || ''))
}
/** 规范化相等判断 */
function sameLoose(a: string, b: string) {
  const n = (x: string) => String(x || '').toLowerCase().replace(/\s+/g, '').replace(/[-_.]/g, '')
  return n(a) === n(b)
}

/** 设备名称别名(中/英/缩写/截断) → 文件键（统一对 key 做 norm） */
const NAME_ALIAS_TO_KEY: Record<string, string> = {
  // 通信
  [norm('Wireless Module')]: 'Communication Devices_Wireless Communication Module',
  '无线通信模块': 'Communication Devices_Wireless Communication Module',

  [norm('DTU')]: 'Communication Devices_Data Transmission Unit',
  '数据采集网关': 'Communication Devices_Data Transmission Unit',
  [norm('Data Transmission Unit')]: 'Communication Devices_Data Transmission Unit',

  [norm('Protocol Module')]: 'Communication Devices_Communication Protocol Module',
  '通信协议模块': 'Communication Devices_Communication Protocol Module',

  // 控制
  [norm('Chemical Dosing Controller')]: 'Control Devices_Chemical Dosing Controller',
  '配药控制器': 'Control Devices_Chemical Dosing Controller',

  [norm('Differential Pressure Controller')]: 'Control Devices_Differential Pressure Controller',
  '压差控制器': 'Control Devices_Differential Pressure Controller',

  [norm('Data Logger')]: 'Control Devices_Data Logger',
  '数据记录器': 'Control Devices_Data Logger',

  // 机电（含你点名的）
  [norm('Pump')]: 'Mechatronic Devices_Pump',
  '泵': 'Mechatronic Devices_Pump',

  [norm('Mixer')]: 'Mechatronic Devices_Mixer',
  '搅拌器': 'Mechatronic Devices_Mixer',

  [norm('Static Mixer')]: 'Mechatronic Devices_Static Mixer',
  '静态混合器': 'Mechatronic Devices_Static Mixer',

  [norm('Ultraviolet Dechlorination')]: 'Mechatronic Devices_Ultraviolet Dechlorination',
  '脱氯装置': 'Mechatronic Devices_Ultraviolet Dechlorination',

  [norm('Water Pipeline')]: 'Mechatronic Devices_Water Pipeline',
  '水管道': 'Mechatronic Devices_Water Pipeline',

  [norm('Water Tank')]: 'Mechatronic Devices_Water Tank',
  '水箱': 'Mechatronic Devices_Water Tank',

  [norm('Cartridge Filter')]: 'Mechatronic Devices_Cartridge Filter',
  '滤芯过滤器': 'Mechatronic Devices_Cartridge Filter',

  [norm('Chemical Dosing Tank')]: 'Mechatronic Devices_Chemical Dosing Tank',
  [norm('Chemical Tank')]: 'Mechatronic Devices_Chemical Dosing Tank',
  '药剂罐': 'Mechatronic Devices_Chemical Dosing Tank',

  // 感知（截断 Tran 也能中）
  [norm('Differential Pressure Indicating Transmitter')]: 'Sensing Devices_Differential Pressure Indicating Transmitter',
  [norm('Differential Pressure Transmitter')]: 'Sensing Devices_Differential Pressure Indicating Transmitter',
  [norm('Differential Pressure Tran')]: 'Sensing Devices_Differential Pressure Indicating Transmitter',
  '差压指示变送器': 'Sensing Devices_Differential Pressure Indicating Transmitter',

  [norm('Flow Transmitter')]: 'Sensing Devices_Flow Transmitter',
  '流量变送器': 'Sensing Devices_Flow Transmitter',

  // 云服务器类（你点名的）
  [norm('Cloud Database')]: 'Cloud Serve_Cloud Database',
  '云数据库': 'Cloud Serve_Cloud Database',

  [norm('Data Visualization Platform')]: 'Cloud Server_Data Visualization Platform',
  '数据可视化平台': 'Cloud Server_Data Visualization Platform',

  [norm('Intelligent Analytics Module')]: 'Cloud Server_Intelligent Analytics Module',
  '智能分析模块': 'Cloud Server_Intelligent Analytics Module',

  [norm('Remote Console')]: 'Cloud Server_Remote Console',
  '远程控制台': 'Cloud Server_Remote Console',
}

/** 从 properties 里尽可能拿到“设备名称”（中/英） */
function getDeviceNameFromProps(p: Record<string, any>) {
  if (!p) return { nameZh: '', nameEn: '' }

  const preferZh = ['设备名称', 'deviceNameZh', 'deviceZh', 'cnName', 'devNameZh']
  const preferEn = ['Device Name', 'deviceName', 'device_en', 'devName', 'nameEn', 'enName']

  let nameZh = preferZh.map(k => p[k]).find(v => typeof v === 'string' && v.trim()) || ''
  let nameEn = preferEn.map(k => p[k]).find(v => typeof v === 'string' && v.trim()) || ''

  // 兜底：全表扫描，看起来像名称的 key
  if (!nameZh || !nameEn) {
    for (const [k, v] of Object.entries(p)) {
      if (typeof v !== 'string') continue
      const val = v.trim(); if (!val) continue
      const keyNorm = norm(k)
      const looksLikeNameKey = /(device|dev|名称|name)/.test(keyNorm)
      if (!nameZh && /[\u4e00-\u9fa5]/.test(val) && looksLikeNameKey) nameZh = val
      if (!nameEn && !/[\u4e00-\u9fa5]/.test(val) && looksLikeNameKey) nameEn = val
    }
  }
  return { nameZh, nameEn }
}

/** 关键词兜底（最后关头才用，避免误分类） */
const KEYWORD_MAP: Array<{re:RegExp, key:string}> = [
  { re:/backwash/i, key:'Mechatronic Devices_Backwash Pump' },
  { re:/dosing/i, key:'Mechatronic Devices_Dosing Pump' },
  { re:/reverse.?osmosis|ro/i, key:'Mechatronic Devices_Reverse Osmosis Unit' },
  { re:/ultra.?filtration|uf/i, key:'Mechatronic Devices_Ultrafiltration Unit' },
  { re:/ultra.?violet|dechlor/i, key:'Mechatronic Devices_Ultraviolet Dechlorination' },
  { re:/cartridge.*filter/i, key:'Mechatronic Devices_Cartridge Filter' },
  { re:/water.*tank/i, key:'Mechatronic Devices_Water Tank' },
  { re:/water.*pipe|pipeline/i, key:'Mechatronic Devices_Water Pipeline' },
  { re:/static.*mixer/i, key:'Mechatronic Devices_Static Mixer' },
  { re:/mixer|agitator/i, key:'Mechatronic Devices_Mixer' },

  { re:/chemical.*dosing.*controller|配药控制/i, key:'Control Devices_Chemical Dosing Controller' },
  { re:/differential.*pressure.*controller|压差控制/i, key:'Control Devices_Differential Pressure Controller' },
  { re:/data.*logger|记录器/i, key:'Control Devices_Data Logger' },

  { re:/differential.*pressure.*indicat/i, key:'Sensing Devices_Differential Pressure Indicating Transmitter' },
  { re:/flow.*transmitter|流量变送/i, key:'Sensing Devices_Flow Transmitter' },

  { re:/cloud.*database|数据库/i, key:'Cloud Serve_Cloud Database' },
  { re:/data.*visualization|可视化平台/i, key:'Cloud Server_Data Visualization Platform' },
  { re:/intelligent.*analytics|智能分析/i, key:'Cloud Server_Intelligent Analytics Module' },
  { re:/remote.*console|远程控制/i, key:'Cloud Server_Remote Console' },
]

/** 计算映射 Key：
 * 设备名称(最高优先) → 明确 fileName → type 别名 → icon 文件名 → 关键词兜底
 */
function deriveKey(model: any, p: Record<string, any>) {
  // 0) 设备名称优先（以节点属性为准）
  const { nameZh, nameEn } = getDeviceNameFromProps(p)
  const enKey = NAME_ALIAS_TO_KEY[norm(nameEn)]
  if (enKey && DEVICE_MAP[enKey]) return enKey
  const zhKey = NAME_ALIAS_TO_KEY[norm(nameZh)]
  if (zhKey && DEVICE_MAP[zhKey]) return zhKey

  // 1) 明确 fileName/nodeKey
  const explicit = p.fileName || p.nodeKey || p.titleKey
  if (explicit && DEVICE_MAP[explicit]) return explicit as string

  // 2) type 别名
  if (model?.type && TYPE_ALIAS[model.type]) {
    const k = TYPE_ALIAS[model.type]; if (DEVICE_MAP[k]) return k
  }

  // 3) icon 文件名
  if (p.icon) {
    const fname = String(p.icon).split('/').pop() || ''
    let base = fname.replace(/\.(svg|png|jpe?g)$/i, '')
    if (DEVICE_MAP[base]) return base
    base = base.replace(/_\s+/, '_') // 兼容 “_ 后多空格”
    if (DEVICE_MAP[base]) return base
  }

  // 4) 最后才关键词兜底
  const hint = `${model?.constructor?.extendKey || ''} ${model?.type || ''} ${nameZh} ${nameEn} ${p.label || ''} ${p.name || ''}`
  for (const m of KEYWORD_MAP) if (m.re.test(hint)) return m.key
  return ''
}

/** 抬头信息（名称以“设备名称”为准；类别由映射推断，英文名自动校正） */
/** 抬头信息（名称以“设备名称”为准；类别由映射推断，英文名自动校正） */
const titleInfo = computed(() => {
  if (!props.selectedId) return { nameZh:'', nameEn:'', categoryZh:'', categoryEn:'' }
  const model = props.lf.getNodeModelById(props.selectedId)
  const p = model?.properties ?? {}

  // 先从“节点属性里的设备名称”拿中英文
  let { nameZh, nameEn } = getDeviceNameFromProps(p)
  if (!nameZh) nameZh = p.nameZh || base.name || ''
  if (!nameEn) nameEn = p.nameEn || p.enName || ''

  // 类别从映射推断；并且当英文名需要纠正时也一并取字典
  let categoryZh = p.categoryZh || ''
  let categoryEn = p.categoryEn || ''

  // ★ 关键：英文名为空 / 含中文 / 与中文规范化相等，都需要取映射做纠正
  const needDict =
    !categoryZh || !categoryEn || !nameEn || hasChinese(nameEn) || sameLoose(nameEn, nameZh)

  const key = needDict ? deriveKey(model, p) : ''
  const dict = key ? DEVICE_MAP[key] : undefined

  if (!categoryZh || !categoryEn) {
    if (dict) {
      categoryZh = categoryZh || dict.categoryZh
      categoryEn = categoryEn || dict.categoryEn
    }
  }

  // ★ 纠正英文名：用映射英文名覆盖异常情况
  if (dict && (!nameEn || hasChinese(nameEn) || sameLoose(nameEn, nameZh))) {
    nameEn = dict.nameEn
  }

  return { nameZh, nameEn, categoryZh, categoryEn }
})


/** 自动写回（不覆盖用户已填；画布文字始终隐藏；英文名自动校正） */
function autoFill(nodeId: string) {
  const model = props.lf.getNodeModelById(nodeId)
  if (!model) return
  const p = model.properties ?? {}

  const key = deriveKey(model, p)
  const dict = key ? DEVICE_MAP[key] : undefined

  const { nameZh: devZh, nameEn: devEn } = getDeviceNameFromProps(p)
  const patch: Record<string, any> = {}

  // 名称兜底（不覆盖“设备名称”）
  if (!p.nameZh && !devZh && dict) patch.nameZh = dict.nameZh

  // 英文名：缺失 / 含中文 / 和中文等价 → 用映射英文名
  const enNow = p.nameEn || p.enName || devEn || ''
  const zhNow = p.nameZh || devZh || ''
  if (dict && (!enNow || hasChinese(enNow) || sameLoose(enNow, zhNow))) {
    patch.nameEn = dict.nameEn
  }

  if (dict) {
    if (!p.categoryZh) patch.categoryZh = dict.categoryZh
    if (!p.categoryEn) patch.categoryEn = dict.categoryEn
  }

  if (Object.keys(patch).length) props.lf.setProperties(nodeId, patch)
  if (!SHOW_TEXT_ON_CANVAS) props.lf.updateText(nodeId, '')

  base.name = devZh || p.nameZh || patch.nameZh || ''
  map.nameEn = (patch.nameEn || enNow) || ''
}

/** 选中变化：回填 + 自动填充 + 隐藏画布文本 */
watch(() => props.selectedId, () => {
  resetAll()
  if (!props.selectedId) return
  const model = props.lf.getNodeModelById(props.selectedId)
  if (!model) return
  const p = model.properties || {}

  base.name = getDeviceNameFromProps(p).nameZh || p.nameZh || model.text?.value || ''
  base.desc = p.note || ''

  schema.value = (model?.constructor as any)?.formSchema || []
  for (const f of schema.value) {
    if (f.type === 'range' && f.minKey && f.maxKey) {
      rangeCache[f.minKey] = getByPath(p, f.minKey)
      rangeCache[f.maxKey] = getByPath(p, f.maxKey)
    } else {
      map[f.key] = p[f.key] ?? ''
    }
  }
  map.nameEn = getDeviceNameFromProps(p).nameEn || p.nameEn || p.enName || ''

  autoFill(props.selectedId!)
}, { immediate: true })

/** 新拖入节点：立即自动填充并隐藏文字 */
function onNodeAdd({ data }: any) { if (data?.id) autoFill(data.id) }
onMounted(() => { props.lf?.on?.('node:add', onNodeAdd) })
onBeforeUnmount(() => { props.lf?.off?.('node:add', onNodeAdd) })

/** 名称输入：仅更新 properties，不写画布文本 */
function onNameInput() {
  if (!props.selectedId) return
  props.lf.setProperties(props.selectedId, { nameZh: base.name || '' })
  if (!SHOW_TEXT_ON_CANVAS) props.lf.updateText(props.selectedId, '')
}

/** 提交辅助 */
function commit(patch: Record<string, any>) {
  if (!props.selectedId) return
  props.lf.setProperties(props.selectedId, patch)
}
function commitKey(key: string, toNumber = false) {
  if (!props.selectedId) return
  const val = map[key]
  props.lf.setProperties(props.selectedId, { [key]: toNumber ? numberOrNull(val) : val })
}
function commitRange(f: FieldSchema) {
  if (!props.selectedId || !f.minKey || !f.maxKey) return
  const min = numberOrNull(rangeCache[f.minKey])
  const max = numberOrNull(rangeCache[f.maxKey])
  const containerKey = f.minKey.split('.')[0]
  props.lf.setProperties(props.selectedId, { [containerKey]: { min, max } })
}

/** 工具 */
function resetAll() {
  base.name = ''; base.desc = ''
  schema.value = []
  for (const k in map) delete map[k]
  for (const k in rangeCache) delete rangeCache[k]
}
function numberOrNull(v: any) { const n = Number(v); return Number.isFinite(n) ? n : null }
function getByPath(obj: any, path?: string) {
  if (!path) return undefined
  return path.split('.').reduce((o, k) => o?.[k], obj)
}
</script>

<style scoped>
.prop-panel { background:#fff; padding:16px 16px 28px; overflow:auto; height:100%; }
.title-block { padding: 6px 0 10px; border-bottom: 1px solid #eee; margin-bottom: 12px; }
.title-row { display:flex; align-items:baseline; gap:8px; line-height:1.2; }
.title-row.zh { font-size:16px; font-weight:700; color:#222; }
.title-row.en { font-size:13px; color:#666; margin-top:6px; }
.title-name { white-space:nowrap; }
.title-dot { color:#aaa; }
.title-cat { white-space:nowrap; }

.section-title { font-weight:600; margin:8px 0 6px; }
.sep { border:none; border-top:1px solid #eee; margin:14px 0; }
.form-item { display:flex; flex-direction:column; gap:6px; margin-bottom:10px; }
.form-item--full { grid-column: 1 / -1; }
label { font-size:12px; color:#666; }
.ipt { width:100%; box-sizing:border-box; border:1px solid #dcdfe6; border-radius:6px; padding:8px 10px; outline:none; }
.grid { display:grid; grid-template-columns:1fr 1fr; gap:12px 12px; }
.range { display:flex; align-items:center; gap:8px; }
.range__sep { color:#999; }
.empty { color:#888; font-size:12px; margin-top:8px; }
</style>
