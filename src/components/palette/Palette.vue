<script setup lang="ts">
import { message } from 'ant-design-vue'
import { computed, ref } from 'vue'

export interface PaletteItem {
  type: string
  label: string
  icon?: string
  properties?: Record<string, any>
  width?: number
  height?: number
  // 子类别：A / B / C ...
  subGroup?: string
}
export interface PaletteGroup {
  key: string
  name: string
  items: PaletteItem[]
}

const props = defineProps<{ lf: any, groups: PaletteGroup[] }>()

/** 搜索 */
const keyword = ref('')

/** 自定义模板存储（改成 sessionStorage） */
const LS_KEY = 'palette_custom_items_v1'
const STORAGE = sessionStorage
const customItems = ref<PaletteItem[]>([])

function loadCustomItems() {
  try {
    const raw = STORAGE.getItem(LS_KEY)
    customItems.value = raw ? JSON.parse(raw) : []
  }
  catch { customItems.value = [] }
}
function saveCustomItems() {
  try {
    STORAGE.setItem(LS_KEY, JSON.stringify(customItems.value))
  }
  catch {}
}

/** ⬇️ 调用一次，初始化时加载 */
loadCustomItems()

/** 合并分组（custom 分组加上自定义项） */
const mergedGroups = computed<PaletteGroup[]>(() => {
  const deep = JSON.parse(JSON.stringify(props.groups)) as PaletteGroup[]
  const idx = deep.findIndex(g => g.key === 'custom')
  if (idx >= 0) {
    const addCard = deep[idx].items.find(it => it.type === 'custom:add') || {
      type: 'custom:add',
      label: '添加组件',
      icon: 'plus',
      properties: {},
    }
    deep[idx].items = [addCard, ...customItems.value]
  }
  return deep
})

const filteredGroups = computed(() => {
  const k = keyword.value.trim().toLowerCase()
  if (!k)
    return mergedGroups.value
  return mergedGroups.value
    .map(g => ({
      ...g,
      items: g.items.filter((it) => {
        const zh = (it.properties?.deviceName ?? it.label ?? '').toLowerCase()
        return zh.includes(k) || it.type.toLowerCase().includes(k)
      }),
    }))
    .filter(g => g.items.length)
})

/** 按子类别拆分一个分组内部的 items */
function groupBySubGroup(items: PaletteItem[]) {
  const map: Record<string, PaletteItem[]> = {}
  items.forEach((it) => {
    const key = it.subGroup || '' // 没有 subGroup 的归入默认组
    if (!map[key])
      map[key] = []
    map[key].push(it)
  })
  return Object.entries(map).map(([name, its]) => ({ name, items: its }))
}

/** 拖拽 / 快速添加 */
function ensureType(t: string) {
  if (t === 'custom:add')
    return 'custom:add'
  const set = (props.lf as any)?.__registeredTypes
  if (set && typeof set.has === 'function') {
    return set.has(t) ? t : 'rect'
  }
  return t
}

function onStartDrag(item: PaletteItem) {
  if (item.type === 'custom:add') { addVisible.value = true; return }
  const dnd = (props.lf && (props.lf.dnd || props.lf.extension?.dnd))
  if (!dnd || typeof dnd.startDrag !== 'function')
    return
  const type = ensureType(item.type)
  dnd.startDrag({
    type,
    text: '',
    properties: item.properties || {},
    width: item.width,
    height: item.height,
  })
}

function onQuickAdd(item: PaletteItem) {
  if (item.type === 'custom:add') { addVisible.value = true; return }
  if (!props.lf || typeof props.lf.addNode !== 'function')
    return
  const type = ensureType(item.type)
  const center = props.lf.graphModel.getPointByClient({
    x: window.innerWidth * 0.55,
    y: window.innerHeight * 0.45,
  })
  props.lf.addNode({
    type,
    x: center.x,
    y: center.y,
    text: '',
    properties: item.properties || {},
    width: item.width,
    height: item.height,
  })
}

function onCardClick(item: PaletteItem) {
  if (item.type === 'custom:add') {
    addVisible.value = true
  }
  else {
    onQuickAdd(item)
  }
}

/** 弹窗表单（AntD） */
const addVisible = ref(false)
const form = ref({ nameZh: '', nameEn: '', width: 120, height: 84, image: '', icon: '' })

function resetForm() {
  form.value = { nameZh: '', nameEn: '', width: 120, height: 84, image: '', icon: '' }
}
function onCancel() {
  addVisible.value = false
  resetForm()
}

function beforeUpload(file: File) {
  if (!file.type.startsWith('image/')) { message.error('请选择图片文件'); return false }
  const reader = new FileReader()
  reader.onload = () => {
    form.value.image = String(reader.result)
    form.value.icon = form.value.image
  }
  reader.readAsDataURL(file)
  return false
}

function handleOk() {
  if (!form.value.image) { message.error('请先选择图片'); return }
  if (!form.value.nameZh && !form.value.nameEn) { message.error('请填写中文名或英文名'); return }

  const item: PaletteItem = {
    type: 'custom:image',
    label: form.value.nameZh || form.value.nameEn || '自定义',
    icon: form.value.icon,
    width: Number(form.value.width),
    height: Number(form.value.height),
    properties: {
      image: form.value.image,
      nameZh: form.value.nameZh,
      nameEn: form.value.nameEn,
      deviceName: form.value.nameZh || '自定义',
      deviceNameEn: form.value.nameEn || 'Custom',
      width: Number(form.value.width),
      height: Number(form.value.height),
    },
  }

  customItems.value.unshift(item)
  saveCustomItems()
  addVisible.value = false
  resetForm()
  message.success('已添加到“自定义组件”')
}
</script>

<template>
  <div class="palette">
    <input
      v-model="keyword"
      class="palette__search"
      type="text"
      placeholder="搜索组件…（中文名或 type）"
    >

    <!-- 顶层大分组（机电类设备 / 驱动类设备 / ...） -->
    <details v-for="g in filteredGroups" :key="g.key" open class="palette__group">
      <summary class="palette__group-title">
        {{ g.name }}（{{ g.items.length }}）
      </summary>

      <!-- 分组内部：再按 subGroup 拆成子分组 -->
      <template v-for="sub in groupBySubGroup(g.items)" :key="sub.name || 'default'">
        <!-- 有名字的子组：做成可折叠的 <details>，比如 A / B / C -->
        <details
          v-if="sub.name"
          open
          class="palette__subgroup"
        >
          <summary class="palette__subgroup-title">
            {{ sub.name }}（{{ sub.items.length }}）
          </summary>

          <div class="palette__grid">
            <div
              v-for="it in sub.items"
              :key="it.type + (it.label || '')"
              class="palette__card"
              :title="it.type === 'custom:add' ? '点击添加自定义组件' : '按住拖到画布；单击快速添加'"
              @mousedown.left.prevent="it.type !== 'custom:add' && onStartDrag(it, $event)"
              @click.stop="onCardClick(it)"
            >
              <div class="palette__icon">
                <template v-if="it.type === 'custom:add'">
                  <span class="plus">＋</span>
                </template>
                <template v-else>
                  <img v-if="it.icon" :src="it.icon" alt="">
                  <span v-else>◎</span>
                </template>
              </div>
              <div class="palette__label">
                {{ (it.properties && it.properties.deviceName) || it.label }}
              </div>
            </div>
          </div>
        </details>

        <!-- 没有名字的子组（其它分组）：保持原来样式 -->
        <div v-else class="palette__grid">
          <div
            v-for="it in sub.items"
            :key="it.type + (it.label || '')"
            class="palette__card"
            :title="it.type === 'custom:add' ? '点击添加自定义组件' : '按住拖到画布；单击快速添加'"
            @mousedown.left.prevent="it.type !== 'custom:add' && onStartDrag(it, $event)"
            @click.stop="onCardClick(it)"
          >
            <div class="palette__icon">
              <template v-if="it.type === 'custom:add'">
                <span class="plus">＋</span>
              </template>
              <template v-else>
                <img v-if="it.icon" :src="it.icon" alt="">
                <span v-else>◎</span>
              </template>
            </div>
            <div class="palette__label">
              {{ (it.properties && it.properties.deviceName) || it.label }}
            </div>
          </div>
        </div>
      </template>
    </details>

    <div v-if="!filteredGroups.length" class="palette__empty">
      暂无匹配结果
    </div>

    <!-- 弹窗 -->
    <a-modal
      v-model:visible="addVisible"
      title="添加自定义组件"
      ok-text="添加到左侧"
      cancel-text="取消"
      :maskClosable="true"
      :keyboard="true"
      @ok="handleOk"
      @cancel="onCancel"
    >
      <div style="display:grid; gap:12px;">
        <a-upload
          list-type="picture-card"
          :show-upload-list="false"
          :before-upload="beforeUpload"
          accept="image/*"
        >
          <div
            v-if="!form.image"
            style="width:104px;height:104px;display:flex;flex-direction:column;align-items:center;justify-content:center;"
          >
            <span class="plus">＋</span>
            <div style="margin-top:8px">
              上传图片
            </div>
          </div>
          <img v-else :src="form.image" style="width:104px;height:104px;object-fit:contain;">
        </a-upload>

        <a-input v-model:value="form.nameZh" placeholder="中文名（可选）" />
        <a-input v-model:value="form.nameEn" placeholder="英文名（可选）" />

        <div style="display:flex; gap:8px;">
          <a-input-number v-model:value="form.width" :min="40" :max="400" style="flex:1" placeholder="宽" />
          <a-input-number v-model:value="form.height" :min="30" :max="300" style="flex:1" placeholder="高" />
        </div>
      </div>
    </a-modal>
  </div>
</template>

<style scoped>
:host, .palette { --icon-size: 48px; }

.palette{
  height: 100%;
  padding: 8px;
  background: #fff;
  overflow: auto;
  box-sizing: border-box;
}
.palette__search{
  width: 100%;
  height: 32px;
  padding: 0 10px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  outline: none;
  box-sizing: border-box;
  margin-bottom: 8px;
}
.palette__group{
  margin: 6px 0 10px;
}
.palette__group-title{
  font-weight: 600;
  cursor: pointer;
  user-select: none;
  padding: 6px 2px;
}

/* 子类别 details 外层 */
.palette__subgroup{
  margin: 2px 0 6px;
}

/* 子类别标题样式（可折叠 summary） */
.palette__subgroup-title{
  font-size: 12px;
  font-weight: 500;
  color: #6b7280;
  cursor: pointer;
  user-select: none;
  padding: 4px 4px 2px;
}

.palette__grid{
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px;
  padding: 4px 2px;
}

.palette__card{
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 92px;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  background: #fafafa;
  cursor: grab;
  user-select: none;
  transition: transform .08s, box-shadow .12s, border-color .12s;
  overflow: hidden;
}
.palette__card:hover{
  border-color: #93c5fd;
  box-shadow: 0 2px 10px rgba(0,0,0,.06);
  transform: translateY(-1px);
}
.palette__card:active{
  cursor: grabbing;
}

.palette__icon{
  width: var(--icon-size);
  height: var(--icon-size);
  display: grid;
  place-items: center;
  margin-top: 6px;
}
.palette__icon img{
  width: 100%;
  height: 100%;
  display: block;
  object-fit: contain;
  image-rendering: auto;
  pointer-events: none;
}
.palette__icon > span{
  font-size: calc(var(--icon-size) * 0.6);
  line-height: 1;
}
.palette__icon .plus{
  font-size: calc(var(--icon-size) * 0.8);
  color:#6b7280;
}

.palette__label{
  margin-top: 6px;
  font-size: 12px;
  line-height: 1.2;
  text-align: center;
  padding: 0 6px;
  color: #333;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}
.palette__empty{
  padding: 16px;
  color: #9ca3af;
  text-align: center;
}
</style>
