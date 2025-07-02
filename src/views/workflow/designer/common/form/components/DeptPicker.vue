<script setup lang="ts">
import { computed, ref, withDefaults } from 'vue';
import { OrgPicker } from '@/components/OrgPicker';
interface Props {
  mode?: string;
  multiple?: boolean;
  placeholder?: string;
  readerMode?: boolean;
  value?: Array<any>;
  showOrgSelect?: boolean;
}
const props = withDefaults(defineProps<Props>(), {
  mode: 'DESIGN',
  multiple: false,
  placeholder: '请选择部门',
  readerMode: false,
  value: () => [],
  showOrgSelect: false
});
const emit = defineEmits(['update:value']);
const _value = computed({
  get() {
    return props.value;
  },
  set(value) {
    emit('update:value', value);
  }
});
const delDept = i => {
  _value.value.splice(i, 1);
};
const pickerTitle = computed(() => {
  switch (orgPickerType.value) {
    case 'user':
      return '请选择人员';
    case 'dept':
      return '请选择选择部门';
    default:
      return '-';
  }
});
const orgPickerType = ref<string>('dept');
const orgPickerRef = ref<any>();
const orgPickerSelected = ref<Array<any>>([]);
const selected = values => {
  _value.value = values;
};
</script>

<template>
  <div style="max-width: 350px">
    <div v-if="mode === 'DESIGN'">
      <n-button disabled type="primary" size="small" round>选择部门</n-button>
      <span class="placeholder">{{ placeholder }}</span>
    </div>
    <div v-else>
      <n-button
        type="primary"
        size="small"
        round
        @click="
          () => {
            orgPickerRef.show();
          }
        "
      >
        选择部门
      </n-button>
      <OrgPicker
        ref="orgPickerRef"
        :title="pickerTitle"
        multiple
        :type="orgPickerType"
        :selected="orgPickerSelected"
        @confirm="selected"
      />
      <span class="placeholder">{{ placeholder }}</span>
      <div style="margin-top: 5px">
        <n-tag v-for="(dept, i) in _value" :key="i" size="small" style="margin: 5px" closable @close="delDept(i)">
          {{ dept.name }}
        </n-tag>
      </div>
    </div>
  </div>
</template>

<style scoped>
.placeholder {
  margin-left: 10px;
  color: #adabab;
  font-size: 12px;
}
.n-button {
  padding: 0 20px 0 20px;
  font-size: 12px;
  color: #ffffff;
}
</style>
