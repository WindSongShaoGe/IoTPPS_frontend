// src/components/palette/palette-types.ts

export interface PaletteItem {
  type: string
  label: string
  icon?: string
  properties?: Record<string, any>

  // 下面三个是可选的，方便后面扩展
  width?: number
  height?: number
  /** 子类别，比如 'A' | 'B' | 'C'，用于在分组内部再细分 */
  subGroup?: string
}

export interface PaletteGroup {
  key: string
  name: string
  items: PaletteItem[]
}
