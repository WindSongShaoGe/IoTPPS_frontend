// src/models/bpmn/nodes/Sensing Devices_Conductivity Analyzer.ts
import { GraphModel, h, NodeConfig, RectNode, RectNodeModel } from '@logicflow/core'
import { getBpmnId } from '@logicflow/extension/es/bpmn/getBpmnId'
import conductivitySvg from '@/assets/icons/Sensing Devices_Conductivity Analyzer.svg'
import { baseFields, sensingFields, type FieldSchema } from '@/models/bpmn/schemas/commonSchema'

interface ConductivityProps {
  deviceName: string
  productModel: string
  installDate: string
  note: string
  param: string
  unit: string

  // ✅ 用拼接后的范围文本替代 range.min/max/unit
  rangeDisplay: string

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

class ConductivityModel extends RectNodeModel {
  static extendKey = 'ConductivityModel'

  static formSchema: FieldSchema[] = [
    ...baseFields,
    // ✅ 彻底过滤掉 range.* 三个字段
    ...sensingFields
      .filter(field => !field.key.startsWith('range'))
      .map(field => {
        const immutableFields = [
          'deviceName',
          'param',
          'unit',
          'accuracy',
          'sampleFreq',
          'interfaceType',
          'commMethod',
          'powerSupply'
        ]
        if (immutableFields.includes(field.key)) {
          return { ...field, disabled: true, readOnly: true }
        }
        return field
      }),
    // ✅ 只读显示范围
    { key: 'rangeDisplay', label: '测量范围', type: 'text', disabled: true, readOnly: true },
    { key: 'note', label: '备注', type: 'textarea', placeholder: '请输入备注信息' }
  ]

  declare properties: ConductivityProps

  constructor(data: NodeConfig, gm: GraphModel) {
    if (!data.id) data.id = `SENSOR_${getBpmnId()}`
    super(data, gm)
    this.width = 96
    this.height = 56
    if (this.text) this.text.editable = false
    this.properties = this.getInitialProperties(data.properties as Partial<ConductivityProps> | undefined)
  }

  setProperties(patch: Partial<ConductivityProps>): void {
    const allowed: Partial<ConductivityProps> = {}

    if (patch.productModel !== undefined) allowed.productModel = patch.productModel
    if (patch.installDate !== undefined) allowed.installDate = patch.installDate
    if (patch.note !== undefined) allowed.note = patch.note
    if (patch.value !== undefined) allowed.value = patch.value
    if (patch.setpoint !== undefined) allowed.setpoint = patch.setpoint

    // ✅ 报警上下限：允许编辑，并保证 low ≤ high
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

    // ✅ rangeDisplay 永远只读：忽略外部写入
    super.setProperties(allowed)
    this.properties = { ...this.properties, ...allowed }
  }

  private getInitialProperties(userProps?: Partial<ConductivityProps>): ConductivityProps {
    const defaultRangeDisplay = '0.01～400 mS/cm'
    const defaults: ConductivityProps = {
      deviceName: 'Conductivity Analyzer',
      productModel: 'HACH CDC401',
      installDate: '2024-05-12',
      note: '',
      param: '电导率',
      unit: 'μS/cm',
      rangeDisplay: defaultRangeDisplay,
      accuracy: '±0.5%FS',
      sampleFreq: 1.0,
      interfaceType: '模拟/数字',
      commMethod: 'RS485',
      powerSupply: '24 VDC',
      value: 125,
      alarmLow: 5,
      alarmHigh: 300,
      setpoint: 250
    }

    return { ...defaults, ...userProps, rangeDisplay: defaultRangeDisplay }
  }
}

class ConductivityView extends RectNode {
  static extendKey = 'ConductivityNode'

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
        'stroke-opacity': 0.0001
      }),
      h('image', {
        href: conductivitySvg,
        x: x - width / 2,
        y: y - height / 2,
        width,
        height,
        preserveAspectRatio: 'xMidYMid meet',
        'pointer-events': 'bounding-box'
      })
    ])
  }
}

export default {
  type: 'bpmn:conductivity-analyzer',
  view: ConductivityView,
  model: ConductivityModel
}
export { ConductivityModel, ConductivityView }
