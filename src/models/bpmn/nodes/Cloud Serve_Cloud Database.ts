// src/models/bpmn/nodes/Cloud Serve_Cloud Database.ts
import { GraphModel, h, NodeConfig, RectNode, RectNodeModel } from '@logicflow/core'
import { getBpmnId } from '@logicflow/extension/es/bpmn/getBpmnId'
import cloudDatabaseSvg from '@/assets/icons/Cloud Serve_Cloud Database.svg'
import { baseFields, cloudFields, type FieldSchema } from '@/models/bpmn/schemas/commonSchema'

interface CloudDatabaseProps {
  nameZh: string
  nameEn: string
  deviceName?: string
  deviceNameEn?: string

  installDate: string
  note: string
  type: string
  function: string
  interfaceType: string
  commMethod: string
}

class CloudDatabaseModel extends RectNodeModel {
  static extendKey = 'CloudDatabaseModel'

  static formSchema: FieldSchema[] = [
    ...baseFields.filter(f => f.key !== 'productModel'),
    ...cloudFields.filter(f => f.key !== 'installDate' && f.key !== 'productModel'),
    { key: 'note', label: '备注', type: 'textarea', placeholder: '请输入备注信息' },
  ]

  declare properties: CloudDatabaseProps

  constructor(data: NodeConfig, gm: GraphModel) {
    if (!data.id) data.id = `cloud-database_${getBpmnId()}`
    super(data, gm)
    this.width = this.width || 96
    this.height = this.height || 56
    if (this.text) this.text.editable = true
  }

  initNodeData(data: any) {
    super.initNodeData(data)
    const defaults: CloudDatabaseProps = {
      nameZh: '云数据库',
      nameEn: 'Cloud Database',
      deviceName: '云数据库',
      deviceNameEn: 'Cloud Database',

      installDate: '2024-05-12',
      note: '500GB存储',
      type: 'MySQL 8.0',
      function: '数据存储',
      interfaceType: 'API',
      commMethod: 'TCP/IP',
    }
    const merged = { ...defaults, ...(data.properties || {}) } as CloudDatabaseProps
    if (!merged.nameZh && merged.deviceName) merged.nameZh = String(merged.deviceName)
    if (!merged.nameEn && merged.deviceNameEn) merged.nameEn = String(merged.deviceNameEn)
    merged.deviceName = merged.nameZh
    merged.deviceNameEn = merged.nameEn
    this.properties = merged
  }

  setProperties(p: Partial<CloudDatabaseProps>) {
    const allowed: Partial<CloudDatabaseProps> = {}

    if (p.nameZh !== undefined) allowed.nameZh = p.nameZh
    if (p.nameEn !== undefined) allowed.nameEn = p.nameEn

    if (p.installDate !== undefined) allowed.installDate = p.installDate
    if (p.note !== undefined) allowed.note = p.note
    if (p.type !== undefined) allowed.type = p.type
    if (p.function !== undefined) allowed.function = p.function
    if (p.interfaceType !== undefined) allowed.interfaceType = p.interfaceType
    if (p.commMethod !== undefined) allowed.commMethod = p.commMethod

    super.setProperties(allowed)

    const next = { ...this.properties, ...allowed } as CloudDatabaseProps
    next.deviceName = next.nameZh
    next.deviceNameEn = next.nameEn
    this.properties = next
  }
}

class CloudDatabaseView extends RectNode {
  static extendKey = 'CloudDatabaseNode'
  getShape(): any {
    const { x, y, width, height, radius } = this.props.model
    const style = this.props.model.getNodeStyle()
    return h('g', {}, [
      h('rect', {
        x: x - width / 2,
        y: y - height / 2,
        rx: radius, ry: radius,
        width, height,
        fill: 'transparent',
        stroke: style.stroke,
        'stroke-opacity': 0.0001,
      }),
      h('image', {
        href: cloudDatabaseSvg,
        x: x - width / 2,
        y: y - height / 2,
        width, height,
        preserveAspectRatio: 'xMidYMid meet',
        'pointer-events': 'bounding-box',
      }),
    ])
  }
}

export default { type: 'bpmn:cloud-database', view: CloudDatabaseView, model: CloudDatabaseModel }
export { CloudDatabaseView, CloudDatabaseModel }
