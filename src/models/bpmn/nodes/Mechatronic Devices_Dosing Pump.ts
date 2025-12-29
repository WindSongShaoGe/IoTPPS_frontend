// src/models/bpmn/nodes/MechatronicDevices_DosingPump.ts
import { GraphModel, h, NodeConfig, RectNode, RectNodeModel } from '@logicflow/core'
import { getBpmnId } from '@logicflow/extension/es/bpmn/getBpmnId'
import type { FieldSchema } from '@/models/bpmn/schemas/commonSchema'
import dosingPumpSvg from '@/assets/icons/Mechatronic Devices_Dosing Pump.svg'

export interface DosingPumpProps {
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

class DosingPumpModel extends RectNodeModel {
  static extendKey = 'DosingPumpModel'

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

  declare properties: DosingPumpProps

  constructor(data: NodeConfig, graphModel: GraphModel) {
    if (!data.id) data.id = `dosing-pump_${getBpmnId()}`
    super(data, graphModel)
    this.width = this.width || 96
    this.height = this.height || 56
    if (this.text) this.text.editable = true
  }

  initNodeData(data: any) {
    super.initNodeData(data)
    const defaults: DosingPumpProps = {
      nameZh: '计量泵',
      nameEn: 'Dosing Pump',
      deviceName: '计量泵',
      deviceNameEn: 'Dosing Pump',

      productModel: 'Prominent GammaX',
      installDate: '2024-05-12',
      note: '',
      controlParam: '加药量',
      unit: 'L/h',
      range: '0～5',
      powerSupply: 'AC',
      setpoint: 2,
    }

    const merged = { ...defaults, ...(data.properties || {}) } as DosingPumpProps
    if (!merged.nameZh && merged.deviceName) merged.nameZh = String(merged.deviceName)
    if (!merged.nameEn && merged.deviceNameEn) merged.nameEn = String(merged.deviceNameEn)
    merged.deviceName = merged.nameZh
    merged.deviceNameEn = merged.nameEn
    this.properties = merged
  }

  setProperties(p: Partial<DosingPumpProps>) {
    const allowed: Partial<DosingPumpProps> = {}
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
    const next = { ...this.properties, ...allowed } as DosingPumpProps
    next.deviceName = next.nameZh
    next.deviceNameEn = next.nameEn
    this.properties = next
  }
}

class DosingPumpView extends RectNode {
  static extendKey = 'DosingPumpNode'

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
        href: dosingPumpSvg,
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

export default { type: 'bpmn:dosing-pump', view: DosingPumpView, model: DosingPumpModel }
export { DosingPumpView, DosingPumpModel }
