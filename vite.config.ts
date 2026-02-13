// vite.config.ts
import { join, resolve } from 'path'
import vue from '@vitejs/plugin-vue'
import visualizer from 'rollup-plugin-visualizer'
import { AntDesignVueResolver } from 'unplugin-vue-components/resolvers'
import Components from 'unplugin-vue-components/vite'
import { defineConfig, splitVendorChunkPlugin } from 'vite'

export default defineConfig(({ command }) => {
  console.log(`🚀 command: ${command}\n`)

  return {
    base: command === 'serve' ? '/' : './',

    plugins: [
      vue(),
      splitVendorChunkPlugin(),
      Components({
        resolvers: [AntDesignVueResolver({ resolveIcons: true })],
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
        // ✅ 关键：用文件系统路径，Vite2 在多入口下最稳
        '@': resolve(__dirname, 'src'),
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
      proxy: {
        '/api': {
          target: 'http://127.0.0.1:8080',
          changeOrigin: true,
        },
        '/dev-api': {
          target: 'http://127.0.0.1:8080',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/dev-api/, ''),
        },
      },
    },
  }
})
