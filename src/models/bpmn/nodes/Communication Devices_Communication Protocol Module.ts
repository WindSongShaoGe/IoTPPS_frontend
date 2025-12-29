// src/models/bpmn/nodes/Communication Devices_Communication Protocol Module.ts
import { GraphModel, h, NodeConfig, RectNode, RectNodeModel } from '@logicflow/core'
import { getBpmnId } from '@logicflow/extension/es/bpmn/getBpmnId'
import protoSvg from '@/assets/icons/Communication Devices_Communication Protocol Module.svg'
import { baseFields, commFields, type FieldSchema } from '@/models/bpmn/schemas/commonSchema'

export interface ProtocolModuleProps {
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

class ProtocolModuleModel extends RectNodeModel {
  static extendKey = 'ProtocolModuleModel'

  static formSchema: FieldSchema[] = [
    ...baseFields.filter(f => f.key !== 'note'),
    ...commFields.filter(f => f.key !== 'note'),
    { key: 'note', label: '备注', type: 'textarea', placeholder: '请输入备注信息' },
  ]

  declare properties: ProtocolModuleProps

  constructor(data: NodeConfig, gm: GraphModel) {
    if (!data.id) data.id = `protocol-module_${getBpmnId()}`
    super(data, gm)
    this.width = this.width || 96
    this.height = this.height || 56
    if (this.text) this.text.editable = true
  }

  initNodeData(data: any) {
    super.initNodeData(data)

    const defaults: ProtocolModuleProps = {
      nameZh: '协议模块',
      nameEn: 'Protocol Module',
      deviceName: '协议模块',
      deviceNameEn: 'Protocol Module',

      productModel: 'Moxa MGate MB3180',
      installDate: '2024-05-12',
      note: '多协议转换',
      protocols: 'Modbus TCP/RTU, Profibus, EtherNet/IP',
      interfaceType: 'RJ45/RS485',
      commMethod: '有线',
      powerSupply: '24 VDC',
    }

    const merged = { ...defaults, ...(data.properties || {}) } as ProtocolModuleProps

    if (!merged.nameZh && merged.deviceName) merged.nameZh = String(merged.deviceName)
    if (!merged.nameEn && merged.deviceNameEn) merged.nameEn = String(merged.deviceNameEn)

    merged.deviceName = merged.nameZh
    merged.deviceNameEn = merged.nameEn

    this.properties = merged
  }

  setProperties(p: Partial<ProtocolModuleProps>) {
    const allowed: Partial<ProtocolModuleProps> = {}

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

    const next = { ...this.properties, ...allowed } as ProtocolModuleProps
    next.deviceName = next.nameZh
    next.deviceNameEn = next.nameEn
    this.properties = next
  }
}

class ProtocolModuleView extends RectNode {
  static extendKey = 'ProtocolModuleNode'

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
        href: protoSvg,
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

export default { type: 'bpmn:protocol-module', view: ProtocolModuleView, model: ProtocolModuleModel }
export { ProtocolModuleModel, ProtocolModuleView }
