<script setup lang="ts">
import { computed } from 'vue';
import { useWorkflowStore } from '@/store/modules/workflow';
import TextInput from './config/TextInputConfig.vue';
import TextareaInput from './config/TextareaInputConfig.vue';
import NumberInput from './config/NumberInputConfig.vue';
import AmountInput from './config/AmountInputConfig.vue';
import SelectInput from './config/SelectInputConfig.vue';
import MultipleSelect from './config/MultipleSelectConfig.vue';
import DateTime from './config/DateTimeConfig.vue';
import DateTimeRange from './config/DateTimeRangeConfig.vue';
import ImageUpload from './config/ImageUploadConfig.vue';
import FileUpload from './config/FileUploadConfig.vue';
import UserPicker from './config/UserPickerConfig.vue';
import Description from './config/DescriptionConfig.vue';
import DeptPicker from './config/DeptPickerConfig.vue';
defineOptions({
  components: {
    TextInput,
    TextareaInput,
    NumberInput,
    AmountInput,
    SelectInput,
    DateTime,
    DateTimeRange,
    ImageUpload,
    FileUpload,
    MultipleSelect,
    Description,
    UserPicker,
    DeptPicker
  }
});
const workflowStore = useWorkflowStore();

const form: any = computed(() => {
  return workflowStore.selectFormItem;
});
</script>

<template>
  <n-form v-if="form.name !== 'SpanLayout'">
    <n-form-item v-if="false" label="表单标识">
      <n-input v-model:value="form.id" disabled size="small" clearable />
    </n-form-item>
    <n-form-item label="表单名称">
      <n-input v-model:value="form.title" size="small" clearable />
    </n-form-item>
    <component :is="form.name" v-model:value="form.props" />
    <n-form-item label="必填项">
      <n-switch v-model:value="form.props.required" />
    </n-form-item>
    <n-form-item label="可打印">
      <n-switch v-model:value="form.props.enablePrint" />
    </n-form-item>
  </n-form>
  <n-empty v-else description="当前组件不支持配置" />
</template>

<style scoped lang="less"></style>
