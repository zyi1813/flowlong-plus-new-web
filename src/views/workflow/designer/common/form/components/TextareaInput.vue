<script setup lang="ts">
import { computed, withDefaults } from 'vue';

interface Props {
  mode?: string;
  placeholder?: string;
  readerMode?: boolean;
  value?: string;
  showChinese?: boolean;
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
      <n-input size="medium" disabled :placeholder="placeholder" show-word-limit :rows="2" type="textarea" />
    </div>
    <div v-else>
      <n-input
        v-if="!readerMode"
        v-model:value="_value"
        size="medium"
        clearable
        :maxlength="255"
        :placeholder="placeholder"
        show-word-limit
        :rows="3"
        type="textarea"
      />
      <div v-else v-text="_value"></div>
    </div>
  </div>
</template>

<style scoped lang="less"></style>
