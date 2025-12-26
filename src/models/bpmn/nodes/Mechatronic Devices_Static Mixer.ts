// src/models/bpmn/nodes/MechatronicDevices_StaticMixer.ts
import { GraphModel, h, NodeConfig, RectNode, RectNodeModel } from '@logicflow/core'
import { getBpmnId } from '@logicflow/extension/es/bpmn/getBpmnId'

import staticMixerSvg from '@/assets/icons/Mechatronic Devices_Static Mixer.svg'

export interface StaticMixerProps {
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

class StaticMixerModel extends RectNodeModel {
  static extendKey = 'StaticMixerModel'

  static formSchema = [
    { key: 'productModel', label: '产品型号', type: 'text' },
    { key: 'installDate', label: '安装日期', type: 'date' },
    { key: 'controlParam', label: '参数', type: 'text', disabled: true },
    { key: 'unit', label: '单位', type: 'text', disabled: true },
    { key: 'range', label: '设定范围', type: 'text', disabled: true },
    { key: 'powerSupply', label: '供电方式', type: 'text', disabled: true },
    { key: 'setpoint', label: '设定值', type: 'number' },
    { key: 'note', label: '备注', type: 'textarea' , placeholder: '请输入备注信息' },
  ]

  constructor(data: NodeConfig, graphModel: GraphModel) {
    if (!data.id) data.id = `StaticMixer_${getBpmnId()}`
    super(data, graphModel)
    this.width = this.width || 96
    this.height = this.height || 56
    if (this.text) this.text.editable = true
  }

  initNodeData(data: any) {
    super.initNodeData(data)
    const defaults: StaticMixerProps = {
      deviceName: '静态混合器',
      deviceNameEn: 'Static Mixer',
      productModel: 'DN40不锈钢',
      installDate: '2024-05-12',
      note: '',
      controlParam: '直径',
      unit: 'mm',
      range: '固定',
      powerSupply: '无',
      setpoint: 40,
    }
    this.properties = { ...defaults, ...(data.properties || {}) }
  }
}

class StaticMixerView extends RectNode {
  static extendKey = 'StaticMixerNode'

  getShape(): any {
    const { model } = this.props
    const { x, y, width, height, radius } = model
    const style = model.getNodeStyle()
    return h('g', {}, [
      h('rect', { x: x - width / 2, y: y - height / 2, rx: radius, ry: radius, width, height, fill: 'transparent', stroke: style.stroke, 'stroke-opacity': 0.0001 }),
      h('image', { href: staticMixerSvg, x: x - width / 2, y: y - height / 2, width, height, preserveAspectRatio: 'xMidYMid meet', 'pointer-events': 'bounding-box' })
    ])
  }
}

const MechatronicDevices_StaticMixer = {
  type: 'bpmn:static-mixer',
  view: StaticMixerView,
  model: StaticMixerModel,
}

export { StaticMixerView, StaticMixerModel }
export default MechatronicDevices_StaticMixer
