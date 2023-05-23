<script setup lang="ts">
import { markRaw, nextTick, onMounted, ref, watch } from 'vue'
import { editor } from 'monaco-editor'
import { useElementSize, useStorage } from '@vueuse/core'
import ActionBar from '../src/action-bar.vue'
import {
  fullFormat,
  runCodeInSandbox,
} from '../../actions'

const props = defineProps<{
  /**
   * json string
   */
  modelValue: string
  /**
   * panel active status
   */
  active: boolean
}>()
const emits = defineEmits(['update:modelValue'])

const mainEditor = ref<HTMLElement>()
const jsonEditor = ref<HTMLElement>()
const subEditor = ref<HTMLElement>()
let instance: editor.IStandaloneCodeEditor | undefined
let subInstance: editor.IStandaloneCodeEditor | undefined
const subEditorVisible = ref(false)
const theme = useStorage('theme', 'auto')
const { height, width } = useElementSize(jsonEditor)

onMounted(() => {
  const model = editor.createModel(props.modelValue, 'javascript')
  const subModel = editor.createModel('', 'javascript')

  instance = markRaw(
    editor.create(mainEditor.value!, {
      model,
      automaticLayout: true,
      scrollBeyondLastLine: false,
      theme: theme.value === 'dark' ? 'vs-dark' : 'vs',
    }),
  )

  subInstance = markRaw(
    editor.create(subEditor.value!, {
      model: subModel,
      automaticLayout: true,
      scrollBeyondLastLine: false,
      theme: theme.value === 'dark' ? 'vs-dark' : 'vs',
      readOnly: true,
    }),
  )

  // on change
  instance.onDidChangeModelContent(() => {
    emits('update:modelValue', instance?.getValue())
  })
})

/**
 * open sub editor
 * @param content
 */
const openSubEditor = (content: string) => {
  subEditorVisible.value = true
  subInstance?.setValue(content)

  const { clientWidth, clientHeight } = jsonEditor.value!
  instance?.layout({ width: clientWidth / 2, height: clientHeight - 50 })
}

/**
 * close sub editor
 */
const handleClose = () => {
  subEditorVisible.value = false
  const { clientWidth, clientHeight } = jsonEditor.value!
  instance?.layout({ width: clientWidth, height: clientHeight - 50 })
}

const runCode = () => {
  const val = instance?.getValue()
  if (val) {
    const logs: string[] = runCodeInSandbox(val)
    openSubEditor(logs.join('\n'))
  }
}

/**
 * handle action
 * @param cmds
 */
const handleAction = ([cmd]: string[]) => {
  switch (cmd) {
    case 'format':
      fullFormat(instance!)
      break
    case 'close':
      handleClose()
      break
    case 'run':
      runCode()
      break
    default:
      break
  }
}

// theme
watch(theme, (value) => {
  instance?.updateOptions({ theme: value === 'auto' ? 'vs' : 'vs-dark' })
})

// layout
watch(
  () => [height.value, width.value],
  () => {
    const { clientWidth, clientHeight } = jsonEditor.value!
    instance?.layout({ width: subEditorVisible.value ? clientWidth / 2 : clientWidth, height: clientHeight - 50 })
    subInstance?.layout({ width: clientWidth / 2, height: clientHeight - 50 })
  },
)

watch(
  () => [props.active],
  async () => {
    if (props.active && subEditorVisible.value) {
      await nextTick()
      const { clientWidth, clientHeight } = jsonEditor.value!
      instance?.layout({ width: clientWidth / 2, height: clientHeight - 50 })
    }
  },
)
</script>

<template>
  <div ref="jsonEditor" class="editor">
    <div class="editor-content">
      <div class="editor-content__main">
        <div ref="mainEditor" />
      </div>
      <el-divider v-show="subEditorVisible" direction="vertical" />
      <div class="editor-content__sub">
        <div v-show="subEditorVisible" ref="subEditor" />
      </div>
    </div>
    <ActionBar @action="handleAction" @close="handleClose" />
  </div>
</template>

<style scoped lang="scss">
.editor {
  height: 100%;
  display: flex;
  flex-direction: column;

  &-content {
    flex: 1;
    width: 100%;
    display: flex;
    flex-wrap: nowrap;
    flex-direction: row;
    justify-content: center;

    .el-divider {
      height: 100%;
      margin: 0;
    }

    &__main,
    &__sub {
      > div {
        height: 100%;
      }
    }

    &__sub {
      width: 50%;
    }
  }
}
</style>
