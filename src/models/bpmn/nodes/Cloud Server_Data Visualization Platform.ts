import { GraphModel, h, NodeConfig, RectNode, RectNodeModel } from '@logicflow/core'
import { getBpmnId } from '@logicflow/extension/es/bpmn/getBpmnId'

import dataVisualizationPlatformSvg from '@/assets/icons/Cloud Server_Data Visualization Platform.svg'
import { baseFields, cloudFields, type FieldSchema } from '@/models/bpmn/schemas/commonSchema'

interface DataVisualizationPlatformProps {
  deviceName: string
  deviceNameEn: string
  installDate: string
  note: string
  type: string
  function: string
  interfaceType: string
  commMethod: string
}

class DataVisualizationPlatformModel extends RectNodeModel {
  static extendKey = 'DataVisualizationPlatformModel'

  // ✅ 在这里加入备注框
  static formSchema: FieldSchema[] = [
  ...baseFields.filter(f => f.key !== 'productModel'),
  ...cloudFields.filter(f => f.key !== 'installDate' && f.key !== 'productModel'),
  { key: 'note', label: '备注', type: 'textarea', placeholder: '请输入备注信息' }
]


  constructor(data: NodeConfig, gm: GraphModel) {
    if (!data.id) data.id = `DataVisualizationPlatform_${getBpmnId()}`
    super(data, gm)
    this.width = this.width || 96
    this.height = this.height || 56
    if (this.text) this.text.editable = true
  }

  initNodeData(data: any) {
    super.initNodeData(data)
    const defaults: DataVisualizationPlatformProps = {
      deviceName: '数据可视化平台',
      deviceNameEn: 'Data Visualization Platform',
      installDate: '2024-05-12',
      note: '',
      type: 'Grafana 10',
      function: '数据展示',
      interfaceType: 'API',
      commMethod: 'Web'
    }
    this.properties = { ...defaults, ...(data.properties || {}) }
  }
}

class DataVisualizationPlatformView extends RectNode {
  static extendKey = 'DataVisualizationPlatformNode'

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
        'stroke-opacity': 0.0001
      }),
      h('image', {
        href: dataVisualizationPlatformSvg,
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

const CloudServer_DataVisualizationPlatform = {
  type: 'bpmn:data-visualization-platform',
  view: DataVisualizationPlatformView,
  model: DataVisualizationPlatformModel,
}

export { DataVisualizationPlatformView, DataVisualizationPlatformModel }
export default CloudServer_DataVisualizationPlatform
