<script setup lang="ts">
import { computed, withDefaults } from 'vue';
const emit = defineEmits(['input']);

const props = withDefaults(defineProps<{ value: Array<{ type: 'dept' | 'user' | 'role'; name: string }> }>(), {});

const _value = computed({
  get() {
    return props.value;
  },
  set(val) {
    emit('input', val);
  }
});

const removeOrgItem = (index: number) => {
  _value.value.splice(index, 1);
};

const getTagType = (type: string) => {
  switch (type) {
    case 'dept':
      return 'default';
    case 'user':
      return 'info';
    case 'role':
      return 'success';
    default:
      return 'info';
  }
};
</script>

<template>
  <div style="margin-top: 10px">
    <n-tag
      v-for="(org, index) in _value"
      :key="index"
      style="margin: 5px"
      :type="getTagType(org.type)"
      closable
      size="small"
      @close="removeOrgItem(index)"
    >
      {{ org.name }}
    </n-tag>
  </div>
</template>
