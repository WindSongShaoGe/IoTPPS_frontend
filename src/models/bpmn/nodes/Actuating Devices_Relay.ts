import { GraphModel, h, NodeConfig, RectNode, RectNodeModel } from '@logicflow/core'
import { getBpmnId } from '@logicflow/extension/es/bpmn/getBpmnId'
import relaySvg from '@/assets/icons/Actuating Devices_Relay.svg'
import { baseFields, actuatingFields, type FieldSchema } from '@/models/bpmn/schemas/commonSchema'

export interface RelayProps {
  deviceName: string
  deviceNameEn: string
  productModel: string
  installDate: string
  note: string
  controlParam: string
  unit: string
  rangeDisplay: string
  setpoint: string
  interfaceType: string
  powerSupply: string
}

class RelayModel extends RectNodeModel {
  static extendKey = 'RelayModel'

  static formSchema: FieldSchema[] = [
    ...baseFields,
    // ✅ 去掉通用模板里的 setpoint
    ...actuatingFields.filter(f => f.key !== 'range' && f.key !== 'setpoint').map(f => {
      if (f.key === 'interfaceType' || f.key === 'powerSupply') return { ...f }
      return { ...f, disabled: true, readOnly: true }
    }),
    { key: 'rangeDisplay', label: '设定范围', type: 'text' }, // 只显示“无”或“开/关”
    // ✅ 自定义设定值框，选项改成中文
    { key: 'setpoint', label: '设定值（开/关）', type: 'select', options: ['开', '关'] },
    { key: 'note', label: '备注', type: 'textarea', placeholder: '请输入备注信息' },
  ]

  declare properties: RelayProps

  constructor(data: NodeConfig, graphModel: GraphModel) {
    if (!data.id) data.id = `Relay_${getBpmnId()}`
    super(data, graphModel)
    this.width = this.width || 96
    this.height = this.height || 56
    if (this.text) this.text.editable = true
  }

  initNodeData(data: any) {
    super.initNodeData(data)
    const defaults: RelayProps = {
      deviceName: 'Relay',
      deviceNameEn: 'Relay',
      productModel: 'Omron MY4N',
      installDate: '2024-05-12',
      note: '250V/5A',
      controlParam: '开关',
      unit: 'On/Off',
      rangeDisplay: '开/关',
      setpoint: '开', // 默认开
      interfaceType: 'I/O',
      powerSupply: 'AC/DC',
    }
    this.properties = { ...defaults, ...(data.properties || {}) }
  }

  setProperties(props: Partial<RelayProps>) {
    const allowed: Partial<RelayProps> = {}
    if (props.productModel !== undefined) allowed.productModel = props.productModel
    if (props.installDate !== undefined) allowed.installDate = props.installDate
    if (props.note !== undefined) allowed.note = props.note
    if (props.setpoint !== undefined) allowed.setpoint = props.setpoint
    if (props.interfaceType !== undefined) allowed.interfaceType = props.interfaceType
    if (props.powerSupply !== undefined) allowed.powerSupply = props.powerSupply
    // 保证 rangeDisplay 不被外部改掉
    allowed.rangeDisplay = this.properties.rangeDisplay

    super.setProperties(allowed)
    this.properties = { ...this.properties, ...allowed }
  }
}

class RelayView extends RectNode {
  static extendKey = 'RelayNode'

  getShape(): any {
    const { model } = this.props
    const { x, y, width, height, radius } = model
    const style = model.getNodeStyle()
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
      }),
      h('image', {
        href: relaySvg,
        x: x - width / 2,
        y: y - height / 2,
        width,
        height,
        preserveAspectRatio: 'xMidYMid meet',
        'pointer-events': 'bounding-box',
      }),
    ])
  }
}

export default { type: 'bpmn:relay', view: RelayView, model: RelayModel }
export { RelayView, RelayModel }
