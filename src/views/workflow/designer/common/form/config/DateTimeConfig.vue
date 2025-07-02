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
      <n-input v-model:value="value.placeholder" size="small" placeholder="请设置日期提示" />
    </n-form-item>
    <n-form-item label="日期格式">
      <n-select v-model:value="value.format" size="small" :options="value.options" />
    </n-form-item>
  </div>
</template>

<style scoped lang="less"></style>
