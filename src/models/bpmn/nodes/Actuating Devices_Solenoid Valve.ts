// src/models/bpmn/nodes/Actuating Devices_Solenoid Valve.ts
import { GraphModel, h, NodeConfig, RectNode, RectNodeModel } from '@logicflow/core'
import { getBpmnId } from '@logicflow/extension/es/bpmn/getBpmnId'
import valveSvg from '@/assets/icons/Actuating Devices_Solenoid Valve.svg'
import { baseFields, actuatingFields, type FieldSchema } from '@/models/bpmn/schemas/commonSchema'

export interface SolenoidValveProps {
  nameZh: string
  nameEn: string
  deviceName?: string
  deviceNameEn?: string

  productModel: string
  installDate: string
  note: string
  controlParam: string
  unit: string

  range: { min: number | null; max: number | null }
  setpoint: number | null

  interfaceType: string
  powerSupply: string
}

function numOrNull(v: any): number | null {
  const n = Number(v)
  return Number.isFinite(n) ? n : null
}
function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n))
}

class SolenoidValveModel extends RectNodeModel {
  static extendKey = 'SolenoidValveModel'

  static formSchema: FieldSchema[] = [
    ...baseFields,
    ...actuatingFields.filter(f => f.key !== 'setpoint'),
    { key: 'setpoint', label: '设定值 (%)', type: 'number', step: 1 },
    { key: 'note', label: '备注', type: 'textarea', placeholder: '请输入备注信息' },
  ]

  declare properties: SolenoidValveProps

  constructor(data: NodeConfig, graphModel: GraphModel) {
    if (!data.id) data.id = `solenoid-valve_${getBpmnId()}`
    super(data, graphModel)
    this.width = this.width || 96
    this.height = this.height || 56
    if (this.text) this.text.editable = true
  }

  initNodeData(data: any) {
    super.initNodeData(data)
    const defaults: SolenoidValveProps = {
      nameZh: '电磁阀',
      nameEn: 'Solenoid Valve',
      deviceName: '电磁阀',
      deviceNameEn: 'Solenoid Valve',

      productModel: 'ASCO 210',
      installDate: '2024-05-12',
      note: '常闭型,24V线圈',
      controlParam: '阀门开度',
      unit: '%',

      range: { min: 0, max: 100 },
      setpoint: 65,

      interfaceType: 'I/O',
      powerSupply: 'AC/DC',
    }

    const merged = { ...defaults, ...(data.properties || {}) } as SolenoidValveProps
    if (!merged.nameZh && merged.deviceName) merged.nameZh = String(merged.deviceName)
    if (!merged.nameEn && merged.deviceNameEn) merged.nameEn = String(merged.deviceNameEn)

    // range 安全兜底
    merged.range ||= { min: 0, max: 100 }
    merged.range.min = numOrNull(merged.range.min) ?? 0
    merged.range.max = numOrNull(merged.range.max) ?? 100

    // setpoint 兜底并夹紧
    if (merged.setpoint != null) {
      const n = numOrNull(merged.setpoint)
      merged.setpoint = n == null ? null : clamp(n, merged.range.min ?? 0, merged.range.max ?? 100)
    }

    merged.deviceName = merged.nameZh
    merged.deviceNameEn = merged.nameEn
    this.properties = merged
  }

  setProperties(p: Partial<SolenoidValveProps>) {
    const cur = (this.properties || {}) as SolenoidValveProps
    const allowed: Partial<SolenoidValveProps> = {}

    if (p.nameZh !== undefined) allowed.nameZh = p.nameZh
    if (p.nameEn !== undefined) allowed.nameEn = p.nameEn

    if (p.productModel !== undefined) allowed.productModel = p.productModel
    if (p.installDate !== undefined) allowed.installDate = p.installDate
    if (p.note !== undefined) allowed.note = p.note
    if (p.interfaceType !== undefined) allowed.interfaceType = p.interfaceType
    if (p.powerSupply !== undefined) allowed.powerSupply = p.powerSupply

    // range（来自 commitRange）
    let nextRange = cur.range || { min: 0, max: 100 }
    if (p.range !== undefined) {
      const min = numOrNull((p.range as any)?.min)
      const max = numOrNull((p.range as any)?.max)
      nextRange = { min, max }
      allowed.range = nextRange
    }

    // setpoint：按 nextRange 夹紧
    if (p.setpoint !== undefined) {
      const n = numOrNull(p.setpoint)
      if (n == null) {
        allowed.setpoint = null
      } else {
        const rMin = nextRange.min ?? 0
        const rMax = nextRange.max ?? 100
        allowed.setpoint = clamp(n, rMin, rMax)
      }
    }

    super.setProperties(allowed)

    const next = { ...cur, ...allowed } as SolenoidValveProps
    next.deviceName = next.nameZh
    next.deviceNameEn = next.nameEn
    this.properties = next
  }
}

class SolenoidValveView extends RectNode {
  static extendKey = 'SolenoidValveNode'
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

export default { type: 'bpmn:solenoid-valve', view: SolenoidValveView, model: SolenoidValveModel }
export { SolenoidValveView, SolenoidValveModel }
