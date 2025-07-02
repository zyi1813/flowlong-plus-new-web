<script setup lang="ts">
import draggable from 'vuedraggable';
import { computed, ref, withDefaults } from 'vue';
import { useWorkflowStore } from '@/store/modules/workflow';
import GroupItem from './InclusiveGroupItemConfig.vue';

const workflowStore = useWorkflowStore();

const selectedNode = workflowStore.selectedNode;

// const showOrgSelect = ref(false);

const emit = defineEmits(['update:config']);

const props = withDefaults(defineProps<{ config: any }>(), {
  config: () => {
    return {};
  }
});

const sortOption = ref<any>({
  animation: 300,
  chosenClass: 'choose',
  scroll: true,
  sort: true
});

// const selectedAssignedUser = computed({
//   get: () => {
//     return props.config.assignedUser;
//   },
//   set: (val) => {
//     emit('update:config', {
//       ...props.config,
//       assignedUser: val,
//     });
//   },
// });

const groupsType = computed({
  get: () => {
    return props.config.groupsType;
  },
  set: val => {
    emit('update:config', {
      ...props.config,
      groupsType: val
    });
  }
});

const expression = computed({
  get: () => {
    return props.config.expression;
  },
  set: val => {
    emit('update:config', {
      ...props.config,
      expression: val
    });
  }
});

// 条件节点
const prioritySortList = computed(() => {
  const node = workflowStore.nodeMap.get(selectedNode.parentId);
  if (node) {
    return node.branchs || [];
  }
  return [];
});

const nowNodeLeave = computed(() => {
  return prioritySortList.value.indexOf(selectedNode);
});

// const selected = (data: any[]) => {
//   showOrgSelect.value = false;
//   data.forEach((val) => selectedAssignedUser.value.push(val));
// };

const addConditionGroup = () => {
  const groups = props.config.groups;
  groups.push({
    cids: [],
    groupType: 'OR',
    conditions: []
  });

  emit('update:config', {
    ...props.config,
    groups
  });
};
</script>

<template>
  <div>
    <n-form label-width="100px">
      <n-form-item label="调整优先级" prop="level">
        <n-popover placement="right" width="250" trigger="click">
          <div style="font-size: 16px">拖拽条件调整优先级顺序</div>
          <draggable
            style="width: 100%; min-height: 25px"
            :list="prioritySortList"
            item-key="id"
            group="from"
            :options="sortOption"
          >
            <template #item="{ element, index }">
              <div class="drag-no-choose" :class="{ 'drag-hover': element.id === selectedNode.id }">
                <n-ellipsis style="width: 160px" tooltip>{{ element.name }}</n-ellipsis>
                <div>优先级 {{ index + 1 }}</div>
              </div>
            </template>
          </draggable>
          <template #trigger>
            <n-button icon="el-icon-sort" size="tiny">
              <template #icon>
                <i class="x-icon-sort x-iconfont"></i>
              </template>
              第{{ nowNodeLeave + 1 }}级
            </n-button>
          </template>
        </n-popover>
      </n-form-item>
      <n-form-item label="条件组关系" label-width="150px">
        <n-switch
          v-model:value="groupsType"
          active-color="#409EFF"
          inactive-color="#c1c1c1"
          checked-value="AND"
          unchecked-value="OR"
        >
          <template #checked>且</template>
          <template #unchecked>或</template>
        </n-switch>
      </n-form-item>
      <n-form-item label="条件组表达式">
        <div>
          <n-input v-model:value="expression" size="small" placeholder="输入条件组关系表达式  &为与，|为或" />
          <span class="item-desc mt-2 inline-block">使用表达式构建复杂逻辑，例如: (A & B) | C</span>
        </div>
      </n-form-item>
    </n-form>
    <div>
      <n-button type="primary" size="tiny" style="margin: 0 15px 15px 0" round @click="addConditionGroup">
        <template #icon>
          <i class="x-icon-plus x-iconfont"></i>
        </template>
        添加条件组
      </n-button>
      <span>只有必填选项才能作为审批条件</span>
    </div>
    <GroupItem />
  </div>
</template>

<style scoped lang="less">
.sortable-chosen {
  border-radius: 5px;
  margin-top: 2px;
  background: #f4f4f4;
  border: 1px dashed #1890ff !important;
}

.drag-hover {
  color: #1890ff;
}

.drag-no-choose {
  cursor: move;
  background: #f8f8f8;
  border-radius: 5px;
  margin: 5px 0;
  height: 25px;
  line-height: 25px;
  padding: 5px 10px;
  border: 1px solid #ffffff;

  div {
    display: inline-block;
    font-size: small;
  }

  div:nth-child(2) {
    float: right;
  }
}
</style>
