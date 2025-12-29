// src/models/bpmn/nodes/MechatronicDevices_CartridgeFilter.ts
import { GraphModel, h, NodeConfig, RectNode, RectNodeModel } from '@logicflow/core'
import { getBpmnId } from '@logicflow/extension/es/bpmn/getBpmnId'
import type { FieldSchema } from '@/models/bpmn/schemas/commonSchema'
import cartridgeFilterSvg from '@/assets/icons/Mechatronic Devices_Cartridge Filter.svg'

export interface CartridgeFilterProps {
  nameZh: string
  nameEn: string
  deviceName?: string
  deviceNameEn?: string

  productModel: string
  installDate: string
  note: string
  controlParam: string
  unit: string
  range: string
  powerSupply: string
  setpoint: number | null
}

class CartridgeFilterModel extends RectNodeModel {
  static extendKey = 'CartridgeFilterModel'

  static formSchema: FieldSchema[] = [
    { key: 'productModel', label: '产品型号', type: 'text' },
    { key: 'installDate', label: '安装日期', type: 'date' },
    { key: 'controlParam', label: '参数', type: 'text' },
    { key: 'unit', label: '单位', type: 'text' },
    { key: 'range', label: '设定范围', type: 'text' },
    { key: 'powerSupply', label: '供电方式', type: 'text' },
    { key: 'setpoint', label: '设定值', type: 'number', step: 1 } as any,
    { key: 'note', label: '备注', type: 'textarea', placeholder: '请输入备注信息' } as any,
  ]

  declare properties: CartridgeFilterProps

  constructor(data: NodeConfig, graphModel: GraphModel) {
    if (!data.id) data.id = `cartridge-filter_${getBpmnId()}`
    super(data, graphModel)
    this.width = this.width || 96
    this.height = this.height || 56
    if (this.text) this.text.editable = true
  }

  initNodeData(data: any) {
    super.initNodeData(data)
    const defaults: CartridgeFilterProps = {
      nameZh: '滤芯过滤器',
      nameEn: 'Cartridge Filter',
      deviceName: '滤芯过滤器',
      deviceNameEn: 'Cartridge Filter',

      productModel: 'PP 5 μm',
      installDate: '2024-05-12',
      note: '',
      controlParam: '滤芯精度',
      unit: 'μm',
      range: '固定',
      powerSupply: '无',
      setpoint: 5,
    }

    const merged = { ...defaults, ...(data.properties || {}) } as CartridgeFilterProps
    if (!merged.nameZh && merged.deviceName) merged.nameZh = String(merged.deviceName)
    if (!merged.nameEn && merged.deviceNameEn) merged.nameEn = String(merged.deviceNameEn)
    merged.deviceName = merged.nameZh
    merged.deviceNameEn = merged.nameEn
    this.properties = merged
  }

  setProperties(p: Partial<CartridgeFilterProps>) {
    const allowed: Partial<CartridgeFilterProps> = {}

    if (p.nameZh !== undefined) allowed.nameZh = p.nameZh
    if (p.nameEn !== undefined) allowed.nameEn = p.nameEn

    if (p.productModel !== undefined) allowed.productModel = p.productModel
    if (p.installDate !== undefined) allowed.installDate = p.installDate
    if (p.note !== undefined) allowed.note = p.note
    if (p.setpoint !== undefined) allowed.setpoint = p.setpoint
    if (p.powerSupply !== undefined) allowed.powerSupply = p.powerSupply

    // 🔒 range / controlParam / unit 不允许改（固定属性）
    super.setProperties(allowed)

    const next = { ...this.properties, ...allowed } as CartridgeFilterProps
    next.deviceName = next.nameZh
    next.deviceNameEn = next.nameEn
    this.properties = next
  }
}

class CartridgeFilterView extends RectNode {
  static extendKey = 'CartridgeFilterNode'

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
        href: cartridgeFilterSvg,
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

export default { type: 'bpmn:cartridge-filter', view: CartridgeFilterView, model: CartridgeFilterModel }
export { CartridgeFilterView, CartridgeFilterModel }
