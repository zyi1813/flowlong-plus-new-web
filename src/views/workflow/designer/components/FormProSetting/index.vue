<script setup lang="ts">
import { computed } from 'vue';
import { useWorkflowStore } from '@/store/modules/workflow';

const workflowStore = useWorkflowStore();

const setting = computed(() => workflowStore.design.settings);

const validate = () => {
  return [];
};

defineExpose({
  validate
});
</script>

<template>
  <div class="pro-setting">
    <n-form label-position="top" label-width="80px">
      <n-form-item label="审批同意时是否签字(未完成)">
        <div>
          <n-switch v-model:value="setting.sign" :unchecked-value="false" :checked-value="true">
            <template #checked>是</template>
            <template #unchecked>否</template>
          </n-switch>
          <div class="sign-tip">
            如果此处设置为
            <b>需要签字</b>
            ，则所有审批人“同意时”
            <b>必须签字</b>
          </div>
        </div>
      </n-form-item>
    </n-form>
  </div>
</template>

<style scoped lang="less">
.pro-setting {
  overflow: auto;
  width: 600px;
  height: calc(100vh - 220px);
  background: #ffffff;
  margin: 10px auto 0;
  padding: 15px 20px;

  .sign-tip {
    color: #949495;
    font-size: small;
    margin-top: 20px;
  }
}
</style>
