import { GraphModel, h, NodeConfig, RectNode, RectNodeModel } from '@logicflow/core'
import { getBpmnId } from '@logicflow/extension/es/bpmn/getBpmnId'

import pumpSvg from '@/assets/icons/Mechatronic Devices_Pump.svg'
import { type FieldSchema } from '@/models/bpmn/schemas/commonSchema'

interface PumpProps {
  deviceName: string
  deviceNameEn: string
  productModel: string
  installDate: string
  note: string
  param: string
  unit: string
  range: string
  powerSupply: string
  setpoint: number | null
}

class PumpModel extends RectNodeModel {
  static extendKey = 'PumpModel'

  // ✅ 去掉 disabled，保留字段顺序
  static formSchema: FieldSchema[] = [
  
    { key: 'productModel', label: '产品型号', type: 'text' },
    { key: 'installDate', label: '安装日期', type: 'date' },
    { key: 'param', label: '参数', type: 'text' },
    { key: 'unit', label: '单位', type: 'text' },
    { key: 'range', label: '设定范围', type: 'text' },
    { key: 'powerSupply', label: '供电方式', type: 'text' }, // ✅ 挪到接口类型原位置
    { key: 'setpoint', label: '设定值', type: 'number' },
    { key: 'note', label: '备注', type: 'textarea' , placeholder: '请输入备注信息' }
  ]

  constructor(data: NodeConfig, graphModel: GraphModel) {
    if (!data.id) data.id = `Pump_${getBpmnId()}`
    super(data, graphModel)
    this.width = this.width || 96
    this.height = this.height || 56
    if (this.text) this.text.editable = true
  }

  initNodeData(data: any) {
    super.initNodeData(data)
    const defaults: PumpProps = {
      deviceName: '泵',
      deviceNameEn: 'Pump',
      productModel: 'Grundfos CR5-8',
      installDate: '2024-05-12',
      note: '',
      param: '额定流量',
      unit: 'm³/h',
      range: '0～5',
      powerSupply: 'AC',
      setpoint: 3.5
    }
    this.properties = { ...defaults, ...(data.properties || {}) }
  }
}

class PumpView extends RectNode {
  static extendKey = 'PumpNode'

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
        'stroke-opacity': 0.0001
      }),
      h('image', {
        href: pumpSvg,
        x: x - width / 2,
        y: y - height / 2,
        width,
        height,
        preserveAspectRatio: 'xMidYMid meet',
        'pointer-events': 'bounding-box'
      })
    ])
  }
}

const MechatronicDevices_Pump = {
  type: 'bpmn:pump',
  view: PumpView,
  model: PumpModel
}

export { PumpView, PumpModel }
export default MechatronicDevices_Pump
