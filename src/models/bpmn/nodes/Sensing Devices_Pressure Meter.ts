// Sensing Devices_Pressure Meter.ts
import { GraphModel, h, NodeConfig, RectNode, RectNodeModel } from '@logicflow/core'
import { getBpmnId } from '@logicflow/extension/es/bpmn/getBpmnId'
import { baseFields, sensingFields, type FieldSchema } from '@/models/bpmn/schemas/commonSchema'
import pressureSvg from '@/assets/icons/Sensing Devices_Pressure Meter.svg'

interface PressureProps {
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

class PressureModel extends RectNodeModel {
  static extendKey = 'PressureModel'

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
        'range.min',
        'range.max',
        'range.unit'
      ]
      if (immutable.includes(field.key)) {
        return { ...field, disabled: true, readOnly: true }
      }
      return field
    }),
    { key: 'note', label: '备注', type: 'textarea', placeholder: '请输入备注信息' }
  ]

  declare properties: PressureProps

  constructor(data: NodeConfig, gm: GraphModel) {
    if (!data.id) data.id = `SENSOR_${getBpmnId()}`
    super(data, gm)
    this.width = 96
    this.height = 56
    if (this.text) this.text.editable = false
    this.properties = this.getInitialProperties(data.properties as Partial<PressureProps> | undefined)
  }

  setProperties(patch: Partial<PressureProps>): void {
    const allowed: Partial<PressureProps> = {}

    if (patch.productModel !== undefined) allowed.productModel = patch.productModel
    if (patch.installDate !== undefined) allowed.installDate = patch.installDate
    if (patch.note !== undefined) allowed.note = patch.note
    if (patch.value !== undefined) allowed.value = patch.value
    if (patch.setpoint !== undefined) allowed.setpoint = patch.setpoint

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

  private getInitialProperties(user?: Partial<PressureProps>): PressureProps {
    const defaults: PressureProps = {
      deviceName: 'Pressure Meter',
      productModel: 'WIKA PGT23',
      installDate: '2024-05-12',
      note: '',
      param: '压力',
      unit: 'kPa',
      range: { min: 0, max: 100, unit: 'kPa' },
      accuracy: '±0.25%FS',
      sampleFreq: 1.0,
      interfaceType: '4–20mA',
      commMethod: 'Modbus',
      powerSupply: '24 VDC',
      value: 35,
      alarmLow: 20,
      alarmHigh: 80,
      setpoint: 50
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
      range: { ...defaults.range }
    }
  }
}

class PressureView extends RectNode {
  static extendKey = 'PressureNode'

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
        href: pressureSvg,
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
  type: 'bpmn:pressure-meter',
  view: PressureView,
  model: PressureModel
}
export { PressureModel, PressureView }
