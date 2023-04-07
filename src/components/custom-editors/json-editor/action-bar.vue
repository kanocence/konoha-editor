<script setup lang="ts">
import type { JsonConversionType } from '../../../typeings'

const emits = defineEmits(['action'])

const conversionActionList: { label: string; cmd: JsonConversionType }[] = [
  { label: 'to XML', cmd: '2xml' },
  // { label: 'to TypeScript', cmd: '2ts' },
  { label: 'to YAML', cmd: '2yaml' },
  { label: 'to URL Params', cmd: '2url' },
]

const actions = [
  { tip: '格式化', cmd: 'format', icon: 'icon-format' },
  { tip: '全部折叠', cmd: 'fold', icon: 'icon-fold' },
  { tip: '全部展开', cmd: 'expand', icon: 'icon-expan' },
  { tip: '去掉注释', cmd: 'comments', icon: 'icon-desc' },
  { tip: '压缩格式', cmd: 'compression', icon: 'icon-compression' },
  { tip: 'JSON转义', cmd: 'escape', icon: 'icon-escape' },
  {
    tip: '转换',
    cmd: 'conversion',
    icon: 'icon-conversion',
    type: 'dropdown',
    list: conversionActionList,
  },
  { tip: '复制', cmd: 'copy', icon: 'icon-copy' },
]

const onAction = (action: string[]) => {
  emits('action', action)
}
</script>

<template>
  <div class="action-bar">
    <el-tooltip
      v-for="action in actions"
      :key="action.cmd"
      :content="action.tip"
      placement="top"
      :show-arrow="false"
      :hide-after="100"
    >
      <!-- dropdown -->
      <el-dropdown v-if="action.type === 'dropdown'" trigger="click">
        <el-button text>
          <i class="iconfont" :class="[action.icon]" />
        </el-button>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item
              v-for="item in action.list"
              :key="item.cmd"
              @click="onAction([action.cmd, item.cmd])"
            >
              {{ item.label }}
            </el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
      <!-- button -->
      <el-button v-else text @click="onAction([action.cmd])">
        <i class="iconfont" :class="[action.icon]" />
      </el-button>
    </el-tooltip>
  </div>
</template>

<style scoped lang="scss">
.action-bar {
  padding: 0 20px;
  min-height: 50px;
  border-top: solid 1px var(--el-border-color-light);
  box-sizing: border-box;

  display: flex;
  align-items: center;
  justify-content: flex-end;

  .el-button + .el-button {
    margin-left: 0;
  }

  .iconfont {
    font-size: 18px;
    font-weight: bold;
  }
}
</style>
