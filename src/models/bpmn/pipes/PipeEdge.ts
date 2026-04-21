import { h, PolylineEdge, PolylineEdgeModel, Model, LogicFlow } from '@logicflow/core'
import type { PipeTypes } from './pipe-types'
import { PIPE_TEXTURES } from './pipe-types'

function segmentAngle(p1: { x: number, y: number }, p2: { x: number, y: number }) {
  return Math.atan2(p2.y - p1.y, p2.x - p1.x) * 180 / Math.PI
}

let gid = 0
function uid(prefix = 'pipe') {
  gid += 1
  return `${prefix}-${Date.now().toString(36)}-${gid}`
}

export class PipeEdgeModel extends PolylineEdgeModel {
  pipeType: PipeTypes = 'Connection_Galvanized Steel Pipe'
  pipeWidth = 12

  constructor(data: Model, lf: LogicFlow) {
    super(data, lf)
    this.sourceAnchorStyles = { fill: 'transparent', stroke: 'transparent' }
    this.targetAnchorStyles = { fill: 'transparent', stroke: 'transparent' }

    const d = (data?.properties ?? {}) as any
    if (d.pipeType)
      this.pipeType = d.pipeType as PipeTypes

    if (typeof d.pipeWidth === 'number') {
      this.pipeWidth = d.pipeWidth
      this.strokeWidth = d.pipeWidth
    }

    this.properties ||= {}
    this.properties.pipeType ??= this.pipeType
    this.properties.pipeWidth ??= this.pipeWidth
    this.properties.note ??= ''
  }

  setProperties(next: Record<string, any>) {
    super.setProperties(next)

    const current = this.properties || {}
    const nextType = (next?.pipeType ?? current.pipeType) as PipeTypes
    if (nextType && PIPE_TEXTURES[nextType])
      this.pipeType = nextType

    const widthVal = Number(next?.pipeWidth ?? current.pipeWidth)
    if (Number.isFinite(widthVal) && widthVal > 0) {
      this.pipeWidth = widthVal
      this.strokeWidth = widthVal
    }

    this.properties ||= {}
    this.properties.pipeType = this.pipeType
    this.properties.pipeWidth = this.pipeWidth
    this.properties.note ??= ''
  }

  getEdgeStyle() {
    return { stroke: 'transparent', fill: 'transparent' }
  }

  getArrowStyle() {
    return { stroke: 'transparent', fill: 'transparent' }
  }
}

export class PipeEdge extends PolylineEdge {
  private _mounted = false

  componentDidMount() {
    this._mounted = true
    ;(this as any).rerender?.()
  }

  private getLFModel(): PipeEdgeModel | null {
    const anyThis = this as any
    return (anyThis.model ?? anyThis.props?.model) as PipeEdgeModel || null
  }

  getArrow() {
    return null
  }

  getShape() {
    if (!this._mounted)
      return super.getShape()

    const model = this.getLFModel()
    if (!model)
      return super.getShape()

    const points = (model as any).pointsList as Array<{ x: number, y: number }> | undefined
    if (!Array.isArray(points) || points.length < 2) {
      requestAnimationFrame(() => (this as any).rerender?.())
      return super.getShape()
    }

    const width = Number((model as any).pipeWidth ?? 12)
    const pipeType = ((model as any).pipeType || 'Connection_Galvanized Steel Pipe') as PipeTypes
    const textureHref = PIPE_TEXTURES[pipeType] || PIPE_TEXTURES['Connection_Galvanized Steel Pipe']

    const patterns: any[] = []
    const segments: any[] = []
    const joints: any[] = []
    const lastSegIndex = points.length - 2

    for (let i = 0; i <= lastSegIndex; i++) {
      const p1 = points[i]
      const p2 = points[i + 1]
      const len = Math.hypot(p2.x - p1.x, p2.y - p1.y)
      const ang = segmentAngle(p1, p2)
      const isFirst = i === 0
      const isLast = i === lastSegIndex

      // Slight overlap between adjacent segments to avoid seams at corners.
      const overlap = Math.min(Math.max(width * 0.35, 1), len * 0.28)
      const pre = isFirst ? Math.min(overlap, len * 0.2) : overlap
      const post = isLast ? Math.min(overlap, len * 0.2) : overlap
      const drawLen = Math.max(1, len + pre + post)

      const patId = uid('pat')
      patterns.push(
        h('pattern', { id: patId, patternUnits: 'userSpaceOnUse', width: drawLen, height: width }, [
          h('image', {
            href: textureHref,
            x: 0,
            y: 0,
            width: drawLen,
            height: width,
            preserveAspectRatio: 'none',
          }),
        ]),
      )

      segments.push(
        h('rect', {
          x: -pre,
          y: 0,
          width: drawLen,
          height: width,
          rx: width / 2,
          ry: width / 2,
          fill: `url(#${patId})`,
          transform: `rotate(${ang} ${p1.x} ${p1.y}) translate(${p1.x} ${p1.y - width / 2})`,
          'shape-rendering': 'geometricPrecision',
        }),
      )

      if (!isLast) {
        const joint = points[i + 1]
        joints.push(
          h('circle', {
            cx: joint.x,
            cy: joint.y,
            r: Math.max(1, width * 0.52),
            fill: `url(#${patId})`,
            opacity: 0.98,
          }),
        )
      }
    }

    return h('g', {}, [h('defs', {}, patterns), ...segments, ...joints])
  }
}
