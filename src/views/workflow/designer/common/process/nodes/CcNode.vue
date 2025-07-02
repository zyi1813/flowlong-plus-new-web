<script setup lang="ts">
import { computed, ref } from 'vue';
import Node from './Node.vue';

const props = defineProps<{ config: any }>();

const showError = ref(false);
const errorInfo = ref('');

const content = computed(() => {
  if (props.config.nodeAssigneeList.length > 0) {
    const texts: any[] = [];
    props.config.nodeAssigneeList.forEach((org: any) => texts.push(org.name));
    return String(texts).replaceAll(',', '、');
  }
  return '';
});

// 校验数据配置的合法性
const validate = err => {
  showError.value = false;
  if (props.config.nodeAssigneeList.length === 0) {
    showError.value = true;
    errorInfo.value = '请选择需要抄送的人员';
  }
  if (showError.value) {
    err.push(`抄送节点 ${props.config.name} 未设置抄送人`);
  }
  return !showError.value;
};

defineExpose({
  validate
});
</script>

<template>
  <Node
    :title="props.config.nodeName"
    :show-error="showError"
    :content="content"
    :error-info="errorInfo"
    placeholder="请设置抄送人"
    header-bgc="#3296fa"
    header-icon="x-icon-promotion"
  />
</template>

<style scoped></style>
