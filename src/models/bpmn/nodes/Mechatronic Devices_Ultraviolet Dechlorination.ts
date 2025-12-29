// src/models/bpmn/nodes/MechatronicDevices_DechlorinationUnit.ts
import { GraphModel, h, NodeConfig, RectNode, RectNodeModel } from '@logicflow/core'
import { getBpmnId } from '@logicflow/extension/es/bpmn/getBpmnId'
import type { FieldSchema } from '@/models/bpmn/schemas/commonSchema'
import dechlorinationSvg from '@/assets/icons/Mechatronic Devices_Ultraviolet Dechlorination.svg'

export interface DechlorinationProps {
  nameZh: string
  nameEn: string
  deviceName?: string
  deviceNameEn?: string

  productModel: string
  installDate: string
  note: string
  controlParam: string
  unit: string
  range: string
  powerSupply: string
  setpoint: number | null
}

class DechlorinationModel extends RectNodeModel {
  static extendKey = 'DechlorinationModel'

  static formSchema: FieldSchema[] = [
    { key: 'productModel', label: '产品型号', type: 'text' },
    { key: 'installDate', label: '安装日期', type: 'date' },
    { key: 'controlParam', label: '参数', type: 'text' },
    { key: 'unit', label: '单位', type: 'text' },
    { key: 'range', label: '设定范围', type: 'text' },
    { key: 'powerSupply', label: '供电方式', type: 'text' },
    { key: 'setpoint', label: '设定值', type: 'number' },
    { key: 'note', label: '备注', type: 'textarea', placeholder: '请输入备注信息' } as any,
  ]

  declare properties: DechlorinationProps

  constructor(data: NodeConfig, graphModel: GraphModel) {
    if (!data.id) data.id = `dechlorination-unit_${getBpmnId()}`
    super(data, graphModel)
    this.width = this.width || 96
    this.height = this.height || 56
    if (this.text) this.text.editable = true
  }

  initNodeData(data: any) {
    super.initNodeData(data)
    const defaults: DechlorinationProps = {
      nameZh: '脱氯装置',
      nameEn: 'Dechlorination Unit',
      deviceName: '脱氯装置',
      deviceNameEn: 'Dechlorination Unit',

      productModel: 'Wedeco ME',
      installDate: '2024-05-12',
      note: '',
      controlParam: '紫外强度',
      unit: 'mW/cm²',
      range: '0～50',
      powerSupply: 'AC',
      setpoint: 40,
    }

    const merged = { ...defaults, ...(data.properties || {}) } as DechlorinationProps
    if (!merged.nameZh && merged.deviceName) merged.nameZh = String(merged.deviceName)
    if (!merged.nameEn && merged.deviceNameEn) merged.nameEn = String(merged.deviceNameEn)
    merged.deviceName = merged.nameZh
    merged.deviceNameEn = merged.nameEn
    this.properties = merged
  }

  setProperties(p: Partial<DechlorinationProps>) {
    const allowed: Partial<DechlorinationProps> = {}
    if (p.nameZh !== undefined) allowed.nameZh = p.nameZh
    if (p.nameEn !== undefined) allowed.nameEn = p.nameEn
    if (p.productModel !== undefined) allowed.productModel = p.productModel
    if (p.installDate !== undefined) allowed.installDate = p.installDate
    if (p.note !== undefined) allowed.note = p.note
    if (p.controlParam !== undefined) allowed.controlParam = p.controlParam
    if (p.unit !== undefined) allowed.unit = p.unit
    if (p.range !== undefined) allowed.range = p.range
    if (p.powerSupply !== undefined) allowed.powerSupply = p.powerSupply
    if (p.setpoint !== undefined) allowed.setpoint = p.setpoint

    super.setProperties(allowed)

    const next = { ...this.properties, ...allowed } as DechlorinationProps
    next.deviceName = next.nameZh
    next.deviceNameEn = next.nameEn
    this.properties = next
  }
}

class DechlorinationView extends RectNode {
  static extendKey = 'DechlorinationNode'
  getShape(): any {
    const { x, y, width, height, radius } = this.props.model
    const style = this.props.model.getNodeStyle()
    return h('g', {}, [
      h('rect', { x: x - width / 2, y: y - height / 2, rx: radius, ry: radius, width, height, fill: 'transparent', stroke: style.stroke, 'stroke-opacity': 0.0001 }),
      h('image', { href: dechlorinationSvg, x: x - width / 2, y: y - height / 2, width, height, preserveAspectRatio: 'xMidYMid meet', 'pointer-events': 'bounding-box' }),
    ])
  }
}

export default { type: 'bpmn:dechlorination-unit', view: DechlorinationView, model: DechlorinationModel }
export { DechlorinationView, DechlorinationModel }
