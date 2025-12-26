// src/models/bpmn/nodes/MechatronicDevices_Mixer.ts
import { GraphModel, h, NodeConfig, RectNode, RectNodeModel } from '@logicflow/core'
import { getBpmnId } from '@logicflow/extension/es/bpmn/getBpmnId'

import mixerSvg from '@/assets/icons/Mechatronic Devices_Mixer.svg'
import type { FieldSchema } from '@/models/bpmn/schemas/commonSchema'

// —— 搅拌器属性 —— //
interface MixerProps {
  deviceName: string
  deviceNameEn: string
  productModel: string
  installDate: string
  note: string

  controlParam: string
  unit: string
  range: string
  powerSupply: string
  setpoint?: number | null
}

class MixerModel extends RectNodeModel {
  static extendKey = 'MixerModel'

  // ✅ 自定义 schema，保留设定范围显示但禁止修改
  static formSchema: FieldSchema[] = [
    { key: 'productModel', label: '产品型号', type: 'text' },
    { key: 'installDate', label: '安装日期', type: 'date' },
    { key: 'controlParam', label: '参数', type: 'text' },
    { key: 'unit', label: '单位', type: 'text' },
    { key: 'range', label: '设定范围', type: 'text' },
    { key: 'powerSupply', label: '供电方式', type: 'text' },
    { key: 'setpoint', label: '设定值', type: 'number' },
    { key: 'note', label: '备注', type: 'textarea', placeholder: '请输入备注信息' },
  ]

  constructor(data: NodeConfig, graphModel: GraphModel) {
    if (!data.id) data.id = `Mixer_${getBpmnId()}`
    super(data, graphModel)

    this.width = this.width || 96
    this.height = this.height || 56
    if (this.text) this.text.editable = true
  }

  initNodeData(data: any) {
  super.initNodeData(data)

  // 先定义默认值
  const defaults: MixerProps = {
    deviceName: '搅拌器（混合器）',
    deviceNameEn: 'Agitator', // ✅ 仅此设备生效
    productModel: 'IKA RW20',
    installDate: '2024-05-12',
    note: '',
    controlParam: '转速',
    unit: 'rpm',
    range: '0～500',
    powerSupply: 'AC',
    setpoint: 300,
  }

  // 合并用户传入的属性
  this.properties = { ...defaults, ...(data.properties || {}) }

  // 确保 deviceNameEn 始终显示 Agitator/Mixer
  this.properties.deviceNameEn = 'Agitator'
}



  // ✅ 防止用户修改 range
  setProperties(properties: Partial<MixerProps>) {
    if (properties.range) {
      properties.range = '0～额定值'
    }
    super.setProperties(properties)
  }
}

class MixerView extends RectNode {
  static extendKey = 'MixerNode'
  getShape(): any {
    const { model } = this.props
    const { x, y, width, height, radius } = model
    const style = model.getNodeStyle()

    return h('g', {}, [
      h('rect', { x: x - width / 2, y: y - height / 2, rx: radius, ry: radius, width, height, fill: 'transparent', stroke: style.stroke, 'stroke-opacity': 0.0001 }),
      h('image', { href: mixerSvg, x: x - width / 2, y: y - height / 2, width, height, preserveAspectRatio: 'xMidYMid meet', 'pointer-events': 'bounding-box' })
    ])
  }
}

const MechatronicDevices_Mixer = {
  type: 'bpmn:mixer',
  view: MixerView,
  model: MixerModel,
}

export { MixerView, MixerModel }
export default MechatronicDevices_Mixer
