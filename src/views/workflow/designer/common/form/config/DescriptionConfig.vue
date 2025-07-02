<script setup lang="ts">
import { withDefaults } from 'vue';

interface Props {
  value?: object;
}

withDefaults(defineProps<Props>(), {
  value: () => {
    return {};
  }
});
</script>

<template>
  <div>
    <n-form-item label="提示内容">
      <n-input v-model:value="value.placeholder" size="small" placeholder="请设置提示内容" />
    </n-form-item>
    <n-form-item label="文字颜色">
      <n-color-picker v-model:value="value.color" size="medium" />
    </n-form-item>
  </div>
</template>

<style scoped lang="less"></style>
