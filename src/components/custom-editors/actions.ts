import { editor } from 'monaco-editor'
import { ElMessage } from 'element-plus'

/**
 * 检查是否可用和是否有语法错误
 * @param instance
 * @returns
 */
export const checkEditor = (instance: editor.IStandaloneCodeEditor | undefined) => {
  if (!instance || !instance.getModel())
    return false
  const markers = editor.getModelMarkers({
    resource: instance!.getModel()!.uri,
  })
  return markers.length === 0
}

/**
 * 全部格式化
 * @param instance 编辑器实例
 */
export const fullFormat = (instance: editor.IStandaloneCodeEditor) => {
  const formatAction = instance!.getAction('editor.action.formatDocument')
  formatAction?.run()
}

/**
 * 全部收起
 * @param instance 编辑器实例
 */
export const fullFold = (instance: editor.IStandaloneCodeEditor) => {
  instance!.trigger('keyboard', 'editor.foldAll', {})
}

/**
 * 全部展开
 * @param instance 编辑器实例
 */
export const fullExpand = (instance: editor.IStandaloneCodeEditor) => {
  instance!.trigger('keyboard', 'editor.unfoldAll', {})
}

/**
 * 去掉注释
 * @param instance 编辑器实例
 */
export const removeComments = (instance: editor.IStandaloneCodeEditor) => {
  const model = instance!.getModel()!
  const fullRange = model.getFullModelRange()
  const text = model.getValueInRange(fullRange)
  const newText = text
    .replace(/\/\/.*$/gm, '')
    .replace(/\/\*[\s\S]*?\*\//gm, '')
  instance!.setValue(newText)
  fullFormat(instance)
}

/**
 * 复制到剪贴板
 * @param str 字符
 */
export const copy = (str: string) => {
  navigator.clipboard.writeText(str)
  ElMessage.success('已复制到剪贴板')
}
