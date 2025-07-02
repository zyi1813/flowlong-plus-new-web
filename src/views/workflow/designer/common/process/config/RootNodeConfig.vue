<script setup lang="ts">
import { ref } from 'vue';
import { OrgPicker } from '@/components/OrgPicker';
import { IconX } from '@/components/Iconx';
import OrgItemsView from '../../../common/OrgItemsView.vue';

defineOptions({
  name: 'Root'
});

const props = defineProps({
  config: {
    default: () => {
      return {
        nodeAssigneeList: []
      };
    },
    type: Object
  }
});

const orgPickerRef = ref();

const selectAssigned = ref<any[]>(props.config.nodeAssigneeList);

const selectOrgClickHandle = () => {
  const { show } = orgPickerRef.value;
  show();
};
const confirmHandle = (data: any[]) => {
  selectAssigned.value.splice(0, selectAssigned.value.length);
  data.forEach(val => selectAssigned.value.push(val));
};
</script>

<template>
  <div>
    <p class="desc">选择能发起该审批的人员/部门，不选则默认开放给所有人</p>
    <n-button class="mt-3" size="tiny" type="primary" round @click="selectOrgClickHandle">
      <template #icon><IconX name="x-icon-plus" color="#fff" size="14" /></template>
      请选择
    </n-button>
    <OrgItemsView v-model:value="selectAssigned" />
    <OrgPicker
      ref="orgPickerRef"
      title="请选择可发起本审批的人员/部门"
      multiple
      :selected="selectAssigned"
      @confirm="confirmHandle"
    />
  </div>
</template>

<style lang="less" scoped>
.desc {
  font-size: small;
  color: #8c8c8c;
}
.org-item {
  margin: 5px;
}
</style>
