// src/models/bpmn/value-peek.ts
import type { BaseNodeModel, VNode } from '@logicflow/core'
import { h as lfH } from '@logicflow/core'
import axios from 'axios'
import { sampleDisplayByType } from './sample-display'
import { normalizeType } from './type-compat'

// 兼容不同形状：从 model 上读 width/height/r
function getSize(model: any) {
  const w = model.width ?? (model.r ? model.r * 2 : 34)
  const h = model.height ?? (model.r ? model.r * 2 : 34)
  return { w, h }
}

/** 从 valueText 解析：参数名 / 数值 / 单位
 * 例：流量：3.42 m³/h（来自数据库 #42）
 */
function parseValueText(valueText: string) {
  const text = String(valueText ?? '').trim()
  // 允许中英文冒号
  const m = text.match(/^(.+?)[：:]\s*([+-]?\d+(?:\.\d+)?)\s*([^\s（()]+)?/)

  if (!m) return { param: '', value: null as number | null, unit: '' }

  const param = (m[1] ?? '').trim()
  const value = Number(m[2])
  const unit = (m[3] ?? '').trim()

  return {
    param,
    value: Number.isFinite(value) ? value : null,
    unit,
  }
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

/** View 装饰：右上角按钮 + 下方气泡（点按开关），并支持每秒 next */
export function withValuePeekView<T extends new (...args: any[]) => any>(BaseView: T) {
  return class ValuePeekView extends (BaseView as any) {
    private __timer: any = null

    /** 主动通知属性面板刷新：把事件“敲锣打鼓”送出去 */
    private emitPropsChanged(model: BaseNodeModel) {
      const gm = (this as any).props.graphModel
      const id = String((model as any).id)

      const payload = { data: { id, properties: model.getProperties?.() ?? (model as any).properties } }

      // 你面板监听了这几个：我们全发一遍，确保命中 ✅
      gm?.eventCenter?.emit?.('node:properties-change', payload)
      gm?.eventCenter?.emit?.('node:propertiesChange', payload)
      gm?.eventCenter?.emit?.('properties:change', payload)
    }

    /** 拉取下一条 realtime（顺序播报用） */
    private async fetchRealtimeNext(model: BaseNodeModel) {
      const nodeType = normalizeType((model as any).type)
      const cursor = model.getProperties()?.__peekCursor ?? null

      const url = '/api/realtime/next'
      const resp = await axios.get(url, { params: { nodeType, cursor } })
      const data = resp?.data?.data ?? resp?.data

      return {
        valueText: data?.valueText ?? '（无数据）',
        updatedAt: data?.updatedAt ?? null,
        cursor: data?.cursor ?? null,
      }
    }

    /** 把 realtime 写进 “气泡 + 右侧字段” */
    private applyRealtime(model: BaseNodeModel, rt: { valueText: string; updatedAt: any; cursor: any }) {
      const props = model.getProperties()

      const parsed = parseValueText(rt.valueText)

      // ✅ 只改你 schema 里存在的 key：param / unit / setpoint
      // param/unit 如果你想固定不动，也可以不写；但写了更稳（首次也能自动填上）
      const patch: Record<string, any> = {
        __peekText: rt.valueText,
        __peekUpdatedAt: rt.updatedAt,
        __peekCursor: rt.cursor,
        __peekOn: true,
      }

      if (parsed.param) patch.param = parsed.param
      if (parsed.unit) patch.unit = parsed.unit

      // 设定值 key 是 setpoint（你控制台已经证实）
      if (parsed.value != null) patch.setpoint = parsed.value

      model.setProperties(patch)
      this.emitPropsChanged(model)
    }

    private startPoll(model: BaseNodeModel) {
      this.stopPoll()

      // 先立刻来一发，不等 1s（更像“点了就有反应”✨）
      this.fetchRealtimeNext(model)
        .then((rt) => this.applyRealtime(model, rt))
        .catch((e) => {
          console.warn('[value-peek] fetch next failed:', e)
          model.setProperties({ __peekText: '（请求 realtime 失败）', __peekUpdatedAt: null, __peekOn: true })
          this.emitPropsChanged(model)
        })

      this.__timer = window.setInterval(async () => {
        try {
          const rt = await this.fetchRealtimeNext(model)
          this.applyRealtime(model, rt)
        } catch (e) {
          console.warn('[value-peek] poll failed:', e)
        }
      }, 1000)
    }

    private stopPoll() {
      if (this.__timer) {
        clearInterval(this.__timer)
        this.__timer = null
      }
    }

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

        model.setProperties({ __peekOn: on })
        this.emitPropsChanged(model)

        if (on) {
          this.startPoll(model)
        } else {
          this.stopPoll()
        }

        // 选中节点（可选）
        const gm = (this as any).props.graphModel
        gm?.selectElementById?.((model as any).id)
      }

      return lfH('g', { 'pointer-events': 'none' }, [
        lfH('circle', {
          cx: bx, cy: by, r: btn / 2,
          fill: '#fff', stroke: '#555', 'stroke-width': 1.2,
          cursor: 'pointer',
          'pointer-events': 'all',
          onClick: toggle,
        }),
        lfH('text', {
          x: bx, y: by + 4,
          'text-anchor': 'middle',
          'font-size': 12,
          'font-weight': 'bold',
          fill: '#555',
          'pointer-events': 'none',
        }, 'i'),
      ])
    }

    private renderPeekBubble(model: BaseNodeModel): VNode | null {
      const props = model.getProperties()
      if (!props.__peekOn) return null

      const text = String(props.__peekText ?? '—')
      const { x, y } = model
      const size = getSize(model as any)
      const ty = y + (size.h / 2) + 12

      return lfH('g', { 'pointer-events': 'none' }, [
        lfH('text', {
          x, y: ty,
          'text-anchor': 'middle',
          'font-size': 12,
          fill: '#222',
          'pointer-events': 'none',
        }, text),
      ])
    }

    getShape() {
      // @ts-expect-error
      const group = super.getShape()
      const model: BaseNodeModel = (this as any).props.model
      try {
        const btn = this.renderPeekButton(model)
        const bubble = this.renderPeekBubble(model)
        return lfH('g', {}, [group, btn, bubble])
      } catch (e) {
        console.warn('[value-peek] render fallback:', e)
        return group
      }
    }

    // 节点销毁时清理定时器（防“幽灵计时器”👻）
    destroy() {
      this.stopPoll()
      // @ts-expect-error
      super.destroy?.()
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
