<script setup lang="ts">
import { computed } from 'vue';
import Node from './Node.vue';

defineOptions({
  name: 'EndNode'
});

const props = defineProps({
  config: {
    type: Object,
    default: () => {
      return {};
    }
  }
});

const isEnd = computed(() => {
  if (props.config.showClose) {
    return !props.config.showClose;
  }
  return true;
});

const content = computed(() => {
  return '流程结束';
});

const headerBgc = computed(() => {
  return '#878fa4';
});
</script>

<template>
  <Node :title="config.nodeName" :content="content" placeholder="流程结束" :header-bgc="headerBgc" :is-end="isEnd" />
</template>
