// src/components/palette/palette-data.ts
import type { PaletteGroup, PaletteItem } from './palette-types'

// 统一从 icons.ts 引入所有图标
import {
  backwashPumpIcon,
  cartridgeFilterIcon,
  chemicalDosingControllerIcon,
  chemicalDosingTankIcon as chemicalTankIcon,
  cloudDatabaseIcon,
  communicationProtocolIcon,
  conductivityAnalyzerIcon,
  dataLoggerIcon,
  dataTransmissionUnitIcon,
  dataVisualizationPlatformIcon,
  differentialPressureControllerIcon,
  dosingPumpIcon,
  DPIT_Icon,
  endIcon,
  flowTransmitterIcon,
  hardnessMeterOfWaterIcon,
  intelligentAnalyticsModuleIcon,
  levelTransmitterIcon,
  mixerIcon,
  motorIcon,
  motorizedValveIcon,
  ORP_AnalyzerIcon,
  pH_AnalyzerIcon,
  PLC_Icon as plcIcon,
  pressureMeterIcon,
  pumpIcon,
  relayIcon,
  remoteConsoleIcon,
  RO_UnitIcon,
  serviceTaskIcon,
  solenoidValveIcon,
  startIcon,
  staticMixerIcon,
  UF_UnitIcon,
  userTaskIcon,
  UV_DechlorinationIcon,
  waterPipelineIcon,
  waterTankIcon,
  wirelessCommunicationModuleIcon,
} from '@/models/bpmn/icons'

// 工厂函数：生成 PaletteItem，顺便把 icon 塞进 properties
function item(
  type: string,
  zh: string,
  en: string,
  icon?: string,
  subGroup?: string, // 新增：子类别
): PaletteItem {
  return {
    type,
    label: zh, // 左侧显示中文
    icon,      // 左侧卡片图标
    subGroup,  // 机电类内部再分 A/B/C
    properties: {
      deviceName: zh,
      deviceNameEn: en,
      icon,
    },
  }
}

export const groups: PaletteGroup[] = [
  {
    key: 'mechatronic',
    name: '机电类设备',
    items: [
      // ==== A 组（示例）====
      item('bpmn:motorizedValve', '电动阀门', 'Motorized Valve', motorizedValveIcon, 'A'),
      item('bpmn:pump', '泵', 'Pump', pumpIcon, 'A'),
      item('bpmn:backwash-pump', '反冲洗泵', 'Backwash Pump', backwashPumpIcon, 'A'),
      item('bpmn:dosing-pump', '计量泵', 'Dosing Pump', dosingPumpIcon, 'A'),

      // ==== B 组（示例）====
      item('bpmn:static-mixer', '静态混合器', 'Static Mixer', staticMixerIcon, 'B'),
      item('bpmn:uf-unit', '超滤单元（UF）', 'Ultrafiltration Unit (UF)', UF_UnitIcon, 'B'),
      item('bpmn:dechlorination-unit', '脱氯装置（紫外）', 'Ultraviolet (UV) Dechlorination', UV_DechlorinationIcon, 'B'),
      item('bpmn:reverse-osmosis-unit', '反渗透装置（RO）', 'Reverse Osmosis (RO) Unit', RO_UnitIcon, 'B'),

      // ==== C 组（示例）====
      item('bpmn:cartridge-filter', '滤芯过滤器', 'Cartridge Filter', cartridgeFilterIcon, 'C'),
      item('bpmn:mixer', '搅拌器/混合器', 'Agitator / Mixer', mixerIcon, 'C'),
      item('bpmn:water-tank', '水箱', 'Water Tank', waterTankIcon, 'C'),
      item('bpmn:water-pipeline', '水管道', 'Water Pipeline', waterPipelineIcon, 'C'),
      item('bpmn:chemical-tank', '药剂罐', 'Chemical Dosing Tank', chemicalTankIcon, 'C'),
    ],
  },
  {
    key: 'actuating',
    name: '驱动类设备',
    items: [
      item('bpmn:motor', '电机', 'Motor', motorIcon),
      item('bpmn:relay', '继电器', 'Relay', relayIcon),
      item('bpmn:solenoidValve', '电磁阀', 'Solenoid Valve', solenoidValveIcon),
    ],
  },
  {
    key: 'control',
    name: '控制类设备',
    items: [
      item('bpmn:plc', 'PLC', 'PLC', plcIcon),
      item('bpmn:chemicalDosingController', '配药控制器', 'Chemical Dosing Controller', chemicalDosingControllerIcon),
      item('bpmn:differentialPressureController', '压差控制器（UF/RO）', 'Differential Pressure Controller', differentialPressureControllerIcon),
      item('bpmn:dataLogger', '数据记录器', 'Data Logger', dataLoggerIcon),
    ],
  },
  {
    key: 'sensing',
    name: '感知类设备',
    items: [
      item('bpmn:conductivityAnalyzer', '电导率分析仪', 'Conductivity Analyzer', conductivityAnalyzerIcon),
      item('bpmn:orpAnalyzer', '氧化还原电位分析仪', 'ORP Analyzer', ORP_AnalyzerIcon),
      item('bpmn:hardnessMeter', '水硬度计', 'Hardness Meter of Water', hardnessMeterOfWaterIcon),
      item('bpmn:phAnalyzer', 'pH 分析仪', 'pH Analyzer', pH_AnalyzerIcon),
      item('bpmn:flowTransmitter', '流量变送器', 'Flow Transmitter', flowTransmitterIcon),
      item('bpmn:levelTransmitter', '液位变送器', 'Level Transmitter', levelTransmitterIcon),
      item('bpmn:pressureMeter', '液体压力计', 'Pressure Meter', pressureMeterIcon),
      item('bpmn:differentialPressureTransmitter', '差压指示变送器', 'Differential Pressure Indicating Transmitter', DPIT_Icon),
    ],
  },
  {
    key: 'communication',
    name: '通信类设备',
    items: [
      item('bpmn:protocolModule', '通信协议模块', 'Communication Protocol Module', communicationProtocolIcon),
      item('bpmn:wirelessModule', '无线通信模块', 'Wireless Communication Module', wirelessCommunicationModuleIcon),
      item('bpmn:dtuGateway', '数据采集网关（DTU）', 'Data Transmission Unit (DTU)', dataTransmissionUnitIcon),
    ],
  },
  {
    key: 'cloud',
    name: '云服务与平台',
    items: [
      item('bpmn:cloud-database', '云数据库', 'Cloud Database', cloudDatabaseIcon),
      item('bpmn:data-visualization-platform', '数据可视化平台', 'Data Visualization Platform', dataVisualizationPlatformIcon),
      item('bpmn:intelligent-analytics-module', '智能分析模块', 'Intelligent Analytics Module', intelligentAnalyticsModuleIcon),
      item('bpmn:remote-console', '远程控制台', 'Remote Console', remoteConsoleIcon),
    ],
  },
  {
    key: 'bpmn-basic',
    name: 'BPMN 基础组件',
    items: [
      item('bpmn:startEvent', '开始事件', 'Start Event', startIcon),
      item('bpmn:endEvent', '结束事件', 'End Event', endIcon),
      item('bpmn:userTask', '用户任务', 'User Task', userTaskIcon),
      item('bpmn:serviceTask', '服务任务', 'Service Task', serviceTaskIcon),
    ],
  },
  {
    key: 'custom',
    name: '自定义组件',
    items: [
      {
        type: 'custom:add',
        label: '添加组件',
        icon: 'plus',
        properties: {},
      },
    ],
  },
]
