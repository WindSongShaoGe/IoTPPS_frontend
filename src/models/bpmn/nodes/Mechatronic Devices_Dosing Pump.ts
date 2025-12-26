// src/models/bpmn/nodes/MechatronicDevices_DosingPump.ts
import { GraphModel, h, NodeConfig, RectNode, RectNodeModel } from '@logicflow/core'
import { getBpmnId } from '@logicflow/extension/es/bpmn/getBpmnId'

import dosingPumpSvg from '@/assets/icons/Mechatronic Devices_Dosing Pump.svg'

// —— 计量泵属性类型 —— //
export interface DosingPumpProps {
  deviceName: string
  deviceNameEn: string
  productModel: string
  installDate: string
  note: string

  controlParam: string
  unit: string
  range: string           // ✅ 改成字符串
  powerSupply: string
  setpoint: number | null
}

class DosingPumpModel extends RectNodeModel {
  static extendKey = 'DosingPumpModel'

  // 属性面板 schema
  static formSchema = [
    { key: 'productModel', label: '产品型号', type: 'text' },
    { key: 'installDate', label: '安装日期', type: 'date' },
    { key: 'controlParam', label: '参数', type: 'text' },
    { key: 'unit', label: '单位', type: 'text' },
    { key: 'range', label: '设定范围', type: 'text' },
    { key: 'powerSupply', label: '供电方式', type: 'text' }, // ✅ 位置调整
    { key: 'setpoint', label: '设定值', type: 'number' },
    { key: 'note', label: '备注', type: 'textarea', placeholder: '请输入备注信息'  },
  ]

  constructor(data: NodeConfig, graphModel: GraphModel) {
    if (!data.id) {
      data.id = `DosingPump_${getBpmnId()}`
    }
    super(data, graphModel)
    this.width = this.width || 96
    this.height = this.height || 56
    if (this.text) this.text.editable = true
  }

  /** 初始化默认属性 */
  initNodeData(data: any) {
    super.initNodeData(data)
    const defaults: DosingPumpProps = {
      deviceName: 'Dosing Pump',
      deviceNameEn: 'Dosing Pump',
      productModel: 'Prominent GammaX',
      installDate: '2024-05-12',
      note: '',

      controlParam: '加药量',
      unit: 'L/h',
      range: '0～5',  // ✅ 改成字符串
      powerSupply: 'AC',
      setpoint: 2,
    }
    this.properties = { ...defaults, ...(data.properties || {}) }
  }
}

class DosingPumpView extends RectNode {
  static extendKey = 'DosingPumpNode'

  getShape(): any {
    const { model } = this.props
    const { x, y, width, height, radius } = model
    const style = model.getNodeStyle()

    return h('g', {}, [
      // 点击区域
      h('rect', {
        x: x - width / 2,
        y: y - height / 2,
        rx: radius, ry: radius,
        width, height,
        fill: 'transparent',
        stroke: style.stroke,
        'stroke-opacity': 0.0001
      }),

      // 图标
      h('image', {
        href: dosingPumpSvg,
        x: x - width / 2,
        y: y - height / 2,
        width, height,
        preserveAspectRatio: 'xMidYMid meet',
        'pointer-events': 'bounding-box'
      })
    ])
  }
}

const MechatronicDevices_DosingPump = {
  type: 'bpmn:dosing-pump',
  view: DosingPumpView,
  model: DosingPumpModel,
}

export { DosingPumpView, DosingPumpModel }
export default MechatronicDevices_DosingPump
