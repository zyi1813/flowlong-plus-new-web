<script setup lang="ts">
import { computed, withDefaults } from 'vue';

interface Props {
  mode?: string;
  placeholder?: string;
  readerMode?: boolean;
  enablePrint?: boolean;
  type?: Number;
}

const emit = defineEmits(['update:value']);

const props = withDefaults(defineProps<Props>(), {
  mode: 'DESIGN',
  readerMode: false,
  placeholder: '请输入数值',
  enablePrint: true,
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
      <n-input size="medium" disabled :placeholder="placeholder" type="number" />
    </div>
    <div v-else>
      <n-input
        v-if="!readerMode"
        v-model:value="_value"
        size="medium"
        clearable
        :placeholder="placeholder"
        type="number"
      />
      <div v-else v-text="_value"></div>
    </div>
  </div>
</template>

<style scoped lang="less"></style>
