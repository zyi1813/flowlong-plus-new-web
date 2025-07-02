<script setup lang="ts">
import { computed, withDefaults } from 'vue';

interface Props {
  mode?: string;
  placeholder?: Array<string>;
  readerMode?: boolean;
  value?: string;
  showLength?: boolean;
  timeLength?: string;
  format?: string;
  type?: string;
}

const emit = defineEmits(['update:value']);

const props = withDefaults(defineProps<Props>(), {
  mode: 'DESIGN',
  placeholder: () => {
    return ['开始时间', '结束时间'];
  },
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
      <n-date-picker
        size="medium"
        disabled
        type="datetimerange"
        :start-placeholder="placeholder[0]"
        :end-placeholder="placeholder[1]"
      />
    </div>
    <div v-else>
      <n-date-picker
        v-if="!readerMode"
        v-model:value="_value"
        size="medium"
        type="datetimerange"
        :start-placeholder="placeholder[0]"
        :end-placeholder="placeholder[1]"
      />
      <div v-else v-text="value"></div>
    </div>
  </div>
</template>

<style scoped lang="less"></style>
