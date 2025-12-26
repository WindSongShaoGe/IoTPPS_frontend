import { GraphModel, h, NodeConfig, RectNode, RectNodeModel } from '@logicflow/core'
import { getBpmnId } from '@logicflow/extension/es/bpmn/getBpmnId'

import chemicalDosingTankSvg from '@/assets/icons/Mechatronic Devices_Chemical Dosing Tank.svg'
import type { FieldSchema } from '@/models/bpmn/schemas/commonSchema'

// —— 药剂罐属性接口 —— //
interface ChemicalTankProps {
  deviceName: string
  deviceNameEn: string
  productModel: string
  installDate: string
  note: string
  controlParam: string
  unit: string
  range: string
  powerSupply: string
  setpoint: number | null     // ✅ 新增设定值
}

class ChemicalTankModel extends RectNodeModel {
  static extendKey = 'ChemicalTankModel'

  // ✅ 表单 schema 新增设定值输入框
  static formSchema: FieldSchema[] = [
    { key: 'productModel', label: '产品型号', type: 'text' },
    { key: 'installDate', label: '安装日期', type: 'date' },
    { key: 'controlParam', label: '参数', type: 'text' },
    { key: 'unit', label: '单位', type: 'text' },
    { key: 'range', label: '设定范围', type: 'text' },
    { key: 'powerSupply', label: '供电方式', type: 'text' },
    { key: 'setpoint', label: '设定值 (m³)', type: 'number', step: 0.1 }, // ✅ 新增
    { key: 'note', label: '备注', type: 'textarea', placeholder: '请输入备注信息'  },
  ]

  constructor(data: NodeConfig, graphModel: GraphModel) {
    if (!data.id) {
      data.id = `ChemicalTank_${getBpmnId()}`
    }
    super(data, graphModel)

    this.width = this.width || 96
    this.height = this.height || 56
    if (this.text) this.text.editable = true
  }

  initNodeData(data: any) {
    super.initNodeData(data)
    const defaults: ChemicalTankProps = {
      deviceName: '药剂罐',
      deviceNameEn: 'Chemical Tank',
      productModel: 'PE 500 L',
      installDate: '2024-05-12',
      note: '',
      controlParam: '容积',
      unit: 'L',
      range: '固定',
      powerSupply: '无',
      setpoint: 500,
    }
    this.properties = { ...defaults, ...(data.properties || {}) }
  }

  // ✅ 防止用户修改 range
  setProperties(properties: Partial<ChemicalTankProps>) {
    if (properties.range) {
      properties.range = '无'
    }
    super.setProperties(properties)
  }
}

class ChemicalTankView extends RectNode {
  static extendKey = 'ChemicalTankNode'

  getShape(): any {
    const { model } = this.props
    const { x, y, width, height, radius } = model
    const style = model.getNodeStyle()

    return h('g', {}, [
      h('rect', {
        x: x - width / 2,
        y: y - height / 2,
        rx: radius, ry: radius,
        width, height,
        fill: 'transparent',
        stroke: style.stroke,
        'stroke-opacity': 0.0001
      }),
      h('image', {
        href: chemicalDosingTankSvg,
        x: x - width / 2,
        y: y - height / 2,
        width, height,
        preserveAspectRatio: 'xMidYMid meet',
        'pointer-events': 'bounding-box'
      })
    ])
  }
}

const MechatronicDevices_ChemicalTank = {
  type: 'bpmn:chemical-tank',
  view: ChemicalTankView,
  model: ChemicalTankModel,
}

export { ChemicalTankView, ChemicalTankModel }
export default MechatronicDevices_ChemicalTank
