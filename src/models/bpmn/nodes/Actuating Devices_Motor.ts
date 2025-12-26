// src/models/bpmn/nodes/Actuating Devices_Motor.ts
import { GraphModel, h, NodeConfig, RectNode, RectNodeModel } from '@logicflow/core'
import { getBpmnId } from '@logicflow/extension/es/bpmn/getBpmnId'
import motorSvg from '@/assets/icons/Actuating Devices_Motor.svg'
import { baseFields, actuatingFields, type FieldSchema } from '@/models/bpmn/schemas/commonSchema'

export interface MotorProps {
  deviceName: string
  deviceNameEn: string
  productModel: string
  installDate: string
  note: string
  controlParam: string
  unit: string
  // 保留 range 给其它逻辑用，但不在面板里渲染
  range: { min: number | null; max: number | null }
  // 新增一个纯展示字段替代原来的两个框
  rangeDisplay: string
  setpoint: number | null
  interfaceType: string
  powerSupply: string
}

class MotorModel extends RectNodeModel {
  static extendKey = 'MotorModel'

  // 1) 过滤掉原来的 range 复合字段
  // 2) 增加一个“设定范围”的只读文本字段显示 “0 ～ 额定值”
  // 3) 增加备注 textarea（不要加 rows，schema 里没有这个属性）
  static formSchema: FieldSchema[] = [
    ...baseFields,
    ...actuatingFields.filter(f => f.key !== 'range'),
    { key: 'rangeDisplay', label: '设定范围', type: 'text' },
    { key: 'note', label: '备注', type: 'textarea', placeholder: '请输入备注信息' },
  ]

  declare properties: MotorProps

  constructor(data: NodeConfig, graphModel: GraphModel) {
    if (!data.id) data.id = `Motor_${getBpmnId()}`
    super(data, graphModel)
    this.width = this.width || 96
    this.height = this.height || 56
    if (this.text) this.text.editable = true
  }

  initNodeData(data: any) {
    super.initNodeData(data)
    const defaults: MotorProps = {
      deviceName: 'Motor',
      deviceNameEn: 'Motor',
      productModel: 'ABB M3BP112',
      installDate: '2024-05-12',
      note: '2.2 kW',
      controlParam: '转速',
      unit: 'rpm',
      range: { min: 0, max: 1500 },            // 原始数值区间（不渲染）
      rangeDisplay: '0 ～ 1500',              // 面板展示用
      setpoint: 750,
      interfaceType: 'I/O',
      powerSupply: 'AC',
    }

    const merged = { ...defaults, ...(data.properties || {}) }

    // 兜底：没有 rangeDisplay 时强制填入展示文案
    if (!merged.rangeDisplay) {
      merged.rangeDisplay = '0 ～ 额定值'
    }

    this.properties = merged
  }

  // 防止用户把展示字段改掉
  setProperties(p: Partial<MotorProps>) {
    const allowed: Partial<MotorProps> = {}

    if (p.productModel !== undefined) allowed.productModel = p.productModel
    if (p.installDate !== undefined) allowed.installDate = p.installDate
    if (p.note !== undefined) allowed.note = p.note
    if (p.setpoint !== undefined) allowed.setpoint = p.setpoint
    if (p.interfaceType !== undefined) allowed.interfaceType = p.interfaceType
    if (p.powerSupply !== undefined) allowed.powerSupply = p.powerSupply

    // rangeDisplay 只读：忽略外部修改
    if (p.rangeDisplay !== undefined) {
      allowed.rangeDisplay = this.properties.rangeDisplay ?? '0 ～ 额定值'
    }

    super.setProperties(allowed)
    this.properties = { ...this.properties, ...allowed }
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
