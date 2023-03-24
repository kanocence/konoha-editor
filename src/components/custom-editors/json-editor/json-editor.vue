<script setup lang="ts">
import { markRaw, onMounted, ref, watch } from 'vue'
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
} from '../actions'
import type { JsonConversionType } from '../../../typeings'
import {
  compression,
  conversion,
  escape,
  extractJsonFromUrl,
} from './json-editor-actions'
import ActionBar from './action-bar.vue'

const props = defineProps<{
  /**
   * json string
   */
  modelValue: string
}>()
const emits = defineEmits(['update:modelValue'])

const dom = ref<HTMLElement>()
const jsonEditor = ref<HTMLElement>()
let instance: editor.IStandaloneCodeEditor | undefined
const theme = useStorage('theme', 'auto')
const { height } = useElementSize(jsonEditor)

onMounted(() => {
  const model = editor.createModel(props.modelValue, 'json')

  instance = markRaw(
    editor.create(dom.value!, {
      model,
      automaticLayout: true,
      scrollBeyondLastLine: false,
      theme: theme.value === 'dark' ? 'vs-dark' : 'vs',
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
          formatTextWithTab = formatLines.map((line, index) => {
            if (index === 0)
              return line
            return ' '.repeat(indentCount) + line
          }).join('\n')
        }

        // only the inserts are updated
        instance.executeEdits('paste', [{ range: e.range, text: formatTextWithTab }])
      }
      catch {}
    }
    else {
      fullFormat(instance)
    }
  })
})

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
      conversion(cmd2, instance!)
      break
    case 'copy':
      copy(props.modelValue)
      break
  }
}

// theme
watch(theme, (value) => {
  instance?.updateOptions({ theme: value === 'auto' ? 'vs' : 'vs-dark' })
})

// layout
watch(
  () => [height.value],
  () => {
    const { clientWidth, clientHeight } = jsonEditor.value!
    instance?.layout({ width: clientWidth, height: clientHeight - 50 })
  },
)
</script>

<template>
  <div ref="jsonEditor" class="editor">
    <div ref="dom" class="editor-content" />
    <ActionBar @action="handleAction" />
  </div>
</template>

<style scoped lang="scss">
.editor {
  height: 100%;
  display: flex;
  flex-direction: column;

  &-content {
    flex: 1;
  }
}
</style>
