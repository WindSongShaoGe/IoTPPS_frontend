// src/models/bpmn/nodes/MechatronicDevices_MotorizedValve.ts
import { GraphModel, h, NodeConfig, RectNode, RectNodeModel } from '@logicflow/core'
import { getBpmnId } from '@logicflow/extension/es/bpmn/getBpmnId'
import valveSvg from '@/assets/icons/Mechatronic Devices_Motorized Valve.svg'

// —— 电动阀门属性类型 —— //
export interface MotorizedValveProps {
  deviceName: string
  deviceNameEn: string
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

  // ✅ 重新定义 formSchema，把设定值字段改成带（%）的数字框
  static formSchema = [
    { key: 'productModel', label: '产品型号', type: 'text' },
    { key: 'installDate', label: '安装日期', type: 'date' },
    { key: 'controlParam', label: '控制参数', type: 'text' },
    { key: 'unit', label: '单位', type: 'text' },
    { key: 'range', label: '设定范围', type: 'text' },
    { key: 'powerSupply', label: '供电方式', type: 'text' },
    // ✅ 改成带百分号说明的新设定值框
    { key: 'setpoint', label: '设定值（%）', type: 'number', step: 1, placeholder: '请输入 0-100 的数值' },
    { key: 'note', label: '备注', type: 'textarea', placeholder: '请输入备注信息' },
  ]

  constructor(data: NodeConfig, graphModel: GraphModel) {
    if (!data.id) data.id = `MotorizedValve_${getBpmnId()}`
    super(data, graphModel)
    this.width = this.width || 96
    this.height = this.height || 56
    if (this.text) this.text.editable = true
  }

  initNodeData(data: any) {
    super.initNodeData(data)
    const defaults: MotorizedValveProps = {
      deviceName: 'Motorized Valve',
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
    this.properties = { ...defaults, ...(data.properties || {}) }
  }

  /** 保证设定值在 0~100 之间 */
  setProperties(patch: Partial<MotorizedValveProps>) {
    const curr = (this.properties || {}) as MotorizedValveProps
    const next: MotorizedValveProps = { ...curr, ...patch }

    if (next.setpoint !== null) {
      let n = Number(next.setpoint)
      if (!Number.isFinite(n)) n = curr.setpoint ?? 0
      n = Math.max(0, Math.min(100, n)) // 限制在 0-100 之间
      next.setpoint = n
    }

    super.setProperties(next)
  }

  /** 显示设定值时自动加上 % 符号 */
  get displaySetpoint() {
    const val = (this.properties as MotorizedValveProps).setpoint
    return val !== null ? `${val}%` : ''
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

const MechatronicDevices_MotorizedValve = {
  type: 'bpmn:motorizedValve',
  view: MotorizedValveView,
  model: MotorizedValveModel,
}

export { MotorizedValveView, MotorizedValveModel }
export default MechatronicDevices_MotorizedValve
