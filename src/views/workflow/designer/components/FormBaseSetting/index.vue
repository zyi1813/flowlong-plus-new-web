<script setup lang="ts">
import { onMounted, ref, withDefaults } from 'vue';
import { getGroupOptions } from '@/service/api/workflow/designer';
import { useWorkflowStore } from '@/store/modules/workflow';

interface Props {
  groupId: string | number | null;
  isEdit: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  groupId: null
});

const workflowStore = useWorkflowStore();

const rules = {
  templateName: {
    required: true,
    message: '流程名称不能为空',
    trigger: 'blur'
  },
  templateKey: {
    required: true,
    message: '标识不能为空',
    trigger: 'blur'
  },
  groupId: {
    type: 'string',
    required: true,
    message: '请选择分组',
    trigger: 'blur'
  }
};
const groupOptions = ref();

const validate = () => {
  const err: string[] = [];
  if (!workflowStore.design.templateName) {
    err.push('流程名称未设置');
  }
  if (!workflowStore.design.templateKey) {
    err.push('流程标识未设置');
  }
  if (!workflowStore.design.groupId) {
    err.push('表单分组未设置');
  }
  return err;
};

function getRandom(min, max) {
  return Math.round(Math.random() * (max - min) + min);
}

function getCode() {
  let code = '';
  for (let i = 0; i < 6; i++) {
    const type = getRandom(1, 3);
    switch (type) {
      case 1:
        code += String.fromCharCode(getRandom(48, 57)); // 数字
        break;
      case 2:
        code += String.fromCharCode(getRandom(65, 90)); // 大写字母
        break;
      case 3:
        code += String.fromCharCode(getRandom(97, 122)); // 小写字母
        break;
    }
  }
  return code;
}

onMounted(() => {
  getGroupOptions().then(res => {
    groupOptions.value = res.data;
    workflowStore.design.groupId = props.groupId;
    if (!props.isEdit) {
      workflowStore.design.templateKey = getCode();
    }
  });
});

defineExpose({
  validate
});
</script>

<template>
  <div class="form_base_setting">
    <n-form ref="formRef" :model="workflowStore.design" :rules="rules" label-placement="left" :label-width="80">
      <n-form-item label="流程名称" path="templateName">
        <n-input v-model:value="workflowStore.design.templateName" placeholder="请输入流程名称" />
      </n-form-item>
      <n-form-item label="标识" path="templateKey">
        <n-input
          v-model:value="workflowStore.design.templateKey"
          placeholder="请输入标识"
          :readonly="isEdit"
          :disabled="isEdit"
        />
      </n-form-item>
      <n-form-item label="所属分组" path="groupId">
        <n-select v-model:value="workflowStore.design.groupId" placeholder="请选择分组" :options="groupOptions" />
      </n-form-item>
      <n-form-item label="备注说明" path="remark">
        <n-input v-model:value="workflowStore.design.remark" type="textarea" placeholder="备注说明..." />
      </n-form-item>
    </n-form>
  </div>
</template>

<style scoped lang="less">
.form_base_setting {
  width: 600px;
  height: calc(100vh - 220px);
}
</style>
