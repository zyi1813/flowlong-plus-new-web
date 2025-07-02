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
    <n-form-item label="保留小数">
      <n-input-number
        v-model:value="value.precision"
        controls-position="right"
        :precision="0"
        :max="3"
        :min="0"
        size="small"
        placeholder="小数位数"
      />
      位
    </n-form-item>
    <n-form-item label="展示大写">
      <n-switch v-model:value="value.showChinese" />
    </n-form-item>
  </div>
</template>

<style scoped lang="less"></style>
