<script setup lang="ts">
import { markRaw, nextTick, onMounted, ref, watch } from 'vue'
import { editor } from 'monaco-editor'
import { useElementSize, useStorage } from '@vueuse/core'
import { ElMessage } from 'element-plus'
import {
  checkEditor,
  copy,
  fullExpand,
  fullFold,
  fullFormat,
  removeComments,
} from '../../actions'
import type { JsonConversionType } from '../../../../typeings'
import {
  compression,
  conversion,
  createFunc,
  escape,
  extractJsonFromUrl,
} from '../src/json-editor-actions'
import ActionBar from '../src/action-bar.vue'

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
  const model = editor.createModel(props.modelValue, 'json')
  const subModel = editor.createModel('', 'json')

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

  // on paste
  instance.onDidPaste((e: editor.IPasteEvent) => {
    // preprocessing: formatting or converting URL Params to JSON

    if (!instance)
      return

    const { startLineNumber, endLineNumber, startColumn, endColumn } = e.range
    const model = instance.getModel()!

    // the text to be pasted
    const textTrim = model.getValueInRange(e.range).trim()
    if (!textTrim.length)
      return

    const fullRange = model.getFullModelRange()

    // definitely not JSON
    const assert = !textTrim.charAt(0).match(/[\{\[]/)

    // if full replace
    const full
      = startColumn === fullRange.startColumn
      && endColumn === fullRange.endColumn
      && startLineNumber === fullRange.startLineNumber
      && endLineNumber === fullRange.endLineNumber

    if (assert && full) {
      instance.setValue(extractJsonFromUrl(textTrim))
      fullFormat(instance)
    }
    else if (!assert && !full) {
      try {
        const formatText = JSON.stringify(JSON.parse(textTrim), null, 4)

        // gets the indent count of the inserted row
        const line = model.getLineContent(startLineNumber)
        const indentCount = line.match(/^\s*/)?.[0].length ?? 0

        // add indent to each line
        let formatTextWithTab = formatText
        if (indentCount) {
          const formatLines = formatText.split('\n')
          formatTextWithTab = formatLines
            .map((line, index) => {
              if (index === 0)
                return line
              return ' '.repeat(indentCount) + line
            })
            .join('\n')
        }

        // only the inserts are updated
        instance.executeEdits('paste', [
          { range: e.range, text: formatTextWithTab },
        ])
      }
      catch {}
    }
    else {
      fullFormat(instance)
    }
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
 * custom action
 * @param {[string, JsonConversionType]} action
 */
const handleAction = ([cmd, cmd2]: [string, JsonConversionType]) => {
  if (
    ['format', 'escape', 'conversion'].includes(cmd)
    && !checkEditor(instance)
  ) {
    ElMessage.error('Editor存在错误')
    return
  }
  switch (cmd) {
    case 'format':
      fullFormat(instance!)
      break
    case 'fold':
      fullFold(instance!)
      break
    case 'expand':
      fullExpand(instance!)
      break
    case 'comments':
      removeComments(instance!)
      break
    case 'compression':
      compression(instance!)
      break
    case 'escape':
      escape(instance!)
      break
    case 'conversion':
      openSubEditor(conversion(cmd2, instance!))
      break
    case 'copy':
      copy(props.modelValue)
      break
  }
}

/**
 * run code
 * @param code
 */
const handleRunCode = (code: string) => {
  if (!checkEditor(instance)) {
    ElMessage.error('Editor存在错误')
    return
  }

  const content = instance!.getValue()
  if (!content.trim().length)
    return

  const { type, message } = createFunc(content, code)
  if (type === 'success')
    openSubEditor(JSON.stringify(message, null, 4))
  else if (type === 'error')
    ElMessage.error(message)
}

/**
 * close sub editor
 */
const handleClose = () => {
  subEditorVisible.value = false
  const { clientWidth, clientHeight } = jsonEditor.value!
  instance?.layout({ width: clientWidth, height: clientHeight - 50 })
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
    <ActionBar @action="handleAction" @run="handleRunCode" @close="handleClose" />
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
