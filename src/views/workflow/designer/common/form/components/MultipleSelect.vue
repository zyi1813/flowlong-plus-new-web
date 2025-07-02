<script setup lang="ts">
import { computed, withDefaults } from 'vue';
const emit = defineEmits(['update:value']);
interface Props {
  mode?: string;
  value?: string[];
  placeholder?: string;
  expanding?: boolean;
  options?: [];
  readerMode?: boolean;
}
const props = withDefaults(defineProps<Props>(), {
  mode: 'DESIGN',
  value: () => {
    return [];
  },
  placeholder: '请选择选项',
  readerMode: false,
  expanding: false
});

const _value = computed({
  get() {
    return props.value;
  },
  set(value) {
    emit('update:value', value);
  }
});

const _options = computed(() => {
  return props.options?.map(op => {
    return {
      label: op,
      value: op
    };
  });
});
</script>

<template>
  <div>
    <div v-if="mode === 'DESIGN'">
      <n-select
        v-if="!expanding"
        v-model:value="_value"
        class="max-fill"
        size="medium"
        disabled
        :placeholder="placeholder"
      />
      <n-checkbox-group v-else v-model:value="_value">
        <n-checkbox v-for="(op, index) in options" :key="index" disabled :label="op">{{ op }}</n-checkbox>
      </n-checkbox-group>
    </div>
    <div v-else>
      <template v-if="!readerMode">
        <n-select v-if="!expanding" v-model:value="_value" multiple :options="_options" class="input1" />
        <!-- <div>{{ options }}{{ expanding }}</div> -->
        <n-checkbox-group v-else v-model:value="_value">
          <n-checkbox v-for="(op, index) in options" :key="index" :value="op">{{ op }}</n-checkbox>
        </n-checkbox-group>
      </template>
      <template v-else>
        <div v-text="_value"></div>
      </template>
    </div>
  </div>
</template>

<style scoped lang="less">
.input1 {
  width: 200px;
}
</style>
