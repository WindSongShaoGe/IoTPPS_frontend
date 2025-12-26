import { GraphModel, h, NodeConfig, RectNode, RectNodeModel } from '@logicflow/core'
import { getBpmnId } from '@logicflow/extension/es/bpmn/getBpmnId'

import waterPipelineSvg from '@/assets/icons/Mechatronic Devices_Water Pipeline.svg'
import type { FieldSchema } from '@/models/bpmn/schemas/commonSchema'

// —— 水管道属性接口 —— //
interface PipelineProps {
  deviceName: string
  deviceNameEn: string
  productModel: string
  installDate: string
  note: string

  controlParam: string
  unit: string
  range: string
  powerSupply: string
  setpoint: number | null     // ✅ 新增设定值字段
}

class WaterPipelineModel extends RectNodeModel {
  static extendKey = 'WaterPipelineModel'

  // ✅ 手动声明 schema，新增设定值框
  static formSchema: FieldSchema[] = [
    { key: 'productModel', label: '产品型号', type: 'text' },
    { key: 'installDate', label: '安装日期', type: 'date' },
    { key: 'controlParam', label: '参数', type: 'text' },
    { key: 'unit', label: '单位', type: 'text' },
    { key: 'range', label: '设定范围', type: 'text' },
    { key: 'powerSupply', label: '供电方式', type: 'text' },
    { key: 'setpoint', label: '设定值 (mm)', type: 'number', step: 1 }, // ✅ 新增输入框
    { key: 'note', label: '备注', type: 'textarea', placeholder: '请输入备注信息'  },
  ]

  constructor(data: NodeConfig, graphModel: GraphModel) {
    if (!data.id) data.id = `WaterPipeline_${getBpmnId()}`
    super(data, graphModel)

    this.width = this.width || 96
    this.height = this.height || 56
    if (this.text) this.text.editable = true
  }

  initNodeData(data: any) {
    super.initNodeData(data)
    const defaults: PipelineProps = {
      deviceName: '水管道',
      deviceNameEn: 'Pipeline',
      productModel: 'DN32不锈钢',
      installDate: '2024-05-12',
      note: '',
      controlParam: '直径',
      unit: 'mm',
      range: '固定', // 固定显示
      powerSupply: '无',
      setpoint: 32
    }
    this.properties = { ...defaults, ...(data.properties || {}) }
  }

  // ✅ 拦截修改，防止 range 被改掉
  setProperties(properties: Partial<PipelineProps>) {
    if (properties.range) {
      properties.range = '无'
    }
    super.setProperties(properties)
  }
}

class WaterPipelineView extends RectNode {
  static extendKey = 'WaterPipelineNode'

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
        href: waterPipelineSvg,
        x: x - width / 2,
        y: y - height / 2,
        width, height,
        preserveAspectRatio: 'xMidYMid meet',
        'pointer-events': 'bounding-box'
      })
    ])
  }
}

const MechatronicDevices_WaterPipeline = {
  type: 'bpmn:water-pipeline',
  view: WaterPipelineView,
  model: WaterPipelineModel,
}

export { WaterPipelineView, WaterPipelineModel }
export default MechatronicDevices_WaterPipeline
