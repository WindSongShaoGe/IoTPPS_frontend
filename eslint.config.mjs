// eslint.config.mjs
import antfu from '@antfu/eslint-config'

// Vue 项目 => 直接用默认即可；需要可显式开启
export default antfu({
  vue: true,
  // 如果你完全不需要 React，可以不写任何 react 相关；
  // antfu 会按依赖自动“感知”，没装就不启用
})
