import type { BaseNodeModel, VNode } from '@logicflow/core'
// src/models/bpmn/value-peek.ts
// 给节点加：右上角“i”按钮 + 下方展示气泡（✅ 点按开关）
// 使用 LogicFlow 的 h（改名 lfH）避免与 Vue 的 h 冲突
import { h as lfH } from '@logicflow/core'
import { sampleDisplayByType } from './sample-display'

// 兼容不同形状：从 model 上读 width/height/r
function getSize(model: any) {
  const w = model.width ?? (model.r ? model.r * 2 : 34)
  const h = model.height ?? (model.r ? model.r * 2 : 34)
  return { w, h }
}

/** Model 装饰：注入 + 放行 __peekOn / __peekText（绕过子类 setProperties 白名单） */
export function withValuePeekModel<T extends new (...args: any[]) => BaseNodeModel>(BaseModel: T) {
  return class ValuePeekModel extends BaseModel {
    setAttributes(): void {
      // @ts-expect-error: call optional super implementation
      super.setAttributes?.()
      const t = (this as any).type as string
      const props = (this as any).properties || ((this as any).properties = {})
      if (props.__peekText == null)
        props.__peekText = sampleDisplayByType[t] ?? '—'
      if (props.__peekOn == null)
        props.__peekOn = false
    }

    /** ★ 关键：无论子类怎样过滤 setProperties，都强行保留 peek 字段 */
    setProperties(next: Record<string, any>) {
      const hasPeekOn = Object.prototype.hasOwnProperty.call(next, '__peekOn')
      const hasPeekTxt = Object.prototype.hasOwnProperty.call(next, '__peekText')
      const peek = {
        __peekOn: hasPeekOn ? next.__peekOn : undefined,
        __peekText: hasPeekTxt ? next.__peekText : undefined,
      }

      // 去掉 peek 字段再交给原实现（避免被白名单丢弃时报错）
      const rest = { ...next }
      delete (rest as any).__peekOn
      delete (rest as any).__peekText

      // @ts-expect-error: delegate to base setProperties which may be loosely typed
      super.setProperties?.(rest)

      // 再把 peek 字段直接写回 properties（绕过白名单）
      const props = (this as any).properties || ((this as any).properties = {})
      if (hasPeekOn)
        props.__peekOn = peek.__peekOn
      if (hasPeekTxt)
        props.__peekText = peek.__peekText
    }
  }
}

/** View 装饰：右上角按钮 + 下方气泡（点按开关） */
export function withValuePeekView<T extends new (...args: any[]) => any>(BaseView: T) {
  return class ValuePeekView extends (BaseView as any) {
    private renderPeekButton(model: BaseNodeModel): VNode {
      const { x, y } = model
      const { w, h } = getSize(model as any)
      const btn = 18
      const bx = x + (w / 2) - (btn / 2)
      const by = y - (h / 2) + (btn / 2)

      const toggle = (ev: MouseEvent) => {
        ev.stopPropagation()
        ev.preventDefault()
        const props = model.getProperties()
        const on = !props.__peekOn
        // 确保打开时有展示文本（若不存在则用 sampleDisplayByType 的示例）
        const text = props.__peekText ?? (sampleDisplayByType as any)[(model as any).type] ?? '—'
        model.setProperties({ __peekOn: on, __peekText: text }) // ← 现在一定生效（装饰器保驾护航）
        // 尝试触发图模型的重渲染（若可用）
        const gm = (this as any).props.graphModel
        gm?.selectElementById?.((model as any).id)
      }

      // 父组不吃事件；只有圆形按钮可点（✅ 仅用 onClick）
      return lfH('g', { 'pointer-events': 'none' }, [
        lfH('circle', {
          'cx': bx,
          'cy': by,
          'r': btn / 2,
          'fill': '#fff',
          'stroke': '#555',
          'stroke-width': 1.2,
          'cursor': 'pointer',
          'pointer-events': 'all',
          'onClick': toggle, // ← 只用 click，杜绝“长按才触发”
        }),
        lfH('text', {
          'x': bx,
          'y': by + 4,
          'text-anchor': 'middle',
          'font-size': 12,
          'font-weight': 'bold',
          'fill': '#555',
          'pointer-events': 'none',
        }, 'i'),
      ])
    }

    private renderPeekBubble(model: BaseNodeModel): VNode | null {
      const props = model.getProperties()
      if (!props.__peekOn) {
        return null
      }

      const text = String(props.__peekText ?? '—')
      const { x, y } = model
      const size = getSize(model as any)
      const ty = y + (size.h / 2) + 12

      // 只渲染纯文本（无气泡背景），并禁用指针事件以免影响画布交互
      return lfH('g', { 'pointer-events': 'none' }, [
        lfH('text', {
          'x': x,
          'y': ty,
          'text-anchor': 'middle',
          'font-size': 12,
          'fill': '#222',
          'pointer-events': 'none',
        }, text),
      ])
    }

    getShape() {
      // @ts-expect-error: super.getShape may be defined in runtime view class
      const group = super.getShape() // 原始节点（保持可点）
      const model: BaseNodeModel = (this as any).props.model
      try {
        const btn = this.renderPeekButton(model)
        const bubble = this.renderPeekBubble(model)
        // ⚠️ 不要给外层 <g> 禁用事件
        return lfH('g', {}, [group, btn, bubble])
      }
      catch (e) {
        console.warn('[value-peek] render fallback:', e)
        return group
      }
    }
  }
}

/** 把节点定义打包成“可 peek”版本 */
export function wrapNodeWithValuePeek(nodeDef: { type: string, model: any, view: any }) {
  return {
    ...nodeDef,
    model: withValuePeekModel(nodeDef.model),
    view: withValuePeekView(nodeDef.view),
  }
}
