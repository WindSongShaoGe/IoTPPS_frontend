// src/models/bpmn/nodes/Control Devices_Data Logger.ts
import { GraphModel, h, NodeConfig, RectNode, RectNodeModel } from '@logicflow/core'
import { getBpmnId } from '@logicflow/extension/es/bpmn/getBpmnId'
import dlSvg from '@/assets/icons/Control Devices_Data Logger.svg'
import { baseFields, controlFields, type FieldSchema } from '@/models/bpmn/schemas/commonSchema'

export interface DLProps {
  nameZh: string
  nameEn: string
  deviceName?: string
  deviceNameEn?: string

  productModel: string
  installDate: string
  note: string
  controlFunc: string
  responseTime: string
  interfaceType: string
  commMethod: string
  powerSupply: string
}

class DLModel extends RectNodeModel {
  static extendKey = 'DLModel'

  static formSchema: FieldSchema[] = [
    ...baseFields.filter(f => f.key !== 'note'),
    ...controlFields.filter(f => f.key !== 'note'),
    { key: 'note', label: '备注', type: 'textarea', placeholder: '请输入备注信息' },
  ]

  declare properties: DLProps

  constructor(data: NodeConfig, gm: GraphModel) {
    if (!data.id) data.id = `data-logger_${getBpmnId()}`
    super(data, gm)
    this.width = this.width || 96
    this.height = this.height || 56
    if (this.text) this.text.editable = true
  }

  initNodeData(data: any) {
    super.initNodeData(data)

    const defaults: DLProps = {
      nameZh: '数据记录仪',
      nameEn: 'Data Logger',
      deviceName: '数据记录仪',
      deviceNameEn: 'Data Logger',

      productModel: 'Yokogawa DX2000',
      installDate: '2024-05-12',
      note: '存储容量32G',
      controlFunc: '数据采集/存储',
      responseTime: '50ms',
      interfaceType: 'USB/485',
      commMethod: 'Modbus/TCP',
      powerSupply: '220 VAC',
    }

    const merged = { ...defaults, ...(data.properties || {}) } as DLProps
    if (!merged.nameZh && merged.deviceName) merged.nameZh = String(merged.deviceName)
    if (!merged.nameEn && merged.deviceNameEn) merged.nameEn = String(merged.deviceNameEn)

    merged.deviceName = merged.nameZh
    merged.deviceNameEn = merged.nameEn
    this.properties = merged
  }

  setProperties(p: Partial<DLProps>) {
    const allowed: Partial<DLProps> = {}

    if (p.nameZh !== undefined) allowed.nameZh = p.nameZh
    if (p.nameEn !== undefined) allowed.nameEn = p.nameEn

    if (p.productModel !== undefined) allowed.productModel = p.productModel
    if (p.installDate !== undefined) allowed.installDate = p.installDate
    if (p.note !== undefined) allowed.note = p.note
    if (p.controlFunc !== undefined) allowed.controlFunc = p.controlFunc
    if (p.responseTime !== undefined) allowed.responseTime = p.responseTime
    if (p.interfaceType !== undefined) allowed.interfaceType = p.interfaceType
    if (p.commMethod !== undefined) allowed.commMethod = p.commMethod
    if (p.powerSupply !== undefined) allowed.powerSupply = p.powerSupply

    super.setProperties(allowed)

    const next = { ...this.properties, ...allowed } as DLProps
    next.deviceName = next.nameZh
    next.deviceNameEn = next.nameEn
    this.properties = next
  }
}

class DLView extends RectNode {
  static extendKey = 'DLNode'

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
        href: dlSvg,
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

export default { type: 'bpmn:data-logger', view: DLView, model: DLModel }
export { DLModel, DLView }
