// src/models/bpmn/nodes/MechatronicDevices_MotorizedValve.ts
import { GraphModel, h, NodeConfig, RectNode, RectNodeModel } from '@logicflow/core'
import { getBpmnId } from '@logicflow/extension/es/bpmn/getBpmnId'
import type { FieldSchema } from '@/models/bpmn/schemas/commonSchema'
import valveSvg from '@/assets/icons/Mechatronic Devices_Motorized Valve.svg'

export interface MotorizedValveProps {
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

class MotorizedValveModel extends RectNodeModel {
  static extendKey = 'MotorizedValveModel'

  static formSchema: FieldSchema[] = [
    { key: 'productModel', label: '产品型号', type: 'text' },
    { key: 'installDate', label: '安装日期', type: 'date' },
    { key: 'controlParam', label: '控制参数', type: 'text' },
    { key: 'unit', label: '单位', type: 'text' },
    { key: 'range', label: '设定范围', type: 'text' },
    { key: 'powerSupply', label: '供电方式', type: 'text' },
    { key: 'setpoint', label: '设定值（%）', type: 'number', step: 1, placeholder: '请输入 0-100 的数值' } as any,
    { key: 'note', label: '备注', type: 'textarea', placeholder: '请输入备注信息' } as any,
  ]

  declare properties: MotorizedValveProps

  constructor(data: NodeConfig, graphModel: GraphModel) {
    if (!data.id) data.id = `motorized-valve_${getBpmnId()}`
    super(data, graphModel)
    this.width = this.width || 96
    this.height = this.height || 56
    if (this.text) this.text.editable = true
  }

  initNodeData(data: any) {
    super.initNodeData(data)
    const defaults: MotorizedValveProps = {
      nameZh: '电动阀门',
      nameEn: 'Motorized Valve',
      deviceName: '电动阀门',
      deviceNameEn: 'Motorized Valve',

      productModel: 'Belimo PRX',
      installDate: '2024-05-12',
      note: '蝶阀',
      controlParam: '阀门开度',
      unit: '%',
      range: '0～100',
      powerSupply: 'AC/DC',
      setpoint: 30,
    }

    const merged = { ...defaults, ...(data.properties || {}) } as MotorizedValveProps
    if (!merged.nameZh && merged.deviceName) merged.nameZh = String(merged.deviceName)
    if (!merged.nameEn && merged.deviceNameEn) merged.nameEn = String(merged.deviceNameEn)
    merged.deviceName = merged.nameZh
    merged.deviceNameEn = merged.nameEn
    this.properties = merged
  }

  setProperties(patch: Partial<MotorizedValveProps>) {
    const allowed: Partial<MotorizedValveProps> = {}

    if (patch.nameZh !== undefined) allowed.nameZh = patch.nameZh
    if (patch.nameEn !== undefined) allowed.nameEn = patch.nameEn

    if (patch.productModel !== undefined) allowed.productModel = patch.productModel
    if (patch.installDate !== undefined) allowed.installDate = patch.installDate
    if (patch.note !== undefined) allowed.note = patch.note
    if (patch.controlParam !== undefined) allowed.controlParam = patch.controlParam
    if (patch.unit !== undefined) allowed.unit = patch.unit
    if (patch.range !== undefined) allowed.range = patch.range
    if (patch.powerSupply !== undefined) allowed.powerSupply = patch.powerSupply

    if (patch.setpoint !== undefined) {
      if (patch.setpoint === null) {
        allowed.setpoint = null
      } else {
        let n = Number(patch.setpoint)
        if (!Number.isFinite(n)) n = (this.properties?.setpoint ?? 0) as number
        n = Math.max(0, Math.min(100, n))
        allowed.setpoint = n
      }
    }

    super.setProperties(allowed)

    const next = { ...this.properties, ...allowed } as MotorizedValveProps
    next.deviceName = next.nameZh
    next.deviceNameEn = next.nameEn
    this.properties = next
  }
}

class MotorizedValveView extends RectNode {
  static extendKey = 'MotorizedValveNode'

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
        href: valveSvg,
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

export default { type: 'bpmn:motorized-valve', view: MotorizedValveView, model: MotorizedValveModel }
export { MotorizedValveView, MotorizedValveModel }
