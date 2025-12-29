// src/models/bpmn/nodes/Cloud Server_Remote Console.ts
import { GraphModel, h, NodeConfig, RectNode, RectNodeModel } from '@logicflow/core'
import { getBpmnId } from '@logicflow/extension/es/bpmn/getBpmnId'
import remoteConsoleSvg from '@/assets/icons/Cloud Server_Remote Console.svg'
import { baseFields, cloudFields, type FieldSchema } from '@/models/bpmn/schemas/commonSchema'

interface RemoteConsoleProps {
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

class RemoteConsoleModel extends RectNodeModel {
  static extendKey = 'RemoteConsoleModel'

  static formSchema: FieldSchema[] = [
    ...baseFields.filter(f => f.key !== 'productModel'),
    ...cloudFields.filter(f => f.key !== 'installDate' && f.key !== 'productModel'),
    { key: 'note', label: '备注', type: 'textarea', placeholder: '请输入备注信息' },
  ]

  declare properties: RemoteConsoleProps

  constructor(data: NodeConfig, gm: GraphModel) {
    if (!data.id) data.id = `remote-console_${getBpmnId()}`
    super(data, gm)
    this.width = this.width || 96
    this.height = this.height || 56
    if (this.text) this.text.editable = true
  }

  initNodeData(data: any) {
    super.initNodeData(data)
    const defaults: RemoteConsoleProps = {
      nameZh: '远程控制台',
      nameEn: 'Remote Console',
      deviceName: '远程控制台',
      deviceNameEn: 'Remote Console',

      installDate: '2024-05-12',
      note: '',
      type: 'Web HMI',
      function: '远程监控',
      interfaceType: 'API',
      commMethod: 'Web',
    }
    const merged = { ...defaults, ...(data.properties || {}) } as RemoteConsoleProps
    if (!merged.nameZh && merged.deviceName) merged.nameZh = String(merged.deviceName)
    if (!merged.nameEn && merged.deviceNameEn) merged.nameEn = String(merged.deviceNameEn)
    merged.deviceName = merged.nameZh
    merged.deviceNameEn = merged.nameEn
    this.properties = merged
  }

  setProperties(p: Partial<RemoteConsoleProps>) {
    const allowed: Partial<RemoteConsoleProps> = {}
    if (p.nameZh !== undefined) allowed.nameZh = p.nameZh
    if (p.nameEn !== undefined) allowed.nameEn = p.nameEn
    if (p.installDate !== undefined) allowed.installDate = p.installDate
    if (p.note !== undefined) allowed.note = p.note
    if (p.type !== undefined) allowed.type = p.type
    if (p.function !== undefined) allowed.function = p.function
    if (p.interfaceType !== undefined) allowed.interfaceType = p.interfaceType
    if (p.commMethod !== undefined) allowed.commMethod = p.commMethod

    super.setProperties(allowed)

    const next = { ...this.properties, ...allowed } as RemoteConsoleProps
    next.deviceName = next.nameZh
    next.deviceNameEn = next.nameEn
    this.properties = next
  }
}

class RemoteConsoleView extends RectNode {
  static extendKey = 'RemoteConsoleNode'
  getShape(): any {
    const { x, y, width, height, radius } = this.props.model
    const style = this.props.model.getNodeStyle()
    return h('g', {}, [
      h('rect', {
        x: x - width / 2, y: y - height / 2, rx: radius, ry: radius,
        width, height, fill: 'transparent', stroke: style.stroke, 'stroke-opacity': 0.0001,
      }),
      h('image', {
        href: remoteConsoleSvg,
        x: x - width / 2, y: y - height / 2,
        width, height, preserveAspectRatio: 'xMidYMid meet', 'pointer-events': 'bounding-box',
      }),
    ])
  }
}

export default { type: 'bpmn:remote-console', view: RemoteConsoleView, model: RemoteConsoleModel }
export { RemoteConsoleView, RemoteConsoleModel }
