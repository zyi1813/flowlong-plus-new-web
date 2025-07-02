<script setup lang="ts">
import { computed } from 'vue';
import { useWorkflowStore } from '@/store/modules/workflow';
import Root from '@/views/workflow/designer/common/process/config/RootNodeConfig.vue';
import Approval from '@/views/workflow/designer/common/process/config/ApprovalNodeConfig.vue';
import Cc from '@/views/workflow/designer/common/process/config/CcNodeConfig.vue';
import Condition from '@/views/workflow/designer/common/process/config/ConditionNodeConfig.vue';

const workflowStore = useWorkflowStore();

defineOptions({
  components: {
    Root,
    Approval,
    Cc,
    Condition
  }
});

const componentName = computed<string>(() => {
  switch (workflowStore.selectedNode.type) {
    case 0:
      return 'ROOT';
    case 1:
      return 'Approval';
    case 2:
      return 'Cc';
    case 3:
      return 'Condition';
    default:
      return '';
  }
});
</script>

<template>
  <div>
    <component :is="componentName.toLowerCase()" v-model:config="workflowStore.selectedNode" />
  </div>
</template>

<style scoped lang="less"></style>
