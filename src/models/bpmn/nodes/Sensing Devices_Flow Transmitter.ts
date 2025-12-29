// Sensing Devices_Flow Transmitter.ts
import { GraphModel, h, NodeConfig, RectNode, RectNodeModel } from '@logicflow/core'
import { getBpmnId } from '@logicflow/extension/es/bpmn/getBpmnId'
import { baseFields, sensingFields, type FieldSchema } from '@/models/bpmn/schemas/commonSchema'
import flowSvg from '@/assets/icons/Sensing Devices_Flow Transmitter.svg'

interface FlowProps {
  deviceName: string
  productModel: string
  installDate: string
  note: string
  param: string
  unit: string
  rangeDisplay: string
  accuracy: string
  sampleFreq: number
  interfaceType: string
  commMethod: string
  powerSupply: string
  value: number | null
  alarmLow: number | null
  alarmHigh: number | string | null
  setpoint: number | null
}

class FlowModel extends RectNodeModel {
  static extendKey = 'FlowModel'

  static formSchema: FieldSchema[] = [
    ...baseFields,
    ...sensingFields
      .filter(field => !field.key.startsWith('range') && field.key !== 'alarmHigh')
      .map(field => {
        const immutable = [
          'deviceName',
          'param',
          'unit',
          'accuracy',
          'sampleFreq',
          'interfaceType',
          'commMethod',
          'powerSupply'
        ]
        if (immutable.includes(field.key)) {
          return { ...field, disabled: true, readOnly: true }
        }
        return field
      }),
    { key: 'alarmHigh', label: '报警上限', type: 'text', placeholder: '待定额定值' },
    { key: 'rangeDisplay', label: '测量范围', type: 'text', disabled: true, readOnly: true },
    { key: 'note', label: '备注', type: 'textarea', placeholder: '请输入备注信息' }
  ]

  declare properties: FlowProps

  constructor(data: NodeConfig, gm: GraphModel) {
    if (!data.id) data.id = `SENSOR_${getBpmnId()}`
    super(data, gm)
    this.width = 96
    this.height = 56
    if (this.text) this.text.editable = false
    this.properties = this.getInitialProperties(data.properties as Partial<FlowProps> | undefined)
  }

  setProperties(patch: Partial<FlowProps>): void {
    const allowed: Partial<FlowProps> = {}

    if (patch.productModel !== undefined) allowed.productModel = patch.productModel
    if (patch.installDate !== undefined) allowed.installDate = patch.installDate
    if (patch.note !== undefined) allowed.note = patch.note
    if (patch.value !== undefined) allowed.value = patch.value
    if (patch.setpoint !== undefined) allowed.setpoint = patch.setpoint

    if (patch.alarmLow !== undefined) allowed.alarmLow = patch.alarmLow
    if (patch.alarmHigh !== undefined) allowed.alarmHigh = patch.alarmHigh

    // ✅ rangeDisplay 永远只读：忽略外部写入
    super.setProperties(allowed)
    this.properties = { ...this.properties, ...allowed }
  }

  private getInitialProperties(user?: Partial<FlowProps>): FlowProps {
    const defaults: FlowProps = {
      deviceName: 'Flow Transmitter',
      productModel: 'Siemens MAG5100',
      installDate: '2024-05-12',
      note: '',
      param: '流量',
      unit: 'm³/h',
      rangeDisplay: '0 ～ 50',
      accuracy: '±0.5%FS',
      sampleFreq: 1.0,
      interfaceType: '4–20mA',
      commMethod: 'Modbus',
      powerSupply: '24 VDC',
      value: 12.6,
      alarmLow: 1,
      alarmHigh: 40,
      setpoint: 30
    }
    return { ...defaults, ...user, rangeDisplay: defaults.rangeDisplay }
  }
}

class FlowView extends RectNode {
  static extendKey = 'FlowNode'

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
        href: flowSvg,
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
  type: 'bpmn:flow-transmitter',
  view: FlowView,
  model: FlowModel
}
export { FlowModel, FlowView }
