<script setup lang="ts">
import { computed } from 'vue';
import { useWorkflowStore } from '@/store/modules/workflow';
import Node from './Node.vue';

const workflowStore = useWorkflowStore();

defineOptions({
  name: 'RootNode'
});

const props = defineProps({
  config: {
    type: Object,
    default: () => {
      return {};
    }
  }
});

const content = computed(() => {
  if (props.config.nodeAssigneeList.length > 0) {
    const texts: string[] = [];
    props.config.nodeAssigneeList.forEach((org: any) => texts.push(org.name));
    return String(texts).replaceAll(',', '、');
  }
  return '所有人';
});

const headerBgc = computed(() => {
  if (workflowStore.diagramMode === 'viewer') {
    return props.config.headerBgc as string;
  }
  return '#576a95';
});
</script>

<template>
  <!--  @selected="$emit('selected')"-->
  <!--  @insertNode="(type) => $emit('insertNode', type)"-->
  <Node
    :title="config.nodeName"
    :is-root="true"
    :content="content"
    placeholder="所有人"
    :header-bgc="headerBgc"
    header-icon="x-icon-user"
  />
</template>
