// src/models/bpmn/nodes/CustomImageNode.ts
import { GraphModel, h, NodeConfig, RectNode, RectNodeModel } from '@logicflow/core'
import { getBpmnId } from '@logicflow/extension/es/bpmn/getBpmnId'

export interface CustomImageProps {
  width?: number
  height?: number
  image?: string
  nameZh?: string
  nameEn?: string
}

export class CustomImageModel extends RectNodeModel {
  static extendKey = 'CustomImageModel'

  declare properties: CustomImageProps

  constructor(data: NodeConfig, gm: GraphModel) {
    if (!data.id) data.id = `custom-image_${getBpmnId()}`
    super(data, gm)
  }

  initNodeData(data: any) {
    super.initNodeData(data)
    const p = (data?.properties || {}) as CustomImageProps
    this.width = Number(p.width ?? 120)
    this.height = Number(p.height ?? 84)
    this.properties = { ...p }
  }

  getNodeStyle() {
    const s = super.getNodeStyle()
    s.stroke = 'transparent'
    s.fill = '#fff'
    return s
  }
}

export class CustomImageView extends RectNode {
  static extendKey = 'CustomImageView'

  getShape() {
    const { x, y, width, height, properties } = this.props.model
    const pad = 8
    const rx = 14

    return h('g', {}, [
      h('rect', {
        x: x - width / 2,
        y: y - height / 2,
        width,
        height,
        rx,
        ry: rx,
        stroke: '#d9d9d9',
        fill: '#fff',
      }),
      properties?.image &&
      h('image', {
        x: x - width / 2 + pad,
        y: y - height / 2 + pad,
        width: Math.max(10, width - pad * 2),
        height: Math.max(10, height - pad * 2),
        href: properties.image,
        preserveAspectRatio: 'xMidYMid meet',
        'pointer-events': 'bounding-box',
      }),
      (properties?.nameZh || properties?.nameEn) &&
      h(
        'text',
        {
          x,
          y: y + height / 2 + 16,
          'text-anchor': 'middle',
          'font-size': 12,
          fill: '#555',
        },
        `${properties?.nameZh ?? ''}${properties?.nameZh && properties?.nameEn ? ' / ' : ''}${properties?.nameEn ?? ''}`,
      ),
    ])
  }
}

export default { type: 'custom:image', view: CustomImageView, model: CustomImageModel }
