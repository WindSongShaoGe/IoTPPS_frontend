// Sensing Devices_Differential Pressure Indicating Transmitter.ts
import { GraphModel, h, NodeConfig, RectNode, RectNodeModel } from '@logicflow/core'
import { getBpmnId } from '@logicflow/extension/es/bpmn/getBpmnId'
import { baseFields, sensingFields, type FieldSchema } from '@/models/bpmn/schemas/commonSchema'

// ✅ 导入图标（请确保文件名无空格）
import dpSvg from '@/assets/icons/Sensing Devices_Differential Pressure Indicating Transmitter.svg'

// 属性接口
interface DifferentialPressureProps {
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
class DifferentialPressureModel extends RectNodeModel {
  static extendKey = 'DifferentialPressureModel'

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

  declare properties: DifferentialPressureProps

  constructor(data: NodeConfig, gm: GraphModel) {
    if (!data.id) data.id = `SENSOR_${getBpmnId()}`
    super(data, gm)
    this.width = 96
    this.height = 56
    if (this.text) this.text.editable = false
    this.properties = this.getInitialProperties(data.properties as Partial<DifferentialPressureProps> | undefined)
  }

  setProperties(properties: Partial<DifferentialPressureProps>): void {
    const allowed: Partial<DifferentialPressureProps> = {}

    if (properties.productModel !== undefined) allowed.productModel = properties.productModel
    if (properties.installDate !== undefined) allowed.installDate = properties.installDate
    if (properties.note !== undefined) allowed.note = properties.note
    if (properties.value !== undefined) allowed.value = properties.value
    if (properties.setpoint !== undefined) allowed.setpoint = properties.setpoint

    // 报警上下限：确保 low ≤ high
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

  private getInitialProperties(user?: Partial<DifferentialPressureProps>): DifferentialPressureProps {
    const defaults: DifferentialPressureProps = {
      deviceName: 'Differential Pressure Transmitter',
      productModel: 'Rosemount 3051',
      installDate: '2024-05-12',
      note: '',
      param: '差压',
      unit: 'kPa',
      range: { min: 0, max: 100, unit: 'kPa' },
      accuracy: '±0.25%FS',
      sampleFreq: 1.0,
      interfaceType: '4–20mA',
      commMethod: 'Modbus',
      powerSupply: '24 VDC',
      value: 18,
      alarmLow: 2,
      alarmHigh: 80,
      setpoint: 50
    }

    return {
      ...defaults,
      ...user,
      // 强制只读字段
      deviceName: defaults.deviceName,
      param: defaults.param,
      unit: defaults.unit,
      accuracy: defaults.accuracy,
      sampleFreq: defaults.sampleFreq,
      interfaceType: defaults.interfaceType,
      commMethod: defaults.commMethod,
      powerSupply: defaults.powerSupply,
      range: { ...defaults.range } // 整块只读
    }
  }
}

// 视图
class DifferentialPressureView extends RectNode {
  static extendKey = 'DifferentialPressureNode'

  getShape(): any {
    const { x, y, width, height, radius } = this.props.model
    const style = this.props.model.getNodeStyle()

    return h('g', {}, [
      // 命中区（承接全部交互）
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
      // 图像层（不吃事件）
      h('image', {
        href: dpSvg,
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
  type: 'bpmn:differentialPressureTransmitter',
  view: DifferentialPressureView,
  model: DifferentialPressureModel
}
export { DifferentialPressureModel, DifferentialPressureView }
