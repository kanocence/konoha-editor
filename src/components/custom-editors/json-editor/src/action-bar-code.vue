<script setup lang="ts">
import { ref } from 'vue'
import { CircleClose, EditPen, Finished } from '@element-plus/icons-vue'

const emits = defineEmits(['run', 'close'])
const code = ref('')

const handleRun = () => {
  emits('run', code.value)
}
</script>

<template>
  <div class="action-bar-code">
    <el-input
      v-model="code"
      placeholder="执行JS函数, 如 .map(item => item.name))"
      @keydown.enter="handleRun"
    >
      <template #prepend>
        data
      </template>
    </el-input>
    <el-popover
      placement="top"
      title="data"
      :width="500"
      trigger="click"
    >
      <el-input
        v-model="code"
        type="textarea"
        :autosize="{ minRows: 5, maxRows: 10 }"
        placeholder="执行JS函数, 如 .map(item => item.name))"
      />
      <template #reference>
        <el-button :icon="EditPen" />
      </template>
    </el-popover>
    <el-tooltip
      content="执行"
      placement="top"
      :show-arrow="false"
      :hide-after="100"
    >
      <el-button :icon="Finished" @click="handleRun" />
    </el-tooltip>
    <el-tooltip
      content="关闭"
      placement="top"
      :show-arrow="false"
      :hide-after="100"
    >
      <el-button :icon="CircleClose" @click="$emit('close')" />
    </el-tooltip>
  </div>
</template>

<style scoped lang="scss">
.action-bar-code {
  flex: 1;
  max-width: 600px;
  display: flex;
  align-items: center;

  .el-button+.el-button {
    margin-left: 0;
  }
}
</style>
