<script lang="ts" setup>
import { ref } from 'vue'
import EditorHeader from './components/editor-header.vue'
import EditorMain from './components/editor-main.vue'
import type { EditorPanel } from './typeings'

let tabIndex = 0
const tabsValue = ref('0')
const tabs = ref<EditorPanel[]>([{ title: 'JSON', name: '0', content: '', language: 'json' }])

const addTab = ({ title, content, language }: EditorPanel) => {
  const newTabName = `${++tabIndex}`
  tabs.value.push({
    title,
    name: newTabName,
    content,
    language,
  })
  tabsValue.value = newTabName
}
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
