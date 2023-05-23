<script setup lang="ts">
import { CloseBold, Promotion } from '@element-plus/icons-vue'

const emits = defineEmits(['action', 'run', 'close'])

const actions: any = [
  { tip: '格式化', cmd: 'format', iconfont: 'icon-format' },
  { tip: '运行 (Ctrl + R)', cmd: 'run', svg: Promotion },
  { tip: '关闭', cmd: 'close', svg: CloseBold },
]

const onAction = (action: string[]) => {
  emits('action', action)
}
</script>

<template>
  <div class="action-bar">
    <div>
      <el-tooltip
        v-for="action in actions"
        :key="action.cmd"
        :content="action.tip"
        placement="top"
        :show-arrow="false"
        :hide-after="100"
      >
        <!-- button -->
        <el-button text :icon="action.svg" @click="onAction([action.cmd])">
          <i v-if="action.iconfont" class="iconfont" :class="[action.iconfont]" />
        </el-button>
      </el-tooltip>
    </div>
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
  justify-content: space-between;

  .el-button {
    font-size: 18px;
  }

  .el-button + .el-button {
    margin-left: 0;
  }

  .iconfont {
    font-size: 18px;
    font-weight: bold;
  }
}
</style>
