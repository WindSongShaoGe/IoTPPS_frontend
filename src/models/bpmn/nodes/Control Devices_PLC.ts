// src/models/bpmn/nodes/Control Devices_PLC.ts
import { GraphModel, h, NodeConfig, RectNode, RectNodeModel } from '@logicflow/core'
import { getBpmnId } from '@logicflow/extension/es/bpmn/getBpmnId'
import plcSvg from '@/assets/icons/Control Devices_PLC.svg'
import { baseFields, controlFields, type FieldSchema } from '@/models/bpmn/schemas/commonSchema'

export interface PlcProps {
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

class PlcModel extends RectNodeModel {
  static extendKey = 'PlcModel'

  static formSchema: FieldSchema[] = [
    ...baseFields.filter(f => f.key !== 'note'),
    ...controlFields.filter(f => f.key !== 'note'),
    { key: 'note', label: '备注', type: 'textarea', placeholder: '请输入备注信息' },
  ]

  declare properties: PlcProps

  constructor(data: NodeConfig, gm: GraphModel) {
    if (!data.id) data.id = `plc_${getBpmnId()}`
    super(data, gm)
    this.width = this.width || 96
    this.height = this.height || 56
    if (this.text) this.text.editable = true
  }

  initNodeData(data: any) {
    super.initNodeData(data)

    const defaults: PlcProps = {
      nameZh: 'PLC',
      nameEn: 'PLC',
      deviceName: 'PLC',
      deviceNameEn: 'PLC',

      productModel: 'Siemens S7-1200',
      installDate: '2024-05-12',
      note: '',
      controlFunc: '程序控制',
      responseTime: '2ms',
      interfaceType: '数字 I/O',
      commMethod: 'Modbus/TCP',
      powerSupply: '220 VAC',
    }

    const merged = { ...defaults, ...(data.properties || {}) } as PlcProps
    if (!merged.nameZh && merged.deviceName) merged.nameZh = String(merged.deviceName)
    if (!merged.nameEn && merged.deviceNameEn) merged.nameEn = String(merged.deviceNameEn)

    merged.deviceName = merged.nameZh
    merged.deviceNameEn = merged.nameEn
    this.properties = merged
  }

  setProperties(p: Partial<PlcProps>) {
    const allowed: Partial<PlcProps> = {}

    if (p.nameZh !== undefined) allowed.nameZh = p.nameZh
    if (p.nameEn !== undefined) allowed.nameEn = p.nameEn

    // PLC 这类通常“少改核心，多写备注”，我就只放开常改项
    if (p.productModel !== undefined) allowed.productModel = p.productModel
    if (p.installDate !== undefined) allowed.installDate = p.installDate
    if (p.note !== undefined) allowed.note = p.note
    if (p.interfaceType !== undefined) allowed.interfaceType = p.interfaceType
    if (p.commMethod !== undefined) allowed.commMethod = p.commMethod
    if (p.powerSupply !== undefined) allowed.powerSupply = p.powerSupply

    super.setProperties(allowed)

    const next = { ...this.properties, ...allowed } as PlcProps
    next.deviceName = next.nameZh
    next.deviceNameEn = next.nameEn
    this.properties = next
  }
}

class PlcView extends RectNode {
  static extendKey = 'PlcNode'

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
        href: plcSvg,
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

export default { type: 'bpmn:plc', view: PlcView, model: PlcModel }
export { PlcModel, PlcView }
