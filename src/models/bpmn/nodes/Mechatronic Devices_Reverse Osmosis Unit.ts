// src/models/bpmn/nodes/MechatronicDevices_ReverseOsmosisUnit.ts
import { GraphModel, h, NodeConfig, RectNode, RectNodeModel } from '@logicflow/core'
import { getBpmnId } from '@logicflow/extension/es/bpmn/getBpmnId'

import reverseOsmosisUnitSvg from '@/assets/icons/Mechatronic Devices_Reverse Osmosis Unit.svg'

// —— 反渗透装置属性 —— //
export interface ReverseOsmosisUnitProps {
  deviceName: string
  deviceNameEn: string
  productModel: string
  installDate: string
  note: string

  controlParam: string
  unit: string
  range: string        // ✅ 改成字符串
  powerSupply: string
  setpoint: number | null   // ✅ 新增设定值
}

class ReverseOsmosisUnitModel extends RectNodeModel {
  static extendKey = 'ReverseOsmosisUnitModel'

  // ✅ 自定义 schema，和泵保持一致
  static formSchema = [
    { key: 'productModel', label: '产品型号', type: 'text' },
    { key: 'installDate', label: '安装日期', type: 'date' },
    { key: 'controlParam', label: '参数', type: 'text' },
    { key: 'unit', label: '单位', type: 'text' },
    { key: 'range', label: '设定范围', type: 'text' },
    { key: 'powerSupply', label: '供电方式', type: 'text' },
    { key: 'setpoint', label: '设定值', type: 'number' },   // ✅ 新增设定值窗口
    { key: 'note', label: '备注', type: 'textarea', placeholder: '请输入备注信息'  },
  ]

  constructor(data: NodeConfig, graphModel: GraphModel) {
    if (!data.id) data.id = `ReverseOsmosisUnit_${getBpmnId()}`
    super(data, graphModel)
    this.width = this.width || 96
    this.height = this.height || 56
    if (this.text) this.text.editable = true
  }

  /** 初始化默认属性 */
  initNodeData(data: any) {
    super.initNodeData(data)
    const defaults: ReverseOsmosisUnitProps = {
      deviceName: 'RO Unit',
      deviceNameEn: 'RO Unit',
      productModel: 'Dow BW30-4040',
      installDate: '2024-05-12',
      note: '产水 1.5 m³/h',

      controlParam: '脱盐率',
      unit: '%',
      range: '0～99',
      powerSupply: 'AC',
      setpoint: 98,
    }
    this.properties = { ...defaults, ...(data.properties || {}) }
  }
}

class ReverseOsmosisUnitView extends RectNode {
  static extendKey = 'ReverseOsmosisUnitNode'

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
        href: reverseOsmosisUnitSvg,
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

const MechatronicDevices_ReverseOsmosisUnit = {
  type: 'bpmn:reverse-osmosis-unit',
  view: ReverseOsmosisUnitView,
  model: ReverseOsmosisUnitModel,
}

export { ReverseOsmosisUnitView, ReverseOsmosisUnitModel }
export default MechatronicDevices_ReverseOsmosisUnit
