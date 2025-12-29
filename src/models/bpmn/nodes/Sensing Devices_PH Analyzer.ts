// Sensing Devices_PH Analyzer.ts
import { GraphModel, h, NodeConfig, RectNode, RectNodeModel } from '@logicflow/core'
import { getBpmnId } from '@logicflow/extension/es/bpmn/getBpmnId'
import { baseFields, sensingFields, type FieldSchema } from '@/models/bpmn/schemas/commonSchema'
import phSvg from '@/assets/icons/Sensing Devices_pH Analyzer.svg'

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

  setProperties(patch: Partial<PHProps>): void {
    const allowed: Partial<PHProps> = {}

    if (patch.productModel !== undefined) allowed.productModel = patch.productModel
    if (patch.installDate !== undefined) allowed.installDate = patch.installDate
    if (patch.note !== undefined) allowed.note = patch.note
    if (patch.value !== undefined) allowed.value = patch.value
    if (patch.setpoint !== undefined) allowed.setpoint = patch.setpoint

    // range：允许编辑 min/max（pH 可能有负数，只校验 min ≤ max）
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

class PHView extends RectNode {
  static extendKey = 'PHNode'

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
  type: 'bpmn:ph-analyzer',
  view: PHView,
  model: PHModel
}
export { PHModel, PHView }
