// src/models/bpmn/nodes/Actuating Devices_Relay.ts
import { GraphModel, h, NodeConfig, RectNode, RectNodeModel } from '@logicflow/core'
import { getBpmnId } from '@logicflow/extension/es/bpmn/getBpmnId'
import relaySvg from '@/assets/icons/Actuating Devices_Relay.svg'
import { baseFields, actuatingFields, type FieldSchema } from '@/models/bpmn/schemas/commonSchema'

export interface RelayProps {
  nameZh: string
  nameEn: string
  deviceName?: string
  deviceNameEn?: string

  productModel: string
  installDate: string
  note: string
  controlParam: string
  unit: string
  rangeDisplay: string
  setpoint: '开' | '关'
  interfaceType: string
  powerSupply: string
}

class RelayModel extends RectNodeModel {
  static extendKey = 'RelayModel'

  static formSchema: FieldSchema[] = [
    ...baseFields,
    ...actuatingFields.filter(f => f.key !== 'range' && f.key !== 'setpoint'),
    { key: 'rangeDisplay', label: '设定范围', type: 'text' },
    { key: 'setpoint', label: '设定值（开/关）', type: 'select', options: ['开', '关'] },
    { key: 'note', label: '备注', type: 'textarea', placeholder: '请输入备注信息' },
  ]

  declare properties: RelayProps

  constructor(data: NodeConfig, graphModel: GraphModel) {
    if (!data.id) data.id = `relay_${getBpmnId()}`
    super(data, graphModel)
    this.width = this.width || 96
    this.height = this.height || 56
    if (this.text) this.text.editable = true
  }

  initNodeData(data: any) {
    super.initNodeData(data)
    const defaults: RelayProps = {
      nameZh: '继电器',
      nameEn: 'Relay',
      deviceName: '继电器',
      deviceNameEn: 'Relay',

      productModel: 'Omron MY4N',
      installDate: '2024-05-12',
      note: '250V/5A',
      controlParam: '开关',
      unit: 'On/Off',
      rangeDisplay: '开/关',
      setpoint: '开',
      interfaceType: 'I/O',
      powerSupply: 'AC/DC',
    }

    const merged = { ...defaults, ...(data.properties || {}) } as RelayProps
    if (!merged.nameZh && merged.deviceName) merged.nameZh = String(merged.deviceName)
    if (!merged.nameEn && merged.deviceNameEn) merged.nameEn = String(merged.deviceNameEn)

    merged.rangeDisplay = '开/关'
    merged.deviceName = merged.nameZh
    merged.deviceNameEn = merged.nameEn
    this.properties = merged
  }

  setProperties(p: Partial<RelayProps>) {
    const allowed: Partial<RelayProps> = {}

    if (p.nameZh !== undefined) allowed.nameZh = p.nameZh
    if (p.nameEn !== undefined) allowed.nameEn = p.nameEn

    if (p.productModel !== undefined) allowed.productModel = p.productModel
    if (p.installDate !== undefined) allowed.installDate = p.installDate
    if (p.note !== undefined) allowed.note = p.note
    if (p.setpoint !== undefined) allowed.setpoint = p.setpoint
    if (p.interfaceType !== undefined) allowed.interfaceType = p.interfaceType
    if (p.powerSupply !== undefined) allowed.powerSupply = p.powerSupply

    // 固定展示字段
    allowed.rangeDisplay = '开/关'

    super.setProperties(allowed)

    const next = { ...this.properties, ...allowed } as RelayProps
    next.deviceName = next.nameZh
    next.deviceNameEn = next.nameEn
    this.properties = next
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
