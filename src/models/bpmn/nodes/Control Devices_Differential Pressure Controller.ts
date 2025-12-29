// src/models/bpmn/nodes/Control Devices_Differential Pressure Controller.ts
import { GraphModel, h, NodeConfig, RectNode, RectNodeModel } from '@logicflow/core'
import { getBpmnId } from '@logicflow/extension/es/bpmn/getBpmnId'
import dpcSvg from '@/assets/icons/Control Devices_Differential Pressure Controller.svg'
import { baseFields, controlFields, type FieldSchema } from '@/models/bpmn/schemas/commonSchema'

export interface DPCProps {
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

class DPCModel extends RectNodeModel {
  static extendKey = 'DPCModel'

  static formSchema: FieldSchema[] = [
    ...baseFields.filter(f => f.key !== 'note'),
    ...controlFields.filter(f => f.key !== 'note'),
    { key: 'note', label: '备注', type: 'textarea', placeholder: '请输入备注信息' },
  ]

  declare properties: DPCProps

  constructor(data: NodeConfig, gm: GraphModel) {
    if (!data.id) data.id = `differential-pressure-controller_${getBpmnId()}`
    super(data, gm)
    this.width = this.width || 96
    this.height = this.height || 56
    if (this.text) this.text.editable = true
  }

  initNodeData(data: any) {
    super.initNodeData(data)

    const defaults: DPCProps = {
      nameZh: '压差控制器',
      nameEn: 'Differential Pressure Controller',
      deviceName: '压差控制器',
      deviceNameEn: 'Differential Pressure Controller',

      productModel: 'ABB DPC100',
      installDate: '2024-05-12',
      note: '',
      controlFunc: '压差阈值控制',
      responseTime: '5ms',
      interfaceType: '数字 I/O',
      commMethod: 'Modbus',
      powerSupply: '24 VDC',
    }

    const merged = { ...defaults, ...(data.properties || {}) } as DPCProps
    if (!merged.nameZh && merged.deviceName) merged.nameZh = String(merged.deviceName)
    if (!merged.nameEn && merged.deviceNameEn) merged.nameEn = String(merged.deviceNameEn)

    merged.deviceName = merged.nameZh
    merged.deviceNameEn = merged.nameEn
    this.properties = merged
  }

  setProperties(p: Partial<DPCProps>) {
    const allowed: Partial<DPCProps> = {}

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

    const next = { ...this.properties, ...allowed } as DPCProps
    next.deviceName = next.nameZh
    next.deviceNameEn = next.nameEn
    this.properties = next
  }
}

class DPCView extends RectNode {
  static extendKey = 'DPCNode'

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
        href: dpcSvg,
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

export default { type: 'bpmn:differential-pressure-controller', view: DPCView, model: DPCModel }
export { DPCModel, DPCView }
