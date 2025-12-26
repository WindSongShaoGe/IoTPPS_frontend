<template>
  <a-layout style="height: 100%; width: 100%; margin: 0; overflow: hidden">
    <a-layout-header style="background: #fff; height: 42px; line-height: 32px; padding: 5px 10px">
      <toolbar />
    </a-layout-header>

    <a-layout-content>
      <splitpanes class="default-theme" @resized="onResize" :dbl-click-splitter="false" :push-other-panes="false">
        <!-- 中间：画布 + 自定义左侧 Palette -->
        <pane :size="propertiesPanel.collapsed ? 100 - paneSize / 100 : 100 - paneSize">
          <div
            ref="container"
            class="graph-with-leftbar"
            style="height: 100%; width: 100%; padding: 4px; box-shadow: 0 0 4px rgb(0 0 0 / 30%) inset; background: #fff">
          </div>

          <!-- 自定义 Palette（覆盖在画布左侧） -->
          <div class="palette-fixed">
            <Palette :lf="modeler.lf" :groups="groups" />
          </div>
        </pane>

        <!-- 右侧：自定义属性面板 -->
        <pane
          :size="propertiesPanel.collapsed ? paneSize / 100 : paneSize"
          v-show="!propertiesPanel.collapsed"
          style="padding: 10px; background-color: #f8f8f8; overflow: hidden auto">
          <keep-alive>
            <DynamicPropertiesPanel :lf="modeler.lf" :selectedId="selectedId" />
          </keep-alive>
        </pane>
      </splitpanes>
    </a-layout-content>
  </a-layout>
</template>

<script setup lang="ts">
import { ref, nextTick, onMounted, onBeforeUnmount, provide } from 'vue'
import DynamicPropertiesPanel from '@/components/DynamicPropertiesPanel.vue'
import Palette from '@/components/palette/Palette.vue'
import { groups } from '@/components/palette/palette-data'

import { Definition } from '@logicflow/core'
import '@logicflow/core/dist/style/index.css'
import { DndPanel, InsertNodeInPolyline, Menu, MiniMap, SelectionSelect, Snapshot } from '@logicflow/extension'
import '@logicflow/extension/lib/style/index.css'
import 'highlight.js/styles/stackoverflow-light.css'
import { PropertiesPanelConfig, useModeler } from 'logicflow-useapi'
import { addListener } from 'resize-detector'
import { Pane, Splitpanes } from 'splitpanes'
import 'splitpanes/dist/splitpanes.css'

import models, { nodeDefs } from '../models'
import propertiesPanelConfigs from '../models/propertiesPanel'
import Toolbar from './toolbar.vue'
import { PipeEdge, PipeEdgeModel } from '@/models/bpmn/pipes/PipeEdge'


/** 占位值映射 + 套壳装饰器（给节点加右上角按钮 + 下方气泡） */
import { sampleDisplayByType } from '@/models/bpmn/sample-display'
import { wrapNodeWithValuePeek } from '@/models/bpmn/value-peek'

const container = ref<HTMLElement>()
const paneSize = ref(30)
const selectedId = ref<string | null>(null)

// Model Config
const urlParams = new URLSearchParams(location.search)
const _mt = urlParams.get('modelType') || 'bpmn'
const modelType = ref(_mt)
const model = models.find(m => m.name === modelType.value) || models[0]

// 关闭默认右栏（我们用自己的）
const propertiesPanelConfig: PropertiesPanelConfig = {
  ...propertiesPanelConfigs[model.name],
  useDefault: false,
}

// Modeler
const modeler = useModeler(model, propertiesPanelConfig)
const { propertiesPanel } = modeler

function containerResize() {
  if (container.value && modeler.lf) {
    const { width, height } = container.value.getBoundingClientRect()
    modeler.lf.resize(width - 8, height - 8)
  }
}

async function onResize(e: any) {
  if (!container.value || !modeler.lf) return
  if (e[1] && e[1].size) {
    const size = e[1].size
    propertiesPanel.collapsed = size < 5
    paneSize.value = size
    await nextTick()
    containerResize()
  }
}

// provide context
provide('modeler_context', modeler)

onMounted(async () => {
  if (!container.value) return
  const options: Definition = {
    container: container.value,
    adjustEdgeStartAndEnd: true,
    edgeTextDraggable: true,
    multipleSelectKey: 'meta',
    style: { nodeText: { overflowMode: 'autoWrap' } },
    keyboard: { enabled: true },
    // 用 DndPanel 提供 dnd 能力（UI 我们隐藏）
    plugins: [DndPanel, InsertNodeInPolyline, Menu, MiniMap, SelectionSelect, Snapshot],
  }
  modeler.initLogicFlow(options)

// ✅ 注册水管连线
  modeler.lf.register({
    type: 'pipe-edge',
    view: PipeEdge,
    model: PipeEdgeModel
  })
  modeler.lf.setDefaultEdgeType('pipe-edge')

  // ✅ 强制刷新新建的 PipeEdge，让它立即从虚线变成贴图
  modeler.lf.on('edge:add', ({ data }) => {
    // 设置默认属性
    modeler.lf.setProperties(data.id, {
      pipeType: 'Connection_Galvanized Steel Pipe',
      pipeWidth: 12
    })

    // 🔁 触发一次“假移动”强制 rerender
    const edgeModel = modeler.lf.getEdgeModelById(data.id)
    if (!edgeModel) return

    const pts = edgeModel.pointsList
    if (pts && pts.length > 1) {
      const last = pts[pts.length - 1]
      last.x += 0.01 // 偏移一点点
      setTimeout(() => {
        last.x -= 0.01 // 再移回来
        edgeModel.setPoints(pts) // ✅ 关键：触发刷新
      }, 0)
    }
  })

  const skipWrap = new Set(['bpmn:startEvent', 'bpmn:endEvent'])
  const registered: string[] = []

  nodeDefs.forEach(def => {
    if (def?.type && def.view && def.model) {
      const toReg = skipWrap.has(def.type) ? def : wrapNodeWithValuePeek(def)
      try {
        modeler.lf.register(toReg)
        registered.push(toReg.type)
      } catch (e) {
        console.warn('[register] 注册失败 →', def?.type, e)
      }
    } else {
      console.warn('[register] 非法节点定义：', def)
    }
  })

  ;(modeler.lf as any).__registeredTypes = new Set(registered)
  console.log('[register] 已注册类型:', registered)

  // 新增节点：清空可见文本 + 初始化占位参数
  modeler.lf.on('node:add', ({ data }: any) => {
    modeler.lf.updateText(data.id, '')
    data.properties ||= {}
    if (data.properties.__peekText == null) {
      data.properties.__peekText = sampleDisplayByType[data.type] ?? '—'
    }
    if (data.properties.__peekOn == null) {
      data.properties.__peekOn = false // 想默认展开就改 true
    }
  })
  modeler.lf.on('node:added', ({ data }: any) => {
    modeler.lf.updateText(data.id, '')
  })

  // Palette 类型对齐提示（开发期辅助）
  for (const g of groups) {
    for (const it of g.items) {
      if (!(modeler.lf as any).__registeredTypes.has(it.type) && it.type !== 'custom:add') {
        console.warn('[palette-miss]', it.properties?.deviceName || it.label, '→ 未找到已注册类型：', it.type)
      }
    }
  }

  await nextTick()
  containerResize()

  // 选中同步
  modeler.lf.on('element:click', ({ data }: any) => { selectedId.value = data?.id || null })
  modeler.lf.on('blank:click', () => { selectedId.value = null })
  modeler.lf.on('selection:change', ({ nodes }: any) => {
    selectedId.value = nodes?.length ? nodes[0].id : null
  })

  // 容器大小监听
  let running = false
  addListener(container.value, () => {
    if (running) return
    running = true
    setTimeout(async () => {
      running = false
      await nextTick()
      containerResize()
    }, 200)
  })
})

onBeforeUnmount(() => {
  if (!modeler.lf) return
  modeler.lf.off('element:click')
  modeler.lf.off('blank:click')
  modeler.lf.off('selection:change')
  modeler.lf.off('node:add')
  modeler.lf.off('node:added')
})
</script>

<style>
:root { --leftbar-w: 260px; } /* 侧栏宽度可调 */
:root { --toolbar-h: 42px; } /* 工具栏高度 */

.graph-with-leftbar {
  position: relative;
  height: 100%;
  width: 100%;
  padding-left: calc(var(--leftbar-w) + 8px); /* 给左侧面板让位 */
  padding-top: 4px;
  box-sizing: border-box;
}

/* 左侧 Palette 固定面板，top 从工具栏下方开始 */
.palette-fixed {
  position: absolute;
  top: var(--toolbar-h);
  left: 0;
  bottom: 0;
  width: var(--leftbar-w);
  overflow: auto;
  padding: 8px 8px 12px;
  background: #fff;
  box-shadow: 0 0 4px rgb(0 0 0 / 30%) inset;
  z-index: 2; /* 在画布上层 */
}

/* 隐藏官方 DndPanel 的 UI（仅保留拖拽能力） */
.lf-dndpanel { display: none !important; }

.lf-mini-map {
  padding-top: 0;
  right: 5px;
  bottom: 5px;
  height: 120px;
  box-shadow: 0 1px 4px rgb(0 0 0 / 30%);
  background-color: rgba(255, 255, 255, 0.8);
}
.lf-mini-map-header, .lf-mini-map-close { visibility: hidden; }
.lf-mini-map .lf-graph { background: none; }
/* 强制隐藏 LogicFlow 默认箭头（svg marker） */
.lf-arrow {
  display: none !important;
}
</style>
