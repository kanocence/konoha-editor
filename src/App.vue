<script lang="ts" setup>
import { ref } from 'vue'
import { useMagicKeys } from '@vueuse/core'
import EditorHeader from './components/editor-header.vue'
import EditorMain from './components/editor-main.vue'
import type { EditorPanel } from './typeings'

let tabIndex = 1
const tabsValue = ref('0')
const tabs = ref<EditorPanel[]>([
  { title: '1.JSON', name: '0', content: '', language: 'json' },
])

const addTab = ({ title, content, language }: EditorPanel) => {
  const newTabIndex = `${++tabIndex}`
  tabs.value.push({
    title: `${newTabIndex}.${title}`,
    name: newTabIndex,
    content,
    language,
  })
  tabsValue.value = newTabIndex
}

useMagicKeys({
  passive: false,
  onEventFired(e) {
    // prevent ctrl + s
    if (e.ctrlKey && e.type === 'keydown' && e.key === 's')
      e.preventDefault()
  },
})
</script>

<template>
  <div class="editor">
    <EditorHeader @add-tab="addTab" />
    <EditorMain v-model:tabs="tabs" v-model:tabsValue="tabsValue" />
  </div>
</template>

<style scoped lang="scss">
.editor {
  height: 100vh;
  width: 100%;

  display: flex;
  flex-direction: column;
}
</style>
