// src/models/bpmn/nodes/Communication Devices_Data Transmission Unit.ts
import { GraphModel, h, NodeConfig, RectNode, RectNodeModel } from '@logicflow/core'
import { getBpmnId } from '@logicflow/extension/es/bpmn/getBpmnId'
import dtuSvg from '@/assets/icons/Communication Devices_Data Transmission Unit.svg'
import { baseFields, commFields, type FieldSchema } from '@/models/bpmn/schemas/commonSchema'

export interface DtuProps {
  nameZh: string
  nameEn: string
  deviceName?: string
  deviceNameEn?: string

  productModel: string
  installDate: string
  note: string
  protocols: string
  interfaceType: string
  commMethod: string
  powerSupply: string
}

class DtuModel extends RectNodeModel {
  static extendKey = 'DtuModel'

  static formSchema: FieldSchema[] = [
    ...baseFields.filter(f => f.key !== 'note'),
    ...commFields.filter(f => f.key !== 'note'),
    { key: 'note', label: '备注', type: 'textarea', placeholder: '请输入备注信息' },
  ]

  declare properties: DtuProps

  constructor(data: NodeConfig, gm: GraphModel) {
    if (!data.id) data.id = `dtu-gateway_${getBpmnId()}`
    super(data, gm)
    this.width = this.width || 96
    this.height = this.height || 56
    if (this.text) this.text.editable = true
  }

  initNodeData(data: any) {
    super.initNodeData(data)

    const defaults: DtuProps = {
      nameZh: 'DTU网关',
      nameEn: 'DTU Gateway',
      deviceName: 'DTU网关',
      deviceNameEn: 'DTU Gateway',

      productModel: 'Sierra FX30',
      installDate: '2024-05-12',
      note: '协议桥接',
      protocols: 'Modbus 转 TCP/IP',
      interfaceType: 'RJ45/RS485',
      commMethod: '4G/5G',
      powerSupply: '12 VDC',
    }

    const merged = { ...defaults, ...(data.properties || {}) } as DtuProps

    if (!merged.nameZh && merged.deviceName) merged.nameZh = String(merged.deviceName)
    if (!merged.nameEn && merged.deviceNameEn) merged.nameEn = String(merged.deviceNameEn)

    merged.deviceName = merged.nameZh
    merged.deviceNameEn = merged.nameEn

    this.properties = merged
  }

  setProperties(p: Partial<DtuProps>) {
    const allowed: Partial<DtuProps> = {}

    if (p.nameZh !== undefined) allowed.nameZh = p.nameZh
    if (p.nameEn !== undefined) allowed.nameEn = p.nameEn

    if (p.productModel !== undefined) allowed.productModel = p.productModel
    if (p.installDate !== undefined) allowed.installDate = p.installDate
    if (p.note !== undefined) allowed.note = p.note
    if (p.protocols !== undefined) allowed.protocols = p.protocols
    if (p.interfaceType !== undefined) allowed.interfaceType = p.interfaceType
    if (p.commMethod !== undefined) allowed.commMethod = p.commMethod
    if (p.powerSupply !== undefined) allowed.powerSupply = p.powerSupply

    super.setProperties(allowed)

    const next = { ...this.properties, ...allowed } as DtuProps
    next.deviceName = next.nameZh
    next.deviceNameEn = next.nameEn
    this.properties = next
  }
}

class DtuView extends RectNode {
  static extendKey = 'DtuNode'

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
      }),
      h('image', {
        href: dtuSvg,
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

export default { type: 'bpmn:dtu-gateway', view: DtuView, model: DtuModel }
export { DtuModel, DtuView }
