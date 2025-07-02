<script lang="ts" setup>
import { onMounted, ref } from 'vue';
import { useMessage } from 'naive-ui';
import { createFormGroup, updateFormGroup } from '@/service/api/workflow/designer';
import type { formParamsType } from './types';

const rules = {
  name: {
    required: true,
    message: '分组名称不能为空',
    trigger: 'blur'
  }
};

const emit = defineEmits(['change']);

defineProps({
  title: {
    type: String,
    default: '创建分组'
  },
  width: {
    type: Number,
    default: 450
  }
});

const defaultValueRef = () => ({
  id: null,
  name: ''
});

const message = useMessage();
const formRef: any = ref(null);
const isModal = ref(false);
const subLoading = ref(false);

const formParams = ref<formParamsType>(defaultValueRef());

function openModal({ id, name }) {
  formParams.value = Object.assign(formParams.value, defaultValueRef());
  if (id) {
    formParams.value.id = id;
    formParams.value.name = name;
  }
  isModal.value = true;
}

function closeModal() {
  isModal.value = false;
}

function formSubmit() {
  formRef.value.validate(errors => {
    if (!errors) {
      if (formParams.value.id) {
        updateFormGroup(formParams.value).then(_ => {
          message.success('编辑成功');
          emit('change');
          handleReset();
          closeModal();
        });
      } else {
        createFormGroup(formParams.value).then(_ => {
          message.success('添加成功');
          emit('change');
          handleReset();
          closeModal();
        });
      }
    } else {
      message.error('请填写完整信息');
    }
  });
}

function handleReset() {
  formRef.value.restoreValidation();
  formParams.value = Object.assign(formParams.value, defaultValueRef());
}

const handleClose = () => {
  isModal.value = false;
};
onMounted(() => {});

defineExpose({
  openModal,
  closeModal
});
</script>

<template>
  <n-modal v-model:show="isModal">
    <n-card
      style="width: 60%; position: fixed; left: 0; right: 0; top: 25%"
      :title="title"
      :segmented="{
        content: true,
        footer: 'soft'
      }"
      closable
      @close="handleClose"
    >
      <n-form
        ref="formRef"
        style="padding: 0 60px"
        :model="formParams"
        :rules="rules"
        label-placement="left"
        :label-width="80"
      >
        <n-form-item label="分组名称" path="name">
          <n-input v-model:value="formParams.name" placeholder="请输入分组名称" />
        </n-form-item>
      </n-form>

      <template #footer>
        <n-space justify="end">
          <n-button @click="handleReset">重置</n-button>
          <n-button type="primary" :loading="subLoading" @click="formSubmit">提交</n-button>
        </n-space>
      </template>
    </n-card>
  </n-modal>
</template>
