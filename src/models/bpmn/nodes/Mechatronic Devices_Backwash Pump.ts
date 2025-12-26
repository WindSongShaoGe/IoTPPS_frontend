// src/models/bpmn/nodes/MechatronicDevices_BackwashPump.ts
import { GraphModel, h, NodeConfig, RectNode, RectNodeModel } from '@logicflow/core'
import { getBpmnId } from '@logicflow/extension/es/bpmn/getBpmnId'

import backwashPumpSvg from '@/assets/icons/Mechatronic Devices_Backwash Pump.svg'

// —— 反冲洗泵属性类型 —— //
export interface BackwashPumpProps {
  deviceName: string
  deviceNameEn: string
  productModel: string
  installDate: string
  note: string

  controlParam: string
  unit: string
  range: string       // ✅ 改成字符串
  powerSupply: string
  setpoint: number | null
}

class BackwashPumpModel extends RectNodeModel {
  static extendKey = 'BackwashPumpModel'

  // 属性面板 schema（去掉 disabled，保留供电方式和设定值）
  static formSchema = [
    { key: 'productModel', label: '产品型号', type: 'text' },
    { key: 'installDate', label: '安装日期', type: 'date' },
    { key: 'controlParam', label: '参数', type: 'text' },
    { key: 'unit', label: '单位', type: 'text' },
    { key: 'range', label: '设定范围', type: 'text' },
    { key: 'powerSupply', label: '供电方式', type: 'text' }, // ✅ 调整排版位置
    { key: 'setpoint', label: '设定值', type: 'number' },
    { key: 'note', label: '备注', type: 'textarea', placeholder: '请输入备注信息'  },
  ]

  constructor(data: NodeConfig, graphModel: GraphModel) {
    if (!data.id) {
      data.id = `BackwashPump_${getBpmnId()}`
    }
    super(data, graphModel)
    this.width = this.width || 96
    this.height = this.height || 56
    if (this.text) this.text.editable = true
  }

  /** 初始化默认属性 */
  initNodeData(data: any) {
    super.initNodeData(data)
    const defaults: BackwashPumpProps = {
      deviceName: 'Backwash Pump',
      deviceNameEn: 'Backwash Pump',
      productModel: 'LOWARA BG',
      installDate: '2024-05-12',
      note: '',
      controlParam: '流量',
      unit: 'm³/h',
      range: '0～10',   // ✅ 改成字符串，避免显示 [object Object]
      powerSupply: 'AC',
      setpoint: 8,
    }
    this.properties = { ...defaults, ...(data.properties || {}) }
  }
}

class BackwashPumpView extends RectNode {
  static extendKey = 'BackwashPumpNode'

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
        href: backwashPumpSvg,
        x: x - width / 2,
        y: y - height / 2,
        width, height,
        preserveAspectRatio: 'xMidYMid meet',
        'pointer-events': 'bounding-box'
      })
    ])
  }
}

const MechatronicDevices_BackwashPump = {
  type: 'bpmn:backwash-pump',
  view: BackwashPumpView,
  model: BackwashPumpModel,
}

export { BackwashPumpView, BackwashPumpModel }
export default MechatronicDevices_BackwashPump
