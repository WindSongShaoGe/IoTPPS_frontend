import { h, PolylineEdge, PolylineEdgeModel, Model, LogicFlow } from '@logicflow/core'
import type { PipeTypes } from './pipe-types'
import { PIPE_TEXTURES } from './pipe-types'

// === 工具函数 ===
function segmentAngle(p1:{x:number,y:number}, p2:{x:number,y:number}) {
  return Math.atan2(p2.y - p1.y, p2.x - p1.x) * 180 / Math.PI
}
let gid = 0
function uid(prefix='pipe'){ gid+=1; return `${prefix}-${Date.now().toString(36)}-${gid}` }

// === Model 层 ===
export class PipeEdgeModel extends PolylineEdgeModel {
  pipeType: PipeTypes = 'Connection_Galvanized Steel Pipe'
  pipeWidth = 12

  constructor(data: Model, lf: LogicFlow) {
    super(data, lf)
    this.sourceAnchorStyles = { fill: 'transparent', stroke: 'transparent' }
    this.targetAnchorStyles = { fill: 'transparent', stroke: 'transparent' }

    const d = (data?.properties ?? {}) as any
    if (d.pipeType) this.pipeType = d.pipeType
    if (typeof d.pipeWidth === 'number') {
      this.pipeWidth = d.pipeWidth
      this.strokeWidth = d.pipeWidth
    }

    this.properties ||= {}
    this.properties.pipeType ??= this.pipeType
    this.properties.pipeWidth ??= this.pipeWidth
  }

  getEdgeStyle() { return { stroke: 'transparent', fill: 'transparent' } }
  getArrowStyle() { return { stroke: 'transparent', fill: 'transparent' } }
}

// === View 层 ===
export class PipeEdge extends PolylineEdge {
  private _mounted = false

  componentDidMount() {
    this._mounted = true
    ;(this as any).rerender?.() // 首次挂载后刷新一次
  }

  private getLFModel(): PipeEdgeModel | null {
    const anyThis = this as any
    return (anyThis.model ?? anyThis.props?.model) as PipeEdgeModel || null
  }

  getArrow() { return null }

  getShape() {
    if (!this._mounted) return super.getShape()

    const model = this.getLFModel()
    if (!model) return super.getShape()

    const points = (model as any).pointsList as Array<{x:number,y:number}> | undefined
    if (!Array.isArray(points) || points.length < 2) {
      // ✅ 最关键的一句：如果数据未就绪，下一帧强制刷新
      requestAnimationFrame(() => (this as any).rerender?.())
      return super.getShape()
    }

    const width = (model as any).pipeWidth as number
    const pipeType = (model as any).pipeType as PipeTypes
    const textureHref = PIPE_TEXTURES[pipeType]

    const patterns: any[] = []
    const segments: any[] = []

    for (let i = 0; i < points.length - 1; i++) {
      const p1 = points[i]
      const p2 = points[i + 1]
      const len = Math.hypot(p2.x - p1.x, p2.y - p1.y)
      const ang = segmentAngle(p1, p2)

      const patId = uid('pat')
      patterns.push(
        h('pattern',
          { id: patId, patternUnits: 'userSpaceOnUse', width: len, height: width },
          [h('image', { href: textureHref, x: 0, y: 0, width: len, height: width, preserveAspectRatio: 'none' })]
        )
      )

      segments.push(
        h('rect', {
          width: len, height: width, rx: width / 2, ry: width / 2,
          fill: `url(#${patId})`,
          transform: `rotate(${ang} ${p1.x} ${p1.y}) translate(${p1.x} ${p1.y - width / 2})`,
        })
      )

      if (i < points.length - 2) {
        const joint = points[i + 1]
        const capLen = width * 1.15
        const capId = uid('cap')

        patterns.push(
          h('pattern',
            {
              id: capId,
              patternUnits: 'userSpaceOnUse',
              width: capLen,
              height: width,
              patternTransform: `rotate(${ang} ${joint.x} ${joint.y}) translate(${joint.x - capLen/2} ${joint.y - width/2})`
            },
            [h('image', { href: textureHref, x: 0, y: 0, width: capLen, height: width, preserveAspectRatio: 'none' })]
          )
        )

        segments.push(
          h('rect', {
            x: joint.x - capLen / 2,
            y: joint.y - width / 2,
            width: capLen,
            height: width,
            rx: width / 2,
            ry: width / 2,
            fill: `url(#${capId})`,
            transform: `rotate(${ang} ${joint.x} ${joint.y})`,
            opacity: 0.98,
          })
        )
      }
    }

    return h('g', {}, [ h('defs', {}, patterns), ...segments ])
  }
}
