<script setup lang="ts">
import { computed, withDefaults } from 'vue';

interface Props {
  mode?: string;
  placeholder?: string;
  readerMode?: boolean;
  value?: string;
  format?: string;
  type?: string;
}

const emit = defineEmits(['update:value']);

const props = withDefaults(defineProps<Props>(), {
  mode: 'DESIGN',
  placeholder: '请选择日期时间',
  readerMode: false,
  value: ''
});

const _value = computed({
  get() {
    return props.value;
  },
  set(value) {
    emit('update:value', value);
  }
});
</script>

<template>
  <div>
    <div v-if="mode === 'DESIGN'">
      <n-date-picker size="medium" disabled :type="type" :placeholder="placeholder" />
    </div>
    <div v-else>
      <n-date-picker
        v-if="!readerMode"
        v-model:value="_value"
        :value-format="format"
        size="medium"
        clearable
        :type="type"
        :placeholder="placeholder"
      />
      <div v-else v-text="value"></div>
    </div>
  </div>
</template>

<style scoped lang="less">
.n-date-picker {
  width: 220px;
}
</style>
