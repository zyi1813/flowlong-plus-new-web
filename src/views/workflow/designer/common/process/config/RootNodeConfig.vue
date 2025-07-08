<script setup lang="ts">
import { ref, watch, nextTick } from 'vue';
import { OrgPicker } from '@/components/OrgPicker';
import OrgItemsView from '../../../common/OrgItemsView.vue';

const props = defineProps({
  config: {
    default: () => {
      return {
        nodeAssigneeList: [],
        setType: 1
      };
    },
    type: Object
  }
});

const orgPickerRef = ref();
const orgPickerSelected = ref<any[]>([]);
const orgPickerType = ref<string>('user');
const approvalTypes = ref<Array<{ name: string; type: number }>>([
  { name: '指定成员', type: 1 },
  { name: '角色', type: 3 },
  { name: '部门', type: 7 }
]);

const setType = ref(props.config.setType ?? 1);

// 监听setType变化，初始化nodeAssigneeList和选择器类型
let lastSetType = setType.value;
watch(setType, (newSetType: number) => {
  props.config.setType = newSetType;
  if (newSetType !== lastSetType) {
    // 只有类型真正变化时才清空
    if (props.config.nodeAssigneeList) {
      props.config.nodeAssigneeList.length = 0;
    }
    lastSetType = newSetType;
  }
  // 根据setType自动设置orgPickerType
  switch (newSetType) {
    case 1: // 指定成员
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

const selectUser = () => {
  orgPickerSelected.value = [...props.config.nodeAssigneeList];
  orgPickerType.value = 'user';
  nextTick(() => {
    orgPickerRef.value.show();
  });
};
const selectRole = () => {
  orgPickerSelected.value = [...props.config.nodeAssigneeList];
  orgPickerType.value = 'role';
  nextTick(() => {
    orgPickerRef.value.show();
  });
};
const selectDept = () => {
  orgPickerSelected.value = [...props.config.nodeAssigneeList];
  orgPickerType.value = 'dept';
  nextTick(() => {
    orgPickerRef.value.show();
  });
};

const confirmHandle = (data: any[]) => {
  props.config.nodeAssigneeList.length = 0;
  data.forEach(val => props.config.nodeAssigneeList.push(val));
};
</script>

<template>
  <div>
    <p class="desc">选择能发起该审批的人员/角色/部门，不选则默认开放给所有人</p>
    <n-form :label-width="90" size="small">
      <n-form-item label="选择发起对象" class="approval-user">
        <n-radio-group v-model:value="setType">
          <n-space>
            <n-radio v-for="item in approvalTypes" :key="item.name" :value="item.type">
              {{ item.name }}
            </n-radio>
          </n-space>
        </n-radio-group>
        <div v-if="setType === 1" class="mt-4">
          <n-button size="tiny" type="primary" round @click="selectUser">
            <template #icon>
              <i class="x-iconfont x-icon-plus"></i>
            </template>
            选择人员
          </n-button>
          <OrgItemsView v-model:value="props.config.nodeAssigneeList" />
        </div>
        <div v-if="setType === 3" class="mt-4">
          <n-button size="tiny" type="primary" round @click="selectRole">
            <template #icon>
              <i class="x-iconfont x-icon-plus"></i>
            </template>
            选择角色
          </n-button>
          <OrgItemsView v-model:value="props.config.nodeAssigneeList" />
        </div>
        <div v-if="setType === 7" class="mt-4">
          <n-button size="tiny" type="primary" round @click="selectDept">
            <template #icon>
              <i class="x-iconfont x-icon-plus"></i>
            </template>
            选择部门
          </n-button>
          <OrgItemsView v-model:value="props.config.nodeAssigneeList" />
        </div>
      </n-form-item>
    </n-form>
    <OrgPicker
      ref="orgPickerRef"
      :title="orgPickerType === 'user' ? '请选择人员' : orgPickerType === 'role' ? '请选择角色' : '请选择部门'"
      multiple
      :type="orgPickerType"
      :selected="props.config.nodeAssigneeList"
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
