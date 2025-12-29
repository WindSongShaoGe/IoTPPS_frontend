// src/models/bpmn/nodes/Actuating Devices_Motor.ts
import { GraphModel, h, NodeConfig, RectNode, RectNodeModel } from '@logicflow/core'
import { getBpmnId } from '@logicflow/extension/es/bpmn/getBpmnId'
import motorSvg from '@/assets/icons/Actuating Devices_Motor.svg'
import { baseFields, actuatingFields, type FieldSchema } from '@/models/bpmn/schemas/commonSchema'

export interface MotorProps {
  // ✅ 推荐新字段（面板用）
  nameZh: string
  nameEn: string

  // ✅ 兼容旧字段（如果你以前存过 deviceName）
  deviceName?: string
  deviceNameEn?: string

  productModel: string
  installDate: string
  note: string
  controlParam: string
  unit: string

  range: { min: number | null; max: number | null }
  rangeDisplay: string

  setpoint: number | null
  interfaceType: string
  powerSupply: string
}

class MotorModel extends RectNodeModel {
  static extendKey = 'MotorModel'

  static formSchema: FieldSchema[] = [
    ...baseFields,
    ...actuatingFields.filter(f => f.key !== 'range'),
    { key: 'rangeDisplay', label: '设定范围', type: 'text' },
    { key: 'note', label: '备注', type: 'textarea', placeholder: '请输入备注信息' },
  ]

  declare properties: MotorProps

  constructor(data: NodeConfig, graphModel: GraphModel) {
    if (!data.id) data.id = `motor_${getBpmnId()}`
    super(data, graphModel)
    this.width = this.width || 96
    this.height = this.height || 56
    if (this.text) this.text.editable = true
  }

  initNodeData(data: any) {
    super.initNodeData(data)
    const defaults: MotorProps = {
      nameZh: '电机',
      nameEn: 'Motor',
      deviceName: '电机',
      deviceNameEn: 'Motor',

      productModel: 'ABB M3BP112',
      installDate: '2024-05-12',
      note: '2.2 kW',
      controlParam: '转速',
      unit: 'rpm',

      range: { min: 0, max: 1500 },
      rangeDisplay: '0 ～ 1500',

      setpoint: 750,
      interfaceType: 'I/O',
      powerSupply: 'AC',
    }

    const merged = { ...defaults, ...(data.properties || {}) } as MotorProps

    // 兼容：旧字段兜底到新字段
    if (!merged.nameZh && merged.deviceName) merged.nameZh = String(merged.deviceName)
    if (!merged.nameEn && merged.deviceNameEn) merged.nameEn = String(merged.deviceNameEn)

    // rangeDisplay 兜底
    if (!merged.rangeDisplay) merged.rangeDisplay = '0 ～ 额定值'

    // 兼容字段保持同步（减少后续心智负担）
    merged.deviceName = merged.nameZh
    merged.deviceNameEn = merged.nameEn

    this.properties = merged
  }

  setProperties(p: Partial<MotorProps>) {
    const allowed: Partial<MotorProps> = {}

    // ✅ 允许面板写入名称
    if (p.nameZh !== undefined) allowed.nameZh = p.nameZh
    if (p.nameEn !== undefined) allowed.nameEn = p.nameEn

    if (p.productModel !== undefined) allowed.productModel = p.productModel
    if (p.installDate !== undefined) allowed.installDate = p.installDate
    if (p.note !== undefined) allowed.note = p.note
    if (p.setpoint !== undefined) allowed.setpoint = p.setpoint
    if (p.interfaceType !== undefined) allowed.interfaceType = p.interfaceType
    if (p.powerSupply !== undefined) allowed.powerSupply = p.powerSupply

    // rangeDisplay 只读：忽略外部修改（但允许写回同值防止面板抖）
    if (p.rangeDisplay !== undefined) {
      allowed.rangeDisplay = this.properties.rangeDisplay ?? '0 ～ 额定值'
    }

    super.setProperties(allowed)

    // 同步兼容字段
    const next = { ...this.properties, ...allowed }
    next.deviceName = next.nameZh
    next.deviceNameEn = next.nameEn
    this.properties = next
  }
}

class MotorView extends RectNode {
  static extendKey = 'MotorNode'
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
        href: motorSvg,
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

export default { type: 'bpmn:motor', view: MotorView, model: MotorModel }
export { MotorView, MotorModel }
