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
      <n-input v-model:value="value.placeholder[0]" size="small" placeholder="开始日期提示" />
      <n-input v-model:value="value.placeholder[1]" size="small" placeholder="结束日期提示" />
    </n-form-item>
    <n-form-item label="日期格式">
      <n-select v-model:value="value.format" size="small" :options="value.options" />
    </n-form-item>
    <n-form-item label="展示时长">
      <n-switch v-model:value="value.showLength" />
    </n-form-item>
  </div>
</template>

<style scoped lang="less"></style>
