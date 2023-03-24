import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { VitePWA } from 'vite-plugin-pwa'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'

// const prefix = 'monaco-editor/esm/vs'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    VitePWA({
      registerType: 'autoUpdate',
      devOptions: { enabled: true },
      manifest: {
        name: 'konoha editor',
        short_name: 'konoha editor',
        start_url: '/',
        display: 'standalone',
        description: 'konoha editor.',
        background_color: '#ffffff',
        lang: 'zh',
        scope: '/',
        icons: [
          {
            src: 'logo.svg',
            sizes: 'any',
            type: 'image/svg+xml',
            purpose: 'any',
          },
        ],
      },
    }),
    AutoImport({
      resolvers: [ElementPlusResolver()],
    }),
    Components({
      resolvers: [ElementPlusResolver()],
    }),
  ],

  // build: {
  //   rollupOptions: {
  //     output: {
  //       manualChunks: {
  //         jsonWorker: [`${prefix}/language/json/json.worker`],
  //         cssWorker: [`${prefix}/language/css/css.worker`],
  //         htmlWorker: [`${prefix}/language/html/html.worker`],
  //         tsWorker: [`${prefix}/language/typescript/ts.worker`],
  //         editorWorker: [`${prefix}/editor/editor.worker`],
  //       },
  //     },
  //   },
  // },
})
