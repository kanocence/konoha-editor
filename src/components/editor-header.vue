<script lang="ts" setup>
import { useDark } from '@vueuse/core'
import { ArrowDown } from '@element-plus/icons-vue'

const emits = defineEmits(['addTab'])

const theme = useDark({
  valueDark: 'dark',
  valueLight: 'auto',
  storageKey: 'theme',
})

const subMenu = [
  {
    title: 'JSON Editor',
    key: 'json',
    onClick: () => {
      emits('addTab', { language: 'json', title: 'JSON', content: '' })
    },
  },
  {
    title: 'JavaScript Editor',
    key: 'javascript',
    onClick: () => {
      emits('addTab', { language: 'javascript', title: 'JavaScript', content: '' })
    },
  },
]

const refresh = () => {
  window.location.reload()
}
</script>

<template>
  <div class="editor-header">
    <!-- logo -->
    <div class="editor-header__logo" @click="refresh">
      <el-image src="/logo.svg" alt="logo" />
      <span>Konoha</span>
    </div>
    <!-- flex grow -->
    <div class="flex-grow" />
    <!-- add tab -->
    <el-dropdown trigger="click">
      <span class="editor-header__dropdown">
        Add Editor <el-icon><ArrowDown /></el-icon>
      </span>
      <template #dropdown>
        <el-dropdown-menu>
          <el-dropdown-item
            v-for="item in subMenu"
            :key="item.key"
            @click="item.onClick"
          >
            {{ item.title }}
          </el-dropdown-item>
        </el-dropdown-menu>
      </template>
    </el-dropdown>
    <!-- theme switch -->
    <el-switch
      v-model="theme"
      class="editor-header__theme"
      width="45"
      inline-prompt
      active-text="🌙"
      inactive-text="☀️"
    />
    <!-- github link -->
    <el-link
      class="editor-header__link"
      :underline="false"
      href="https://github.com/kanocence/konoha-editor"
      target="_blank"
    >
      <el-image src="/github.svg" />
    </el-link>
  </div>
</template>

<style scoped lang="scss">
.editor-header {
  display: flex;
  align-items: center;
  height: 60px;
  border-bottom: 1px solid var(--el-border-color-light);
  user-select: none;

  & > * {
    padding: 0 20px;
  }

  &__logo {
    display: flex;
    align-items: center;
    cursor: pointer;

    .el-image {
      height: 40px;
    }

    span {
      font-size: 24px;
      font-weight: 600;
      color: var(--el-text-color-regular);
    }
  }

  &__dropdown {
    padding: 8px;
    display: flex;
    border-radius: var(--el-border-radius-base);
    align-items: center;
    cursor: pointer;
    transition: background-color 0.1s;

    .el-icon {
      margin-left: 5px;
    }

    &:hover {
      background-color: var(--el-fill-color-light);
    }
  }

  &__theme {
    --el-switch-on-color: #6b778c;
    --el-switch-off-color: #dee2e6;

    :deep(.is-text) {
      font-size: 14px;
    }
  }

  &__link .el-image {
    height: 24px;
    background-color: var(--el-color-white);
    border-radius: 50%;
  }
}

.flex-grow {
  flex-grow: 1;
}
</style>
