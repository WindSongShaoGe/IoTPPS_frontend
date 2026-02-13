// src/models/bpmn/value-peek.ts
import type { BaseNodeModel, VNode } from '@logicflow/core'
import { h as lfH } from '@logicflow/core'
import { sampleDisplayByType } from './sample-display'
import { acquireRealtime, releaseRealtime } from './realtime-poller'

// 兼容不同形状：从 model 上读 width/height/r
function getSize(model: any) {
  const w = model.width ?? (model.r ? model.r * 2 : 34)
  const h = model.height ?? (model.r ? model.r * 2 : 34)
  return { w, h }
}

/** Model 装饰：注入 + 放行 __peekOn / __peekText / __peekUpdatedAt / __peekCursor */
export function withValuePeekModel<T extends new (...args: any[]) => BaseNodeModel>(BaseModel: T) {
  return class ValuePeekModel extends BaseModel {
    setAttributes(): void {
      // @ts-expect-error
      super.setAttributes?.()
      const t = (this as any).type as string
      const props = (this as any).properties || ((this as any).properties = {})

      if (props.__peekText == null) props.__peekText = sampleDisplayByType[t] ?? '—'
      if (props.__peekOn == null) props.__peekOn = false
      if (props.__peekUpdatedAt == null) props.__peekUpdatedAt = null
      if (props.__peekCursor == null) props.__peekCursor = null

      // （可选兼容字段）
      if (props.__rtText == null) props.__rtText = props.__peekText
      if (props.__rtUpdatedAt == null) props.__rtUpdatedAt = null
      if (props.__rtCursor == null) props.__rtCursor = null
    }

    setProperties(next: Record<string, any>) {
      const hasPeekOn = Object.prototype.hasOwnProperty.call(next, '__peekOn')
      const hasPeekTxt = Object.prototype.hasOwnProperty.call(next, '__peekText')
      const hasPeekAt = Object.prototype.hasOwnProperty.call(next, '__peekUpdatedAt')
      const hasPeekCursor = Object.prototype.hasOwnProperty.call(next, '__peekCursor')

      const peek = {
        __peekOn: hasPeekOn ? next.__peekOn : undefined,
        __peekText: hasPeekTxt ? next.__peekText : undefined,
        __peekUpdatedAt: hasPeekAt ? next.__peekUpdatedAt : undefined,
        __peekCursor: hasPeekCursor ? next.__peekCursor : undefined,
      }

      const rest = { ...next }
      delete (rest as any).__peekOn
      delete (rest as any).__peekText
      delete (rest as any).__peekUpdatedAt
      delete (rest as any).__peekCursor

      // @ts-expect-error
      super.setProperties?.(rest)

      const props = (this as any).properties || ((this as any).properties = {})
      if (hasPeekOn) props.__peekOn = peek.__peekOn
      if (hasPeekTxt) props.__peekText = peek.__peekText
      if (hasPeekAt) props.__peekUpdatedAt = peek.__peekUpdatedAt
      if (hasPeekCursor) props.__peekCursor = peek.__peekCursor
    }
  }
}

/**
 * View 装饰：右上角按钮 + 下方气泡（点按开关）
 * ✅ 泵节点自动播放：acquireRealtime(model,'auto')（不依赖气泡）
 * ✅ 气泡按钮只控制显示：__peekOn
 */
export function withValuePeekView<T extends new (...args: any[]) => any>(BaseView: T) {
  return class ValuePeekView extends (BaseView as any) {
    /** 主动通知属性面板刷新 */
    private emitPropsChanged(model: BaseNodeModel) {
      const gm = (this as any).props.graphModel
      const id = String((model as any).id)
      const payload = { data: { id, properties: model.getProperties?.() ?? (model as any).properties } }

      gm?.eventCenter?.emit?.('node:properties-change', payload)
      gm?.eventCenter?.emit?.('node:propertiesChange', payload)
      gm?.eventCenter?.emit?.('properties:change', payload)
    }

    private renderPeekButton(model: BaseNodeModel): VNode {
      const { x, y } = model
      const { w, h } = getSize(model as any)
      const btn = 18
      const bx = x + w / 2 - btn / 2
      const by = y - h / 2 + btn / 2

      const toggle = (ev: MouseEvent) => {
        ev.stopPropagation()
        ev.preventDefault()

        const props = model.getProperties()
        const on = !props.__peekOn
        const id = String((model as any).id)

        if (on) {
          // ✅ 只开显示，不重置 cursor
          model.setProperties({ __peekOn: true })
          this.emitPropsChanged(model)
          acquireRealtime(model, 'bubble')
        } else {
          model.setProperties({ __peekOn: false })
          this.emitPropsChanged(model)
          releaseRealtime(id, 'bubble')
        }

        const gm = (this as any).props.graphModel
        gm?.selectElementById?.((model as any).id)
      }

      return lfH('g', { 'pointer-events': 'none' }, [
        lfH('circle', {
          cx: bx,
          cy: by,
          r: btn / 2,
          fill: '#fff',
          stroke: '#555',
          'stroke-width': 1.2,
          cursor: 'pointer',
          'pointer-events': 'all',
          onClick: toggle,
        }),
        lfH(
          'text',
          {
            x: bx,
            y: by + 4,
            'text-anchor': 'middle',
            'font-size': 12,
            'font-weight': 'bold',
            fill: '#555',
            'pointer-events': 'none',
          },
          'i'
        ),
      ])
    }

    private renderPeekBubble(model: BaseNodeModel): VNode | null {
      const props = model.getProperties()
      if (!props.__peekOn) return null

      const text = String(props.__peekText ?? '—')
      const { x, y } = model
      const size = getSize(model as any)
      const ty = y + size.h / 2 + 12

      return lfH('g', { 'pointer-events': 'none' }, [
        lfH(
          'text',
          {
            x,
            y: ty,
            'text-anchor': 'middle',
            'font-size': 12,
            fill: '#222',
            'pointer-events': 'none',
          },
          text
        ),
      ])
    }

    getShape() {
      // @ts-expect-error
      const group = super.getShape()
      const model: BaseNodeModel = (this as any).props.model

      try {
        const props = model.getProperties()
        const id = String((model as any).id)
        const type = String((model as any).type ?? '')

        // ✅ 关键：泵节点自动播放（页面一进来就开始读）
        if (type === 'bpmn:pump') {
          acquireRealtime(model, 'auto')
        } else {
          releaseRealtime(id, 'auto')
        }

        // ✅ 气泡按钮只控制显示（但开着时也给 bubble owner 一份）
        if (props.__peekOn) acquireRealtime(model, 'bubble')
        else releaseRealtime(id, 'bubble')

        const btn = this.renderPeekButton(model)
        const bubble = this.renderPeekBubble(model)
        return lfH('g', {}, [group, btn, bubble])
      } catch (e) {
        console.warn('[value-peek] render fallback:', e)
        return group
      }
    }

    // 节点销毁时清理（防“幽灵轮询”👻）
    destroy() {
      const model: BaseNodeModel = (this as any).props.model
      const id = String((model as any).id)

      releaseRealtime(id, 'bubble')
      releaseRealtime(id, 'auto')

      // @ts-expect-error
      super.destroy?.()
    }
  }
}

/** 把节点定义打包成“可 peek”版本 */
export function wrapNodeWithValuePeek(nodeDef: { type: string; model: any; view: any }) {
  return {
    ...nodeDef,
    model: withValuePeekModel(nodeDef.model),
    view: withValuePeekView(nodeDef.view),
  }
}
