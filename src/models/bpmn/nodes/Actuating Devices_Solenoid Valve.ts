// src/models/bpmn/nodes/ActuatingDevices_SolenoidValve.ts
import { GraphModel, h, NodeConfig, RectNode, RectNodeModel } from '@logicflow/core'
import { getBpmnId } from '@logicflow/extension/es/bpmn/getBpmnId'
import valveSvg from '@/assets/icons/Actuating Devices_Solenoid Valve.svg'
import { baseFields, actuatingFields, type FieldSchema } from '@/models/bpmn/schemas/commonSchema'

// —— 电磁阀节点的属性类型 —— //
export interface SolenoidValveProps {
  deviceName: string
  deviceNameEn: string
  productModel: string
  installDate: string
  note: string
  controlParam: string
  unit: string
  range: { min: number; max: number }   // ✅ 保留原来的两个范围框
  setpoint: number | null               // 设定值
  interfaceType: string
  powerSupply: string
}

class SolenoidValveModel extends RectNodeModel {
  static extendKey = 'SolenoidValveModel'

  static formSchema: FieldSchema[] = [
  ...baseFields,
  // 过滤掉默认的 setpoint 字段
  ...actuatingFields.filter(field => field.key !== 'setpoint'),
  // 重新定义 setpoint 并放在你想要的位置
  { key: 'setpoint', label: '设定值 (%)', type: 'number', step: 1 },
  { key: 'note', label: '备注', type: 'textarea' }
]


  constructor(data: NodeConfig, graphModel: GraphModel) {
    if (!data.id) data.id = `SOLENOID_VALVE_${getBpmnId()}`
    super(data, graphModel)
    this.width = this.width || 96
    this.height = this.height || 56
    if (this.text) this.text.editable = true
  }

  initNodeData(data: any) {
    super.initNodeData(data)
    const defaults: SolenoidValveProps = {
      deviceName: 'Solenoid Valve',
      deviceNameEn: 'Solenoid Valve',
      productModel: 'ASCO 210',
      installDate: '2024-05-12',
      note: '常闭型,24V线圈',
      controlParam: '阀门开度',
      unit: '%',
      range: { min: 0, max: 100 },  // ✅ 保留范围
      setpoint: 65,
      interfaceType: 'I/O',
      powerSupply: 'AC/DC',
    }
    this.properties = { ...defaults, ...(data.properties || {}) }
  }

  /** 设定值处理：确保数值在 0-100 范围内 */
  setProperties(patch: Partial<SolenoidValveProps>) {
    const curr = (this.properties || {}) as SolenoidValveProps
    const next: SolenoidValveProps = { ...curr, ...patch }

    if (next.setpoint !== null) {
      let n = Number(next.setpoint)
      if (!Number.isFinite(n)) n = curr.setpoint ?? 0
      n = Math.max(this.properties.range.min, Math.min(this.properties.range.max, n))
      next.setpoint = n
    }

    super.setProperties(next)
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

const ActuatingDevices_SolenoidValve = {
  type: 'bpmn:solenoidValve',
  view: SolenoidValveView,
  model: SolenoidValveModel,
}

export { SolenoidValveView, SolenoidValveModel }
export default ActuatingDevices_SolenoidValve
