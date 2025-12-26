import { GraphModel, h, NodeConfig, RectNode, RectNodeModel } from '@logicflow/core'
import { getBpmnId } from '@logicflow/extension/es/bpmn/getBpmnId'

import remoteConsoleSvg from '@/assets/icons/Cloud Server_Remote Console.svg'
import { baseFields, cloudFields, type FieldSchema } from '@/models/bpmn/schemas/commonSchema'

interface RemoteConsoleProps {
  deviceName: string;
  deviceNameEn: string;
  productModel: string;
  installDate: string;
  note: string;
  type: string;
  function: string;
  interfaceType: string;
  commMethod: string;
}

class RemoteConsoleModel extends RectNodeModel {
  static extendKey = 'RemoteConsoleModel'
  static formSchema: FieldSchema[] = [
  ...baseFields.filter(f => f.key !== 'productModel'),
  ...cloudFields.filter(f => f.key !== 'installDate' && f.key !== 'productModel'),
  { key: 'note', label: '备注', type: 'textarea', placeholder: '请输入备注信息' }
]


  constructor(data: NodeConfig, gm: GraphModel) {
    if (!data.id) data.id = `RemoteConsole_${getBpmnId()}`
    super(data, gm)
    this.width = this.width || 96
    this.height = this.height || 56
    if (this.text) this.text.editable = true
  }

  initNodeData(data: any) {
    super.initNodeData(data)
    const defaults: RemoteConsoleProps = {
      deviceName: '远程控制台',
      deviceNameEn: 'Remote Console',
      productModel: '',
      installDate: '2024-05-12',
      note: '',
      type: 'Web HMI',
      function: '远程监控',
      interfaceType: 'API',
      commMethod: 'Web'
    }
    this.properties = { ...defaults, ...(data.properties || {}) }
  }
}

class RemoteConsoleView extends RectNode {
  static extendKey = 'RemoteConsoleNode'
  getShape(): any {
    const { x, y, width, height, radius } = this.props.model
    const style = this.props.model.getNodeStyle()
    return h('g', {}, [
      h('rect', { x: x - width / 2, y: y - height / 2, rx: radius, ry: radius, width, height, fill: 'transparent', stroke: style.stroke, 'stroke-opacity': 0.0001 }),
      h('image', { href: remoteConsoleSvg, x: x - width / 2, y: y - height / 2, width, height, preserveAspectRatio: 'xMidYMid meet', 'pointer-events': 'bounding-box' })
    ])
  }
}

const CloudServer_RemoteConsole = {
  type: 'bpmn:remote-console',
  view: RemoteConsoleView,
  model: RemoteConsoleModel,
}

export { RemoteConsoleView, RemoteConsoleModel }
export default CloudServer_RemoteConsole
