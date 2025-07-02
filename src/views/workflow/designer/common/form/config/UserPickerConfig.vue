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
    <n-form-item label="提示文字">
      <n-input v-model:value="value.placeholder" size="small" placeholder="请设置提示语" />
    </n-form-item>
    <n-form-item label="是否多选">
      <n-switch v-model:value="value.multiple" />
    </n-form-item>
  </div>
</template>

<style scoped lang="less"></style>
