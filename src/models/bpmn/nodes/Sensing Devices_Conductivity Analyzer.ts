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
  /** ✅ 新增：拼接好的测量范围文本，而不是 min/max 两个输入框 */
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
    // ✅ 过滤掉原来的 range 字段
    ...sensingFields
      .filter(field => field.key !== 'range')
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
    // ✅ 用一个只读文本框显示拼接后的范围
    { key: 'rangeDisplay', label: '测量范围', type: 'text', placeholder: '0.01～400 mS/cm' },
    // ✅ 新增：更大的备注框
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

  setProperties(properties: Partial<ConductivityProps>): void {
    const allowedUpdates: Partial<ConductivityProps> = {}

    if (properties.productModel !== undefined) allowedUpdates.productModel = properties.productModel
    if (properties.installDate !== undefined) allowedUpdates.installDate = properties.installDate
    if (properties.note !== undefined) allowedUpdates.note = properties.note
    if (properties.value !== undefined) allowedUpdates.value = properties.value
    if (properties.setpoint !== undefined) allowedUpdates.setpoint = properties.setpoint

    // ✅ 不允许外部修改 rangeDisplay
    if (properties.rangeDisplay) {
      allowedUpdates.rangeDisplay = this.properties.rangeDisplay
    }

    super.setProperties(allowedUpdates)
    this.properties = { ...this.properties, ...allowedUpdates }
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
  type: 'bpmn:conductivityAnalyzer',
  view: ConductivityView,
  model: ConductivityModel
}
export { ConductivityModel, ConductivityView }
