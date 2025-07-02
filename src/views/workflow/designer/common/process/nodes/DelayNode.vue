<script setup lang="ts">
import { computed, ref, withDefaults } from 'vue';
import Node from './Node.vue';

defineOptions({
  name: 'DelayNode'
});

interface Props {
  config: any;
}

const props = withDefaults(defineProps<Props>(), {
  config: () => {}
});

const showError = ref<boolean>(false);
const errorInfo = ref<string>('');

const content = computed(() => {
  if (props.config.props.type === 'FIXED') {
    return `等待 ${props.config.props.time} ${getName(props.config.props.unit)}`;
  } else if (props.config.props.type === 'AUTO') {
    return `至当天 ${props.config.props.dateTime}`;
  }
  return '-';
});

const getName = (unit: string) => {
  switch (unit) {
    case 'D':
      return '天';
    case 'H':
      return '小时';
    case 'M':
      return '分钟';
    default:
      return '未知';
  }
};

// 校验数据配置的合法性
const validate = (err: string[]) => {
  showError.value = false;
  try {
    if (props.config.props.type === 'AUTO') {
      if ((props.config.props.dateTime || '') === '') {
        showError.value = true;
        errorInfo.value = '请选择时间点';
      }
    } else if (props.config.props.time <= 0) {
      showError.value = true;
      errorInfo.value = '请设置延时时长';
    }
  } catch (e) {
    showError.value = true;
    errorInfo.value = '配置出现问题';
  }
  if (showError.value) {
    err.push(`${props.config.name} 未设置延时规则`);
  }
  return !showError.value;
};

defineExpose({
  validate
});
</script>

<template>
  <Node
    :title="config.name"
    :show-error="showError"
    :content="content"
    :error-info="errorInfo"
    placeholder="请设置延时时间"
    header-bgc="#f25643"
    header-icon="x-icon-clock"
    @selected="$emit('selected')"
    @del-node="$emit('delNode')"
    @insert-node="type => $emit('insertNode', type)"
  />
</template>

<style scoped></style>
