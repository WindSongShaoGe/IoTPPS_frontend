import { RectNode, RectNodeModel, h } from '@logicflow/core'

export class CustomImageModel extends RectNodeModel {
  initNodeData(data: any) {
    super.initNodeData(data)
    const p = data?.properties || {}
    this.width  = Number(p.width  ?? 120)
    this.height = Number(p.height ?? 84)
  }
  getNodeStyle() {
    const s = super.getNodeStyle()
    s.stroke = 'transparent'
    s.fill = '#fff'
    return s
  }
}

export class CustomImageView extends RectNode {
  getShape() {
    const { x, y, width, height, properties } = this.props.model
    const pad = 8, rx = 14
    return h('g', {}, [
      h('rect', { x: x - width/2, y: y - height/2, width, height, rx, ry: rx, stroke:'#d9d9d9', fill:'#fff' }),
      properties?.image && h('image', {
        x: x - width/2 + pad, y: y - height/2 + pad,
        width: Math.max(10, width - pad*2), height: Math.max(10, height - pad*2),
        href: properties.image, preserveAspectRatio:'xMidYMid meet'
      }),
      (properties?.nameZh || properties?.nameEn) && h('text', {
        x, y: y + height/2 + 16, 'text-anchor':'middle', 'font-size':12, fill:'#555'
      }, `${properties?.nameZh ?? ''}${properties?.nameZh && properties?.nameEn ? ' / ' : ''}${properties?.nameEn ?? ''}`)
    ])
  }
}

export default { type: 'custom:image', view: CustomImageView, model: CustomImageModel }
