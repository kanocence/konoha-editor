import type { editor } from 'monaco-editor'
import { ElMessage } from 'element-plus'
import { XMLBuilder } from 'fast-xml-parser'
import { stringify } from 'yaml'
import type { JsonConversionType } from '../../../../typeings'

/**
 * JSON - 压缩
 * @param instance 编辑器实例
 */
export const compression = (instance: editor.IStandaloneCodeEditor) => {
  const model = instance!.getModel()!
  const fullRange = model.getFullModelRange()
  const text = model.getValueInRange(fullRange)
  const newText = text.replace(/\s/g, '')
  instance!.setValue(newText)
}

/**
 * JSON - 转义
 * @param instance 编辑器实例
 */
export const escape = (instance: editor.IStandaloneCodeEditor) => {
  const model = instance!.getModel()!
  const fullRange = model.getFullModelRange()
  const text = model.getValueInRange(fullRange)
  const newText = text.replace(/\s/g, '').replace(/"/g, '\\"')
  navigator.clipboard.writeText(newText)
  ElMessage.success('已复制到剪贴板')
}

/**
 * 判断是否为url参数
 * @param str
 * @returns {boolean}
 */
export const isURLParam = (str: string) => {
  const regExp = /^(\??([\w-\.]+=[\w\d%]*(&|$))*)?$/
  if (!regExp.test(str))
    return false

  const params = str.replace(/^\?/, '').split('&')
  for (let i = 0; i < params.length; i++) {
    const [name, value] = params[i].split('=')
    if (!name || !value)
      return false

    if (name.startsWith('.'))
      return false

    if (!/^[A-Za-z0-9_.-]+$/.test(name))
      return false

    try {
      decodeURIComponent(value)
    }
    catch {
      return false
    }
  }
  return true
}

/**
 * 判断是否为url
 * @param str
 * @returns {boolean}
 */
export const isURL = (str: string) => {
  try {
    return !!new URL(str)
  }
  catch {
    return false
  }
}

/**
 * 从url中提取json
 * @param str
 * @returns
 */
export const extractJsonFromUrl = (str: string) => {
  if (!isURLParam(str) && !isURL(str))
    return str

  const paramsStr = str.includes('?') ? str.split('?')[1] : str
  const jsonObj = paramsStr.split('&').reduce((prev, cur) => {
    const [key, value] = cur.split('=')
    if (key) {
      try {
        prev[key] = decodeURIComponent(value)
      }
      catch (e) {
        prev[key] = value
      }
    }
    return prev
  }, {} as { [key: string]: string })

  return JSON.stringify(jsonObj)
}

/**
 * JSON转换为XML
 * @param str
 */
const json2xml = (str: string) => {
  const builder = new XMLBuilder({ format: true })
  return builder.build(JSON.parse(str))
}

/**
 * JSON转换为TypeScript
 * @param str
 */
const json2ts = (str: string) => {
  // TODO
}

/**
 * JSON转换为YAML
 * @param str
 */
const json2yaml = (str: string) => stringify(JSON.parse(str))

/**
 * JSON转换为URL Params
 * @param str
 * @returns
 */
const json2url = (str: string) => {
  const jsonObj = JSON.parse(str)
  const urlParams = Object.keys(jsonObj).reduce((prev, cur) => {
    const value = jsonObj[cur]
    if (value)
      prev.push(`${cur}=${encodeURIComponent(value)}`)
    return prev
  }, [] as string[])
  return urlParams.join('&')
}

/**
 * JSON转换
 *
 * - to XML
 * - to TypeScript
 * - to YAML
 * - to URL Params
 * @param target
 */
export const conversion = (target: JsonConversionType, instance: editor.IStandaloneCodeEditor) => {
  const str = instance!.getValue()
  switch (target) {
    case '2xml':
      return json2xml(str)
    case '2ts':
      return json2ts(str)
    case '2yaml':
      return json2yaml(str)
    case '2url':
      return json2url(str)
  }
}

/**
 * 执行自定义代码
 * @param data
 * @param code
 * @returns
 */
export const createFunc = (data: any, code: string) => {
  try {
    // eslint-disable-next-line no-new-func
    const res = Function(`return this${code}`).bind(JSON.parse(data))()
    return { type: 'success', message: res }
  }
  catch (e) {
    return { type: 'error', message: (e as Error).message.replace('this', 'data') }
  }
}
