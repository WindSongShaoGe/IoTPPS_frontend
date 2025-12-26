// src/models/bpmn/nodes/MechatronicDevices_UFUnit.ts
import { GraphModel, h, NodeConfig, RectNode, RectNodeModel } from '@logicflow/core'
import { getBpmnId } from '@logicflow/extension/es/bpmn/getBpmnId'
import ufUnitSvg from '@/assets/icons/Mechatronic Devices_Ultrafiltration Unit.svg'

export interface UFUnitProps {
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

class UFUnitModel extends RectNodeModel {
  static extendKey = 'UFUnitModel'

  static formSchema = [
    { key: 'productModel', label: '产品型号', type: 'text' },
    { key: 'installDate', label: '安装日期', type: 'date' },  // ✅ 改成 date
    { key: 'controlParam', label: '参数', type: 'text' },
    { key: 'unit', label: '单位', type: 'text' },
    { key: 'range', label: '设定范围', type: 'text' },
    { key: 'powerSupply', label: '供电方式', type: 'text' },
    { key: 'setpoint', label: '设定值', type: 'number' }, // ✅ 增加设定值
    { key: 'note', label: '备注', type: 'textarea', placeholder: '请输入备注信息'  },
  ]

  constructor(data: NodeConfig, graphModel: GraphModel) {
    if (!data.id) data.id = `UFUnit_${getBpmnId()}`
    super(data, graphModel)
    this.width = this.width || 96
    this.height = this.height || 56
    if (this.text) this.text.editable = true
  }

  initNodeData(data: any) {
    super.initNodeData(data)
    const defaults: UFUnitProps = {
      deviceName: 'UF Unit',
      deviceNameEn: 'UF Unit',
      productModel: 'Pentair X-Flow',
      installDate: '2024-05-12',
      note: '',
      controlParam: '产水量',
      unit: 'm³/h',
      range: '0～2',
      powerSupply: 'AC',
      setpoint: 1.5,
    }
    this.properties = { ...defaults, ...(data.properties || {}) }
  }
}

class UFUnitView extends RectNode {
  static extendKey = 'UFUnitNode'
  getShape(): any {
    const { x, y, width, height, radius } = this.props.model
    const style = this.props.model.getNodeStyle()
    return h('g', {}, [
      h('rect', { x: x - width / 2, y: y - height / 2, rx: radius, ry: radius, width, height, fill: 'transparent', stroke: style.stroke, 'stroke-opacity': 0.0001 }),
      h('image', { href: ufUnitSvg, x: x - width / 2, y: y - height / 2, width, height, preserveAspectRatio: 'xMidYMid meet', 'pointer-events': 'bounding-box' })
    ])
  }
}

const MechatronicDevices_UFUnit = {
  type: 'bpmn:uf-unit',
  view: UFUnitView,
  model: UFUnitModel,
}

export { UFUnitView, UFUnitModel }
export default MechatronicDevices_UFUnit
