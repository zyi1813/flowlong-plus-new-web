<script setup lang="ts">
import { computed, ref, withDefaults } from 'vue';
import Node from './Node.vue';

defineOptions({
  name: 'TriggerNode'
});

interface Props {
  config: any;
}

const props = withDefaults(defineProps<Props>(), {
  config: () => {}
});

const showError = ref<boolean>(false);
const errorInfo = ref<string>('');

const content = computed(() => JSON.stringify(props.config));
const isNotEmpty = (obj: any) => {
  return obj !== undefined && obj !== null && obj !== '' && obj !== 'null';
};

// 校验数据配置的合法性
const validate = err => {
  showError.value = false;
  if (props.config.props.type === 'WEBHOOK') {
    if (isNotEmpty(props.config.props.http.url)) {
      showError.value = false;
    } else {
      showError.value = true;
      errorInfo.value = '请设置WEBHOOK的URL地址';
    }
  } else if (props.config.props.type === 'EMAIL') {
    if (
      !isNotEmpty(props.config.props.email.subject) ||
      props.config.props.email.to.length === 0 ||
      !isNotEmpty(props.config.props.email.content)
    ) {
      showError.value = true;
      errorInfo.value = '请设置邮件发送配置';
    } else {
      showError.value = false;
    }
  }
  if (showError.value) {
    err.push(`${props.config.name} 触发动作未设置完善`);
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
    placeholder="请设置触发器"
    header-bgc="#47bc82"
    header-icon="x-icon-trigger"
  />
</template>

<style scoped></style>
