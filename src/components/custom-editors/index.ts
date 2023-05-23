import type { Component } from 'vue'
import { JSONEditor } from './json-editor'
import { JavaScriptEditor } from './javascript-editor'

export * from './json-editor'
export * from './javascript-editor'

export const editorMap: { [key: string]: Component } = {
  json: JSONEditor,
  javascript: JavaScriptEditor,
}
