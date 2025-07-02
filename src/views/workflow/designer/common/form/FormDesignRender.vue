<script setup lang="ts">
import { computed, defineOptions, withDefaults } from 'vue';
import TextInput from '@/views/workflow/designer/common/form/components/TextInput.vue';
import TextareaInput from '@/views/workflow/designer/common/form/components/TextareaInput.vue';
import AmountInput from './components/AmountInput.vue';
import SelectInput from './components/SelectInput.vue';
import MultipleSelect from './components/MultipleSelect.vue';
import NumberInput from './components/NumberInput.vue';
import DateTime from './components/DateTime.vue';
import DateTimeRange from './components/DateTimeRange.vue';
import ImageUpload from './components/ImageUpload.vue';
import FileUpload from './components/FileUpload.vue';
import Description from './components/Description.vue';
import UserPicker from './components/UserPicker.vue';
import DeptPicker from './components/DeptPicker.vue';
import SpanLayout from './components/SpanLayout.vue';
defineOptions({
  components: {
    TextInput,
    TextareaInput,
    AmountInput,
    SelectInput,
    NumberInput,
    MultipleSelect,
    DateTime,
    DateTimeRange,
    ImageUpload,
    FileUpload,
    Description,
    UserPicker,
    DeptPicker,
    SpanLayout
  }
});

interface Props {
  mode?: string;
  config?: any;
  value?: any;
}

const emit = defineEmits(['update:value']);

const props = withDefaults(defineProps<Props>(), {
  mode: 'DESIGN',
  config: () => {
    return {};
  },
  value: null
});

const _value = computed({
  get() {
    const valueType = props.config.valueType;
    return valueType === 'Number' && props.value ? Number(props.value) : props.value;
  },
  set(val) {
    const valueType = props.config.valueType;
    const value = valueType === 'Number' ? Number(val) : val;
    emit('update:value', value);
  }
});

</script>

<template>
  <component :is="config.name" ref="form" v-bind="config.props" v-model:value="_value" :mode="mode" />
</template>

<style lang="less" scoped></style>
