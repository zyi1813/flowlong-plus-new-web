<script setup lang="ts">
import { computed, ref, withDefaults } from 'vue';
import { useWorkflowStore } from '@/store/modules/workflow';
import Node from './Node.vue';

type ValidationType = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;

defineOptions({
  name: 'ApprovalNode'
});

const props = withDefaults(defineProps<{ config: any }>(), {
  config: () => {
    return {};
  }
});
const workflowStore = useWorkflowStore();

const showError = ref<boolean>(false);
const errorInfo = ref<string>('');

const checkError = (validationType: ValidationType, err: any[]) => {
  switch (validationType) {
    case 1: // 指定成员
    case 3: // 角色
    case 7: // 部门
    case 8: // 指定候选
      if (props.config.nodeAssigneeList.length > 0) {
        console.log(props.config.nodeAssigneeList.length);
        return true;
      }
      errorInfo.value = '请指定审批人员';
      err.push(`${props.config.nodeName} 未指定审批人员`);
      return false;
    case 2: // 主管
    case 4: // 发起人自选
    case 5: // 发起人自己
    case 6: // 连续多级主管
      return true; // 这些类型不需要指定具体人员
    default:
      // Handle unknown validation types
      return false;
  }
};

// 校验数据配置的合法性
const validate = (err: any[]) => {
  try {
    showError.value = !checkError(props.config.setType, err);
    return showError.value;
  } catch (e) {
    return true;
  }
};
const headerBgc = computed(() => {
  if (workflowStore.diagramMode === 'viewer') {
    return props.config.headerBgc as string;
  }
  return '#ff943e';
});
const content = computed(() => {
  const config = props.config;
  switch (config.setType) {
    case 1: // 指定成员
    case 8: // 指定候选
      if (config.nodeAssigneeList.length > 0) {
        const texts: any = [];
        config.nodeAssigneeList.forEach((org: any) => texts.push(org.name));
        return String(texts).replaceAll(',', '、');
      }
      return '请指定审批人';
    case 3: // 角色
      if (config.nodeAssigneeList.length > 0) {
        const texts: any = [];
        config.nodeAssigneeList.forEach((org: any) => texts.push(org.name));
        return `角色：${String(texts).replaceAll(',', '、')}`;
      }
      return '请指定角色';
    case 7: // 部门
      if (config.nodeAssigneeList.length > 0) {
        const texts: any = [];
        config.nodeAssigneeList.forEach((org: any) => texts.push(org.name));
        return `部门：${String(texts).replaceAll(',', '、')}`;
      }
      return '请指定部门';
    case 2: // 主管
      return '主管审批';
    case 4: // 发起人自选
      return '发起人自选';
    case 5: // 发起人自己
      return '发起人自己';
    case 6: // 连续多级主管
      return '连续多级主管';
    default:
      return '未知设置项';
  }
});

defineExpose({
  validate
});
</script>

<template>
  <Node
    :title="config.nodeName"
    :show-error="showError"
    :content="content"
    :error-info="errorInfo"
    placeholder="请设置审批人"
    :header-bgc="headerBgc"
    header-icon="x-icon-seal"
  />
</template>

<style scoped></style>
