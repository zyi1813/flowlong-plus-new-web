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
    <n-form-item label="数量限制">
      <!-- <tip slot="label" content="限制最大上传图片数量（为0则不限制）">数量限制</tip> -->
      <n-input-number
        v-model:value="value.maxNumber"
        class="max-fill"
        controls-position="right"
        :precision="0"
        size="small"
        placeholder="最多上传几张图片"
      />
    </n-form-item>
    <n-form-item label="大小限制">
      <!-- <tip slot="label" content="限制单个文件最大大小-MB（为0则不限制）">大小限制</tip> -->
      <n-input-number
        v-model:value="value.maxSize"
        class="max-fill"
        controls-position="right"
        :precision="1"
        size="small"
        placeholder="单个文件最大大小"
      />
    </n-form-item>
    <n-form-item label="类型限制">
      <!-- <tip slot="label" content="限制上传文件的后缀类型">类型限制</tip> -->
      <n-select
        v-model:value="value.fileTypes"
        size="small"
        style="width: 100%"
        multiple
        filterable
        allow-create
        default-first-option
        clearable
        placeholder="允许上传文件的后缀格式，可设置多种"
      />
    </n-form-item>
    <n-form-item label="不可下载">
      <n-switch v-model:value="value.onlyRead" />
    </n-form-item>
  </div>
</template>

<style scoped lang="less"></style>
