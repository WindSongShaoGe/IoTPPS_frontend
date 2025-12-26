export type FieldType =
  | 'text'
  | 'number'
  | 'textarea'
  | 'date'
  | 'select'
  | 'range';

export interface FieldSchema {
  key: string;              // 属性键
  label: string;            // 中文标签
  type: FieldType;          // 控件类型
  placeholder?: string;
  options?: string[];       // select/radio
  minKey?: string;          // range 最小值路径
  maxKey?: string;          // range 最大值路径
  step?: number;
}

/** 基础通用字段 */
export const baseFields: FieldSchema[] = [
  { key: 'productModel', label: '产品型号', type: 'text' },
  { key: 'installDate', label: '安装日期', type: 'date' },
]

/** 感知类设备专用字段 */
export const sensingFields: FieldSchema[] = [
  { key: 'param', label: '测量参数', type: 'text' },
  { key: 'unit', label: '测量单位', type: 'text' },
  { key: 'range', label: '测量范围', type: 'range', minKey: 'range.min', maxKey: 'range.max', step: 0.01 },
  { key: 'accuracy', label: '精度', type: 'text' },
  { key: 'sampleFreq', label: '采样频率 (Hz)', type: 'number', step: 0.01 },
  { key: 'interfaceType', label: '接口类型', type: 'text' },
  { key: 'commMethod', label: '通讯方式', type: 'text' },
  { key: 'powerSupply', label: '供电方式', type: 'text' },
  { key: 'value', label: '测量值', type: 'number', step: 0.01 },
  { key: 'alarmLow', label: '报警下限', type: 'number', step: 0.01 },
  { key: 'alarmHigh', label: '报警上限', type: 'number', step: 0.01 },
  { key: 'setpoint', label: '设定点', type: 'number', step: 0.01 },
]

/** 控制类设备专用字段 */
export const controlFields: FieldSchema[] = [
  { key: 'controlFunc', label: '控制功能', type: 'text' },
  { key: 'responseTime', label: '响应时间', type: 'text' },
  { key: 'interfaceType', label: '接口类型', type: 'text' },
  { key: 'commMethod', label: '通讯方式', type: 'text' },
  { key: 'powerSupply', label: '供电方式', type: 'text' },
]

/** 执行类/机电类字段 */
export const actuatingFields: FieldSchema[] = [
  { key: 'controlParam', label: '控制参数', type: 'text' },
  { key: 'unit', label: '单位', type: 'text' },
  { key: 'range', label: '设定范围', type: 'range', minKey: 'range.min', maxKey: 'range.max', step: 0.01 },
  { key: 'setpoint', label: '设定值', type: 'number', step: 0.01 },
  { key: 'interfaceType', label: '接口类型', type: 'text' },
  { key: 'powerSupply', label: '供电方式', type: 'text' },
]

/** 通信类字段 */
export const commFields: FieldSchema[] = [
  { key: 'protocols', label: '支持协议', type: 'text' },
  { key: 'interfaceType', label: '接口类型', type: 'text' },
  { key: 'commMethod', label: '通讯方式', type: 'text' },
  { key: 'powerSupply', label: '供电方式', type: 'text' },
]

/** 云服务类字段 */
export const cloudFields: FieldSchema[] = [
  { key: 'type', label: '类型/版本', type: 'text' },
  { key: 'function', label: '功能', type: 'text' },
  { key: 'interfaceType', label: '接口类型', type: 'text' },
  { key: 'commMethod', label: '通讯方式', type: 'text' },
  { key: 'installDate', label: '安装/部署日期', type: 'date' },
]
