import { GraphModel, h, NodeConfig, RectNode, RectNodeModel } from '@logicflow/core'
import { getBpmnId } from '@logicflow/extension/es/bpmn/getBpmnId'
import wirelessSvg from '@/assets/icons/Communication Devices_Wireless Communication Module.svg'
import { baseFields, commFields, type FieldSchema } from '@/models/bpmn/schemas/commonSchema'

interface WirelessProps {
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

class WirelessModel extends RectNodeModel {
  static extendKey = 'WirelessModel'

  // ✅ 增加备注字段
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

  declare properties: WirelessProps

  constructor(data: NodeConfig, gm: GraphModel) {
    if (!data.id) data.id = `WIRELESS_${getBpmnId()}`
    super(data, gm)
    this.width = this.width || 96
    this.height = this.height || 56
    if (this.text) this.text.editable = true
  }

  initNodeData(data: any) {
    super.initNodeData(data)
    const defaults: WirelessProps = {
      deviceName: 'Wireless Module',
      deviceNameEn: 'Wireless Module',
      productModel: 'Huawei NB-IoT-01',
      installDate: '2024-05-12',
      note: '远程数据回传', // ✅ 备注初始化为空（可以改成 '无线通讯' 等说明）
      protocols: 'Wi-Fi, ZigBee, LoRa, NB-IoT',
      interfaceType: 'UART/网口',
      commMethod: '无线',
      powerSupply: '12 VDC'
    }
    this.properties = { ...defaults, ...(data.properties || {}) }
  }
}

class WirelessView extends RectNode {
  static extendKey = 'WirelessNode'
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
        href: wirelessSvg,
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

export default { type: 'bpmn:wirelessModule', view: WirelessView, model: WirelessModel }
export { WirelessModel, WirelessView }
