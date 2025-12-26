import { GraphModel, h, NodeConfig, RectNode, RectNodeModel } from '@logicflow/core'
import { getBpmnId } from '@logicflow/extension/es/bpmn/getBpmnId'

import intelligentAnalyticsModuleSvg from '@/assets/icons/Cloud Server_Intelligent Analytics Module.svg'
import { baseFields, cloudFields, type FieldSchema } from '@/models/bpmn/schemas/commonSchema'

interface IntelligentAnalyticsModuleProps {
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

class IntelligentAnalyticsModuleModel extends RectNodeModel {
  static extendKey = 'IntelligentAnalyticsModuleModel'
  static formSchema: FieldSchema[] = [
  ...baseFields.filter(f => f.key !== 'productModel'),
  ...cloudFields.filter(f => f.key !== 'installDate' && f.key !== 'productModel'),
  { key: 'note', label: '备注', type: 'textarea', placeholder: '请输入备注信息' }
]


  constructor(data: NodeConfig, gm: GraphModel) {
    if (!data.id) data.id = `IntelligentAnalyticsModule_${getBpmnId()}`
    super(data, gm)
    this.width = this.width || 96
    this.height = this.height || 56
    if (this.text) this.text.editable = true
  }

  initNodeData(data: any) {
    super.initNodeData(data)
    const defaults: IntelligentAnalyticsModuleProps = {
      deviceName: '智能分析模块',
      deviceNameEn: 'Intelligent Analytics Module',
      productModel: '',
      installDate: '2024-05-12',
      note: '',
      type: 'Python ML',
      function: '数据分析',
      interfaceType: 'API',
      commMethod: 'Web'
    }
    this.properties = { ...defaults, ...(data.properties || {}) }
  }
}

class IntelligentAnalyticsModuleView extends RectNode {
  static extendKey = 'IntelligentAnalyticsModuleNode'
  getShape(): any {
    const { x, y, width, height, radius } = this.props.model
    const style = this.props.model.getNodeStyle()
    return h('g', {}, [
      h('rect', { x: x - width / 2, y: y - height / 2, rx: radius, ry: radius, width, height, fill: 'transparent', stroke: style.stroke, 'stroke-opacity': 0.0001 }),
      h('image', { href: intelligentAnalyticsModuleSvg, x: x - width / 2, y: y - height / 2, width, height, preserveAspectRatio: 'xMidYMid meet', 'pointer-events': 'bounding-box' })
    ])
  }
}

const CloudServer_IntelligentAnalyticsModule = {
  type: 'bpmn:intelligent-analytics-module',
  view: IntelligentAnalyticsModuleView,
  model: IntelligentAnalyticsModuleModel,
}

export { IntelligentAnalyticsModuleView, IntelligentAnalyticsModuleModel }
export default CloudServer_IntelligentAnalyticsModule
