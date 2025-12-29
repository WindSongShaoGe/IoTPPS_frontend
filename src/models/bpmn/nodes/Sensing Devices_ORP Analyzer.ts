// Sensing Devices_ORP Analyzer.ts
import { GraphModel, h, NodeConfig, RectNode, RectNodeModel } from '@logicflow/core'
import { getBpmnId } from '@logicflow/extension/es/bpmn/getBpmnId'
import { baseFields, sensingFields, type FieldSchema } from '@/models/bpmn/schemas/commonSchema'
import orpSvg from '@/assets/icons/Sensing Devices_ORP Analyzer.svg'

interface ORPProps {
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

class ORPModel extends RectNodeModel {
  static extendKey = 'ORPModel'

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

  declare properties: ORPProps

  constructor(data: NodeConfig, gm: GraphModel) {
    if (!data.id) data.id = `SENSOR_${getBpmnId()}`
    super(data, gm)
    this.width = 96
    this.height = 56
    if (this.text) this.text.editable = false
    this.properties = this.getInitialProperties(data.properties as Partial<ORPProps> | undefined)
  }

  setProperties(patch: Partial<ORPProps>): void {
    const allowed: Partial<ORPProps> = {}

    if (patch.productModel !== undefined) allowed.productModel = patch.productModel
    if (patch.installDate !== undefined) allowed.installDate = patch.installDate
    if (patch.note !== undefined) allowed.note = patch.note
    if (patch.value !== undefined) allowed.value = patch.value
    if (patch.setpoint !== undefined) allowed.setpoint = patch.setpoint

    // range：允许编辑 min/max（ORP 允许负数，只校验 min ≤ max）
    if (patch.range) {
      const newMin = patch.range.min ?? this.properties.range.min
      const newMax = patch.range.max ?? this.properties.range.max
      if (newMin <= newMax) {
        allowed.range = { ...this.properties.range, min: newMin, max: newMax, unit: this.properties.range.unit }
      }
    }

    // 报警上下限：low ≤ high
    const hasLow = patch.alarmLow !== undefined
    const hasHigh = patch.alarmHigh !== undefined
    if (hasLow || hasHigh) {
      const nextLow = hasLow ? patch.alarmLow : this.properties.alarmLow
      const nextHigh = hasHigh ? patch.alarmHigh : this.properties.alarmHigh
      if (!(nextLow !== null && nextHigh !== null && nextLow > nextHigh)) {
        if (hasLow) allowed.alarmLow = patch.alarmLow!
        if (hasHigh) allowed.alarmHigh = patch.alarmHigh!
      }
    }

    super.setProperties(allowed)
    this.properties = { ...this.properties, ...allowed }
  }

  private getInitialProperties(user?: Partial<ORPProps>): ORPProps {
    const defaults: ORPProps = {
      deviceName: 'ORP Analyzer',
      productModel: 'Endress CPS12D',
      installDate: '2024-05-12',
      note: '',
      param: '氧化还原电位',
      unit: 'mV',
      range: { min: -1999, max: 1999, unit: 'mV' },
      accuracy: '±1 mV',
      sampleFreq: 1.0,
      interfaceType: '模拟/数字',
      commMethod: 'RS485',
      powerSupply: '24 VDC',
      value: 220,
      alarmLow: -50,
      alarmHigh: 500,
      setpoint: 250
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

class ORPView extends RectNode {
  static extendKey = 'ORPNode'

  getShape(): any {
    const { x, y, width, height, radius } = this.props.model
    const style = this.props.model.getNodeStyle()

    return h('g', {}, [
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
      h('image', {
        href: orpSvg,
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
  type: 'bpmn:orp-analyzer',
  view: ORPView,
  model: ORPModel
}
export { ORPModel, ORPView }
