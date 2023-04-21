import { createApp } from 'vue'

import 'element-plus/es/components/message/style/css'
import 'element-plus/theme-chalk/dark/css-vars.css'
import './assets/iconfont/iconfont.css'
import './style.scss'

import EditorWorker from 'monaco-editor/esm/vs/editor/editor.worker?worker'
import JsonWorker from 'monaco-editor/esm/vs/language/json/json.worker?worker'
import TsWorker from 'monaco-editor/esm/vs/language/typescript/ts.worker?worker'

import App from './App.vue'

self.MonacoEnvironment = {
  getWorker(_workerId, label) {
    if (label === 'json')
      return new JsonWorker()
    else if (label === 'typescript' || label === 'javascript')
      return new TsWorker()

    return new EditorWorker()
  },
}

createApp(App).mount('#app')
