<script setup lang="ts">
import { computed, withDefaults } from 'vue';

interface Props {
  mode?: string;
  placeholder?: string;
  readerMode?: boolean;
  value?: string;
}

const emit = defineEmits(['update:value']);

const props = withDefaults(defineProps<Props>(), {
  mode: 'DESIGN',
  placeholder: '请输入内容',
  readerMode: false,
  value: ''
});

const _value = computed({
  get() {
    return props.value;
  },
  set(val) {
    emit('update:value', val);
  }
});
</script>

<template>
  <div>
    <div v-if="mode === 'DESIGN'">
      <n-input disabled :placeholder="placeholder" />
    </div>
    <div v-else>
      <n-input v-if="!readerMode" v-model:value="_value" clearable :placeholder="placeholder" />
      <div v-else v-text="_value"></div>
    </div>
  </div>
</template>

<style scoped lang="less"></style>
