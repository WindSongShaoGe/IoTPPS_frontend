// sample-display.ts
// 给每种节点一个“展示示例”占位文案（后端接入后会替换）
// ★ key 要与“节点的 type”一致（不是文件名）。不确定时可 console.log(model.type)
export const sampleDisplayByType: Record<string, string> = {
  // —— 感知类（传感器）——
  'bpmn:conductivity-analyzer': '125.00 μS/cm',
  'bpmn:ph-analyzer': '7.05',
  'bpmn:orp-analyzer': '220.00 mV',
  'bpmn:hardness-meter': '160.00 mg/L CaCO₃',
  'bpmn:flow-transmitter': '12.60 m³/h',
  'bpmn:level-transmitter': '3.80 m',
  'bpmn:pressure-meter': '350.00 kPa',
  'bpmn:differential-pressure-transmitter': '180.00 kPa',

  // —— 机电/工艺类 ——
  'bpmn:pump': '流量：3.5 m³/h',
  'bpmn:backwash-pump': '流量：7.5 m³/h',
  'bpmn:dosing-pump': '加药速率：2 L/h',
  'bpmn:motorized-valve': '蝶阀，开度：30%',
  'bpmn:mixer': '转速：280 rpm',
  'bpmn:uf-unit': '产水量：1.4 m³/h，跨膜压差：180 kPa',
  'bpmn:reverse-osmosis-unit': '脱盐率：97.8%',
  'bpmn:dechlorination-unit': '紫外强度：38 mW/cm²',
  'bpmn:cartridge-filter': '滤芯精度：5 μm',
  'bpmn:water-tank': '容积：2 m³，液位：1.8 m',
  'bpmn:chemical-tank': '容积：500 L',
  'bpmn:static-mixer': '直径：40 mm',
  'bpmn:water-pipeline': '状态：正常',

  // —— 执行类（驱动、开关）——
  'bpmn:motor': '转速：740 rpm，电流：1.8 A',
  'bpmn:relay': '状态：闭合',
  'bpmn:solenoid-valve': '开度：65%',

  // —— 控制类 ——
  'bpmn:plc': '状态：正常',
  'bpmn:chemical-dosing-controller': '加药速率：1.2 L/h，状态：正常',
  'bpmn:differential-pressure-controller': '阈值控制启用，实时ΔP：150 kPa，状态：正常',
  'bpmn:data-logger': '已采集：12 GB，状态：正常',

  // —— 通信类 ——
  'bpmn:protocol-module': '数据包时延：<10 ms，通信状态：正常',
  'bpmn:wireless-module': '信号强度：-78 dBm，状态：正常',
  'bpmn:dtu-gateway': '4G 连接，数据转发：1.2 k msg/min，状态：正常',

  // —— 云端 ——
  'bpmn:cloud-database': '已存储数据：120 GB，运行状态：正常',
  'bpmn:data-visualization-platform': '连接状态：正常',
  'bpmn:intelligent-analytics-module': '运行状态：正常',
  'bpmn:remote-console': '状态：在线',
}
