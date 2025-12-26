import { join } from 'path'
import vue from '@vitejs/plugin-vue'
import visualizer from 'rollup-plugin-visualizer'
import { AntDesignVueResolver } from 'unplugin-vue-components/resolvers'
import Components from 'unplugin-vue-components/vite'
import { defineConfig, splitVendorChunkPlugin } from 'vite'

// https://vitejs.dev/config/
export default defineConfig(({ command, mode }) => {
  console.log(`🚀 command: ${command}, mode: ${mode}\n`)
  return {
    base: './',
    plugins: [
      vue(),
      splitVendorChunkPlugin(),
      Components({
        // Vue 组件自动按需导入
        resolvers: [
          AntDesignVueResolver({
            resolveIcons: true,
          }),
        ],
        dts: command === 'build' ? 'src/components.d.ts' : false,
      }),
      visualizer({
        open: false,
        gzipSize: true,
        brotliSize: true,
        filename: './node_modules/.cache/visualizer/stats.html',
      }),
    ],
    resolve: {
      alias: {
        '@/': '/src/',
      },
    },
    build: {
      rollupOptions: {
        input: {
          main: join(__dirname, 'index.html'),
          viewer: join(__dirname, 'viewer.html'),
          modeler: join(__dirname, 'modeler.html'),
        },
      },
    },
    server: {
      open: true,
      host: '127.0.0.1',
      port: 4173,
      strictPort: true,

      // ✅ 关键：把前端 /dev-api 开头的请求转发到后端 8080
      // 例如：axios.get('/dev-api/test/user/list')
      // 实际会请求到： http://127.0.0.1:8080/test/user/list
      proxy: {
        '/dev-api': {
          target: 'http://127.0.0.1:8080',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/dev-api/, ''),
        },
      },
    },
  }
})
