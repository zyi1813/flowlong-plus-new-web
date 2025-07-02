<script setup lang="ts">
import { computed, ref, watch, nextTick } from 'vue';
import { useWorkflowStore } from '@/store/modules/workflow';
import { OrgPicker } from '@/components/OrgPicker';
import OrgItemsView from '@/views/workflow/designer/common/OrgItemsView.vue';

const workflowStore = useWorkflowStore();

const props = defineProps<{ config: any }>();

const orgPickerRef = ref();
const orgPickerSelected = ref<Array<any>>([]);
const orgPickerType = ref<string>('user');
const approvalTypes = ref<Array<{ name: string; type: number }>>([
  { name: '指定成员', type: 1 },
  // { name: '主管', type: 2 },
  { name: '角色', type: 3 },
  // { name: '发起人自选', type: 4 },
  // { name: '发起人自己', type: 5 },
  // { name: '连续多级主管', type: 6 },
  { name: '部门', type: 7 },
  // { name: '指定候选', type: 8 }
]);

const nodeProps: any = workflowStore.selectedNode;

// 监听setType变化，初始化nodeAssigneeList
let lastSetType = nodeProps.setType;
watch(() => nodeProps.setType, (newSetType: number) => {
  if (newSetType !== lastSetType) {
    // 只有类型真正变化时才清空
    if (nodeProps.nodeAssigneeList) {
      nodeProps.nodeAssigneeList.length = 0;
    }
    lastSetType = newSetType;
  }
  // 根据setType自动设置orgPickerType
  switch (newSetType) {
    case 1: // 指定成员
    case 8: // 指定候选
      orgPickerType.value = 'user';
      break;
    case 3: // 角色
      orgPickerType.value = 'role';
      break;
    case 7: // 部门
      orgPickerType.value = 'dept';
      break;
    default:
      orgPickerType.value = 'user';
      break;
  }
}, { immediate: true });

const pickerTitle = computed(() => {
  switch (orgPickerType.value) {
    case 'user':
      return '请选择人员';
    case 'role':
      return '请选择角色';
    case 'dept':
      return '请选择部门';
    default:
      return '-';
  }
});

const showMode = computed(() => {
  console.log("nodeProps.setType:",nodeProps.setType)
  switch (nodeProps.setType) {
    case 1: // 指定成员
      return nodeProps.nodeAssigneeList.length > 0;
    case 3: // 角色
      return nodeProps.nodeAssigneeList.length > 0;
    case 7: // 部门
      return nodeProps.nodeAssigneeList.length > 0;
    case 8: // 指定候选
      return nodeProps.nodeAssigneeList.length > 0;
    default:
      return false;
  }
});

const selectUser = () => {
  orgPickerSelected.value = [...nodeProps.nodeAssigneeList];
  orgPickerType.value = 'user';
  nextTick(() => {
    orgPickerRef.value.show();
  });
};

const selectRole = () => {
  orgPickerSelected.value = [...nodeProps.nodeAssigneeList];
  orgPickerType.value = 'role';
  nextTick(() => {
    orgPickerRef.value.show();
  });
};

const selectDept = () => {
  orgPickerSelected.value = [...nodeProps.nodeAssigneeList];
  orgPickerType.value = 'dept';
  nextTick(() => {
    orgPickerRef.value.show();
  });
};

const selected = (select: any) => {
  // 清空当前选择
  orgPickerSelected.value.length = 0;
  select.forEach((val: any) => orgPickerSelected.value.push(val));

  // 更新nodeProps中的nodeAssigneeList
  nodeProps.nodeAssigneeList.length = 0;
  select.forEach((val: any) => {
    nodeProps.nodeAssigneeList.push({
      id: val.id,
      name: val.name,
      type: val.type
    });
  });
};
</script>

<template>
  <div>
    <n-form :label-width="90" size="small">
      <n-form-item label="⚙ 选择审批对象" class="approval-user">
        <n-radio-group v-model:value="nodeProps.setType">
          <n-space>
            <n-radio v-for="item in approvalTypes" :key="item.name" :value="item.type">
              {{ item.name }}
            </n-radio>
          </n-space>
        </n-radio-group>

        <div v-if="nodeProps.setType === 1" class="mt-4">
          <NButton size="tiny" type="primary" round @click="selectUser">
            <template #icon>
              <i class="x-iconfont x-icon-plus"></i>
            </template>
            选择人员
          </NButton>
          <OrgItemsView v-model:value="nodeProps.nodeAssigneeList" />
        </div>

        <div v-if="nodeProps.setType === 3" class="mt-4">
          <NButton size="tiny" type="primary" round @click="selectRole">
            <template #icon>
              <i class="x-iconfont x-icon-plus"></i>
            </template>
            选择角色
          </NButton>
          <OrgItemsView v-model:value="nodeProps.nodeAssigneeList" />
        </div>

        <div v-if="nodeProps.setType === 7" class="mt-4">
          <NButton size="tiny" type="primary" round @click="selectDept">
            <template #icon>
              <i class="x-iconfont x-icon-plus"></i>
            </template>
            选择部门
          </NButton>
          <OrgItemsView v-model:value="nodeProps.nodeAssigneeList" />
        </div>

        <div v-if="nodeProps.setType === 8" class="mt-4">
          <NButton size="tiny" type="primary" round @click="selectUser">
            <template #icon>
              <i class="x-iconfont x-icon-plus"></i>
            </template>
            选择候选人员
          </NButton>
          <OrgItemsView v-model:value="nodeProps.nodeAssigneeList" />
        </div>
      </n-form-item>

      <div v-if="showMode">
        <n-divider />
        <n-form-item label="多人审批时审批方式">
          <n-radio-group v-model:value="nodeProps.examineMode" class="flex flex-col">
            <n-radio :value="1" class="mb-2">按顺序依次审批</n-radio>
            <n-radio :value="2" class="mb-2">会签（可同时审批，每个人必须同意）</n-radio>
            <n-radio :value="3" class="mb-2">或签（有一人同意即可）</n-radio>
          </n-radio-group>
        </n-form-item>
      </div>

      <n-divider>高级设置</n-divider>
      <div class="my-3">
        超时自动审批:
        <n-switch v-model:value="nodeProps.termAuto" />
      </div>
      <n-form-item v-if="nodeProps.termAuto" label="审批期限(小时)">
        <div class="flex flex-col">
          <div class="mt-2 flex">
            <n-input-number v-model:value="nodeProps.term" style="width: 180px" placeholder="时长" size="small" />
          </div>
          <div class="mt-2 flex">
            <span class="mr-3">超时策略</span>
            <n-radio-group v-model:value="nodeProps.termMode" class="flex">
              <n-radio :value="0" class="mb-2">自动通过</n-radio>
              <n-radio :value="1" class="mb-2">自动拒绝</n-radio>
            </n-radio-group>
          </div>
        </div>
      </n-form-item>
      <n-form-item label="驳回策略">
        <n-radio-group v-model:value="nodeProps.rejectStrategy">
          <n-radio :value="4">直接结束流程</n-radio>
          <n-radio :value="2">驳回到上级审批节点</n-radio>
          <n-radio :value="1">驳回到发起人</n-radio>
        </n-radio-group>
      </n-form-item>
    </n-form>
    <OrgPicker
      ref="orgPickerRef"
      :title="pickerTitle"
      multiple
      :type="orgPickerType"
      :selected="orgPickerSelected"
      @confirm="selected"
    />
  </div>
</template>

<style scoped lang="less">
.approval-user {
  :deep(.n-form-item-blank) {
    display: block;
  }
}
.approve-end {
  position: relative;
  :deep(.n-radio-group) {
    width: 160px;
  }

  .n-radio {
    margin-bottom: 8px;
    width: 100%;
  }

  .approve-end-leave {
    display: flex;
    position: absolute;
    bottom: 8px;
    left: 124px;
    :deep(.n-input) {
      .n-input-wrapper {
        width: 90px;
      }
    }
  }
}

.approval-leader {
  :deep(.n-form-item-blank) {
    .content {
      display: flex;
    }
    .n-input {
      .n-input-wrapper {
        width: 90px;
      }
    }
  }
}
</style>
