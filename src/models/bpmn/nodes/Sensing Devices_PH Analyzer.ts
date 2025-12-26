// Sensing Devices_PH Analyzer.ts
import { GraphModel, h, NodeConfig, RectNode, RectNodeModel } from '@logicflow/core'
import { getBpmnId } from '@logicflow/extension/es/bpmn/getBpmnId'
import { baseFields, sensingFields, type FieldSchema } from '@/models/bpmn/schemas/commonSchema'

// ✅ 导入图标
import phSvg from '@/assets/icons/Sensing Devices_pH Analyzer.svg'

// 属性接口
interface PHProps {
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
class PHModel extends RectNodeModel {
  static extendKey = 'PHModel'

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

  

  declare properties: PHProps

  constructor(data: NodeConfig, gm: GraphModel) {
    if (!data.id) data.id = `SENSOR_${getBpmnId()}`
    super(data, gm)
    this.width = 96
    this.height = 56
    if (this.text) this.text.editable = false
    this.properties = this.getInitialProperties(data.properties as Partial<PHProps> | undefined)
  }

  setProperties(properties: Partial<PHProps>): void {
    const allowed: Partial<PHProps> = {}

    if (properties.productModel !== undefined) allowed.productModel = properties.productModel
    if (properties.installDate !== undefined) allowed.installDate = properties.installDate
    if (properties.note !== undefined) allowed.note = properties.note
    if (properties.value !== undefined) allowed.value = properties.value
    if (properties.setpoint !== undefined) allowed.setpoint = properties.setpoint

    if (properties.range) {
      const newMin = properties.range.min ?? this.properties.range.min
      const newMax = properties.range.max ?? this.properties.range.max
      if (newMin <= newMax) {
        allowed.range = { ...this.properties.range, min: newMin, max: newMax, unit: this.properties.range.unit }
      }
    }

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

  private getInitialProperties(user?: Partial<PHProps>): PHProps {
    const defaults: PHProps = {
      deviceName: 'pH Analyzer',
      productModel: 'Yokogawa PH202',
      installDate: '2024-05-12',
      note: '',
      param: 'pH',
      unit: 'pH值',
      range: { min: -2.0, max: 20.0, unit: '无' },
      accuracy: '±0.01',
      sampleFreq: 1.0,
      interfaceType: '模拟/数字',
      commMethod: 'RS485',
      powerSupply: 'AC/DC',
      value: 7.05,
      alarmLow: 6.5,
      alarmHigh: 8.5,
      setpoint: 7.2
    }

    return {
      ...defaults,
      ...user,
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
class PHView extends RectNode {
  static extendKey = 'PHNode'

  getShape(): any {
    const { x, y, width, height, radius } = this.props.model
    const style = this.props.model.getNodeStyle()

    return h('g', {}, [
      // 透明交互区
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
      // 图标层
      h('image', {
        href: phSvg,
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
  type: 'bpmn:phAnalyzer',
  view: PHView,
  model: PHModel
}
export { PHModel, PHView }
