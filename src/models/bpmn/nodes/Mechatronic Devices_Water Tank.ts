import { GraphModel, h, NodeConfig, RectNode, RectNodeModel } from '@logicflow/core'
import { getBpmnId } from '@logicflow/extension/es/bpmn/getBpmnId'

import waterTankSvg from '@/assets/icons/Mechatronic Devices_Water Tank.svg'
import type { FieldSchema } from '@/models/bpmn/schemas/commonSchema'

// —— 水箱属性 —— //
interface WaterTankProps {
  deviceName: string
  deviceNameEn: string
  productModel: string
  installDate: string
  note: string

  controlParam: string
  unit: string
  range: string
  powerSupply: string
  setpoint: number | null   // ✅ 新增设定值属性
}

class WaterTankModel extends RectNodeModel {
  static extendKey = 'WaterTankModel'

  // ✅ 自定义 schema，新增设定值字段
  static formSchema: FieldSchema[] = [
    { key: 'productModel', label: '产品型号', type: 'text' },
    { key: 'installDate', label: '安装日期', type: 'date' },
    { key: 'controlParam', label: '参数', type: 'text' },
    { key: 'unit', label: '单位', type: 'text' },
    { key: 'range', label: '设定范围', type: 'text' }, // 只读显示“无”
    { key: 'powerSupply', label: '供电方式', type: 'text' },
    { key: 'setpoint', label: '设定值 (m³)', type: 'number', step: 0.1 }, // ✅ 新增输入框
    { key: 'note', label: '备注', type: 'textarea', placeholder: '请输入备注信息'  },
  ]

  constructor(data: NodeConfig, graphModel: GraphModel) {
    if (!data.id) data.id = `WaterTank_${getBpmnId()}`
    super(data, graphModel)
    this.width = this.width || 96
    this.height = this.height || 56
    if (this.text) this.text.editable = true
  }

  initNodeData(data: any) {
    super.initNodeData(data)
    const defaults: WaterTankProps = {
      deviceName: '水箱',
      deviceNameEn: 'Water Tank',
      productModel: '玻璃钢2 m³',
      installDate: '2024-05-12',
      note: '',
      controlParam: '容积',
      unit: 'm³',
      range: '固定', // 固定值
      powerSupply: '无',
      setpoint: 2
    }
    this.properties = { ...defaults, ...(data.properties || {}) }
  }

  // ✅ 拦截属性修改，防止用户改 range
  setProperties(properties: Partial<WaterTankProps>) {
    if (properties.range) {
      properties.range = '无'
    }
    super.setProperties(properties)
  }
}

class WaterTankView extends RectNode {
  static extendKey = 'WaterTankNode'
  getShape(): any {
    const { model } = this.props
    const { x, y, width, height, radius } = model
    const style = model.getNodeStyle()

    return h('g', {}, [
      h('rect', { x: x - width / 2, y: y - height / 2, rx: radius, ry: radius, width, height, fill: 'transparent', stroke: style.stroke, 'stroke-opacity': 0.0001 }),
      h('image', { href: waterTankSvg, x: x - width / 2, y: y - height / 2, width, height, preserveAspectRatio: 'xMidYMid meet', 'pointer-events': 'bounding-box' })
    ])
  }
}

const MechatronicDevices_WaterTank = {
  type: 'bpmn:water-tank',
  view: WaterTankView,
  model: WaterTankModel,
}

export { WaterTankView, WaterTankModel }
export default MechatronicDevices_WaterTank
