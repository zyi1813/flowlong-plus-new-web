<script setup lang="ts">
import { ref } from 'vue';
import OrgItemsView from '@/views/workflow/designer/common/OrgItemsView.vue';
import { OrgPicker } from '@/components/OrgPicker';

const orgPickerRef = ref<any>();
const props = defineProps<{ config: any }>();

const nodeAssigneeList = ref<any[]>(props.config.nodeAssigneeList);

const confirmHandle = (data: any[]) => {
  nodeAssigneeList.value.splice(0, nodeAssigneeList.value.length);
  data.forEach(val => nodeAssigneeList.value.push(val));
};
</script>

<template>
  <div class="container">
    <NButton
      size="tiny"
      type="primary"
      round
      @click="
        () => {
          orgPickerRef.show();
        }
      "
    >
      <template #icon>
        <i class="x-iconfont x-icon-plus"></i>
      </template>
      选择抄送人
    </NButton>
    <OrgItemsView v-model:value="nodeAssigneeList" />
    <OrgPicker ref="orgPickerRef" multiple :selected="nodeAssigneeList" @confirm="confirmHandle" />
  </div>
</template>

<style scoped lang="less"></style>
