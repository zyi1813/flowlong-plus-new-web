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
  <n-form-item label="提示文字">
    <n-input v-model:value="value.placeholder" size="small" placeholder="请设置提示语" />
  </n-form-item>
</template>

<style scoped lang="less"></style>
