<script setup lang="ts">
import { computed, ref, watch, withDefaults } from 'vue';
import FormDesignRender from './FormDesignRender.vue';

const rules = ref({});

interface Props {
  forms: Array<any>;
  value?: any;
}

function getRules(items) {
  items.forEach(item => {
    if (item.name !== 'SpanLayout' && item.name !== 'Description' && item.props.required) {
      rules.value[item.id] = { required: true, message: `请输入${item.title}` };
    }
    if (item.name == 'SpanLayout') {
      getRules(item.props.items);
    }
  });
}

const emit = defineEmits(['update:value']);

const props = withDefaults(defineProps<Props>(), {
  value: () => {
    return {};
  }
});

watch(
  () => props.forms,
  val => {
    rules.value = {};
    getRules(val);
  },
  { deep: true, immediate: true }
);

const _value: Object | any[] = computed({
  get() {
    return props.value;
  },
  set(val) {
    emit('update:value', val);
  }
});

const formRef = ref();
const validate = callback => {
  let success = true;
  formRef.value.validate(errors => {
    success = !errors;
    if (!errors) {
    }
    callback && callback(success);
  });
};

const reset = () => {
  formRef.value.restoreValidation();
};
defineExpose({
  validate,
  reset
});
</script>

<template>
  <n-form ref="formRef" class="process-form" :label-width="80" label-position="top" :rules="rules" :model="_value">
    <template v-for="(item, index) in forms">
      <n-form-item
        v-if="item.name !== 'SpanLayout' && item.name !== 'Description'"
        :key="index"
        :path="item.id"
        :label="item.title"
      >
        <FormDesignRender v-model:value="_value[item.id]" mode="PC" :config="item" />
      </n-form-item>
      <template v-else>
        <FormDesignRender v-model:value="_value" mode="PC" :config="item" />
      </template>
    </template>
  </n-form>
</template>

<style scoped lang="less"></style>
