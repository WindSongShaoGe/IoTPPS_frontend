import { GraphModel, h, NodeConfig, RectNode, RectNodeModel } from '@logicflow/core'
import { getBpmnId } from '@logicflow/extension/es/bpmn/getBpmnId'
import dtuSvg from '@/assets/icons/Communication Devices_Data Transmission Unit.svg'
import { baseFields, commFields, type FieldSchema } from '@/models/bpmn/schemas/commonSchema'

interface DtuProps {
  deviceName: string
  deviceNameEn: string
  productModel: string
  installDate: string
  note?: string
  protocols: string
  interfaceType: string
  commMethod: string
  powerSupply: string
}

class DtuModel extends RectNodeModel {
  static extendKey = 'DtuModel'

  static formSchema: FieldSchema[] = [
    ...baseFields,
    ...commFields,
    {
      key: 'note',
      label: '备注',
      type: 'textarea',
      placeholder: '请输入备注信息',
      rows: 4
    }
  ]

  declare properties: DtuProps

  constructor(data: NodeConfig, gm: GraphModel) {
    if (!data.id) data.id = `DTU_${getBpmnId()}`
    super(data, gm)
    this.width = this.width || 96
    this.height = this.height || 56
    if (this.text) this.text.editable = true
  }

  initNodeData(data: any) {
    super.initNodeData(data)
    const defaults: DtuProps = {
      deviceName: 'DTU',
      deviceNameEn: 'DTU',
      productModel: 'Sierra FX30',
      installDate: '2024-05-12',
      note: '协议桥接', // ✅ 初始化为“协议转换”
      protocols: 'Modbus 转 TCP/IP',
      interfaceType: 'RJ45/RS485',
      commMethod: '4G/5G',
      powerSupply: '12 VDC'
    }
    this.properties = { ...defaults, ...(data.properties || {}) }
  }
}

class DtuView extends RectNode {
  static extendKey = 'DtuNode'
  getShape(): any {
    const { x, y, width, height, radius } = this.props.model
    const style = this.props.model.getNodeStyle()
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
        'pointer-events': 'all'
      }),
      h('image', {
        href: dtuSvg,
        x: x - width / 2,
        y: y - height / 2,
        width,
        height,
        preserveAspectRatio: 'xMidYMid meet',
        'pointer-events': 'none'
      })
    ])
  }
}

export default { type: 'bpmn:dtuGateway', view: DtuView, model: DtuModel }
export { DtuModel, DtuView }
