<script setup lang="ts">
import { computed, withDefaults } from 'vue';

interface Props {
  color?: string;
  mode?: string;
  placeholder?: string;
  readerMode?: boolean;
  value?: string;
}

const emit = defineEmits(['update:value']);

const props = withDefaults(defineProps<Props>(), {
  color: '#868686',
  mode: 'DESIGN',
  placeholder: '只是一段说明文字',
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
  <div :style="{ color: color }">
    <!-- <n-icon class="x-icon-warning-outline" /> -->
    <span>{{ placeholder }}</span>
  </div>
</template>

<style scoped lang="less"></style>
