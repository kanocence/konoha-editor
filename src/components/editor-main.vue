<script lang="ts" setup>
import type { TabPaneName } from 'element-plus'
import { computed } from 'vue'
import type { EditorPanel } from '../typeings'
import { editorMap } from './custom-editors'

const props = defineProps<{
  /**
   * current active tab name
   */
  tabsValue: string
  /**
   * tabs data
   */
  tabs: EditorPanel[]
}>()
const emits = defineEmits(['update:tabsValue', 'update:tabs'])

const editableTabs = computed({
  get: () => props.tabs,
  set: value => emits('update:tabs', value),
})
const editableTabsValue = computed({
  get: () => props.tabsValue,
  set: value => emits('update:tabsValue', value),
})

const removeTab = (name: TabPaneName) => {
  const tabs = editableTabs.value
  let activeName = editableTabsValue.value
  if (activeName === name) {
    tabs.forEach((tab, index) => {
      if (tab.name === name) {
        const nextTab = tabs[index + 1] || tabs[index - 1]
        if (nextTab)
          activeName = nextTab.name!
      }
    })
  }

  editableTabs.value = tabs.filter(tab => tab.name !== name)
  editableTabsValue.value = activeName
}
</script>

<template>
  <el-empty v-show="!editableTabs.length" description="No Editor" :image-size="100" />
  <el-tabs
    v-show="editableTabs.length"
    v-model="editableTabsValue"
    type="card"
    class="editor-main"
    closable
    @tab-remove="removeTab"
  >
    <el-tab-pane
      v-for="item in editableTabs"
      :key="item.name"
      :label="item.title"
      :name="item.name"
    >
      <component
        :is="editorMap[item.language]"
        v-model="item.content"
        :active="item.name === editableTabsValue"
      />
    </el-tab-pane>
  </el-tabs>
</template>

<style scoped lang="scss">
.editor-main {
  // flex: 1;
  height: calc(100% - 60px);

  display: flex;
  flex-direction: column;

  :deep() {
    .el-tabs__header {
      height: unset;
      margin: 0;
      box-sizing: border-box;
    }

    .el-tabs__content {
      height: calc(100% - 41px);

      & > .el-tab-pane {
        height: 100%;
      }
    }
  }
}
</style>
