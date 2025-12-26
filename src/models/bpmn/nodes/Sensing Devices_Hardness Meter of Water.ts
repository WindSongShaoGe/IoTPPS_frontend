// Sensing Devices_Hardness Meter of Water.ts
import { GraphModel, h, NodeConfig, RectNode, RectNodeModel } from '@logicflow/core'
import { getBpmnId } from '@logicflow/extension/es/bpmn/getBpmnId'
import { baseFields, sensingFields, type FieldSchema } from '@/models/bpmn/schemas/commonSchema'

// ✅ 图标请放到 assets/icons，文件名无空格
import hardnessSvg from '@/assets/icons/Sensing Devices_Hardness Meter of Water.svg'

// 属性接口
interface HardnessProps {
  deviceName: string
  productModel: string
  installDate: string
  note: string
  param: string
  unit: string
  range: { min: number; max: number; unit: string }
  accuracy: string
  sampleFreq: number
  interfaceType: string
  commMethod: string
  powerSupply: string
  value: number | null
  alarmLow: number | null
  alarmHigh: number | null
  setpoint: number | null
}

// 模型
class HardnessModel extends RectNodeModel {
  static extendKey = 'HardnessModel'

  static formSchema: FieldSchema[] = [
    ...baseFields,
    ...sensingFields.map(field => {
      const immutable = [
        'deviceName',
        'param',
        'unit',
        'accuracy',
        'sampleFreq',
        'interfaceType',
        'commMethod',
        'powerSupply',
        'range.unit'
      ]
      if (immutable.includes(field.key)) {
        return { ...field, disabled: true, readOnly: true }
      }
      return field
    }),
      { key: 'note', label: '备注', type: 'textarea', placeholder: '请输入备注信息' }

  ]

  declare properties: HardnessProps

  constructor(data: NodeConfig, gm: GraphModel) {
    if (!data.id) data.id = `SENSOR_${getBpmnId()}`
    super(data, gm)
    this.width = 96
    this.height = 56
    if (this.text) this.text.editable = false
    this.properties = this.getInitialProperties(data.properties as Partial<HardnessProps> | undefined)
  }

  setProperties(properties: Partial<HardnessProps>): void {
    const allowed: Partial<HardnessProps> = {}

    if (properties.productModel !== undefined) allowed.productModel = properties.productModel
    if (properties.installDate !== undefined) allowed.installDate = properties.installDate
    if (properties.note !== undefined) allowed.note = properties.note
    if (properties.value !== undefined) allowed.value = properties.value
    if (properties.setpoint !== undefined) allowed.setpoint = properties.setpoint

    // 范围：min ≥ 0 且 min ≤ max
    if (properties.range) {
      let newMin = properties.range.min ?? this.properties.range.min
      let newMax = properties.range.max ?? this.properties.range.max
      if (newMin < 0) newMin = 0
      if (newMin <= newMax) {
        allowed.range = { ...this.properties.range, min: newMin, max: newMax, unit: this.properties.range.unit }
      }
    }

    // 报警上下限
    let alarmLow = properties.alarmLow ?? this.properties.alarmLow
    let alarmHigh = properties.alarmHigh ?? this.properties.alarmHigh
    if (alarmLow !== null && alarmHigh !== null && alarmLow > alarmHigh) {
      alarmLow = this.properties.alarmLow
      alarmHigh = this.properties.alarmHigh
    }
    allowed.alarmLow = alarmLow
    allowed.alarmHigh = alarmHigh

    super.setProperties(allowed)
    this.properties = { ...this.properties, ...allowed }
  }

  private getInitialProperties(user?: Partial<HardnessProps>): HardnessProps {
    const defaults: HardnessProps = {
      deviceName: 'Hardness Meter',
      productModel: 'HACH 2100H',
      installDate: '2024-05-12',
      note: '',
      param: '硬度',
      unit: 'mg/L as CaCO₃',
      range: { min: 0.02, max: 40000, unit: 'mg/L as CaCO₃' },
      accuracy: '±1% FS',
      sampleFreq: 1.0,
      interfaceType: '模拟/数字',
      commMethod: 'USB/485',
      powerSupply: '220 VAC',
      value: 160,
      alarmLow: 50,
      alarmHigh: 300,
      setpoint: 200
    }

    return {
      ...defaults,
      ...user,
      // 只读字段强制覆盖
      deviceName: defaults.deviceName,
      param: defaults.param,
      unit: defaults.unit,
      accuracy: defaults.accuracy,
      sampleFreq: defaults.sampleFreq,
      interfaceType: defaults.interfaceType,
      commMethod: defaults.commMethod,
      powerSupply: defaults.powerSupply,
      range: { ...defaults.range, ...user?.range, unit: defaults.range.unit }
    }
  }
}

// 视图
class HardnessView extends RectNode {
  static extendKey = 'HardnessNode'

  getShape(): any {
    const { x, y, width, height, radius } = this.props.model
    const style = this.props.model.getNodeStyle()

    return h('g', {}, [
      // 命中区承接交互
      h('rect', {
        x: x - width / 2,
        y: y - height / 2,
        rx: radius,
        ry: radius,
        width,
        height,
        fill: 'transparent',
        stroke: style.stroke,
        'stroke-opacity': 0.0001,
        'pointer-events': 'all'
      }),
      // 图标层不吃事件
      h('image', {
        href: hardnessSvg,
        x: x - width / 2,
        y: y - height / 2,
        width,
        height,
        preserveAspectRatio: 'xMidYMid meet',
        'pointer-events': 'none'
      })
    ])
  }
}

export default {
  type: 'bpmn:hardnessMeter',
  view: HardnessView,
  model: HardnessModel
}
export { HardnessModel, HardnessView }
