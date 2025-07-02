<script setup lang="ts">
import draggable from 'vuedraggable';
import { computed, ref, withDefaults } from 'vue';
import { useWorkflowStore } from '@/store/modules/workflow';
import GroupItem from './ConditionGroupItemConfig.vue';

const workflowStore = useWorkflowStore();

const selectedNode = workflowStore.selectedNode;

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

// 条件节点
const prioritySortList = computed(() => {
  const node = workflowStore.nodeMap.get(selectedNode.parentId);
  if (node) {
    return node.conditionNodes || [];
  }
  return [];
});

const nowNodeLeave = computed(() => {
  return prioritySortList.value.indexOf(selectedNode);
});

const addConditionGroup = () => {
  const conditionList = props.config.conditionList;
  conditionList.push([]);

  emit('update:config', {
    ...props.config,
    conditionList
  });
};
</script>

<template>
  <div>
    <div class="mb-3">
      <span class="mr-3">调整优先级</span>
      <n-popover placement="right" :width="250" trigger="click">
        <div style="font-size: 16px">拖拽条件调整优先级顺序</div>
        <draggable
          style="width: 100%; min-height: 25px"
          :list="prioritySortList"
          item-key="id"
          group="from"
          :options="sortOption"
        >
          <template #item="{ element, index }">
            <div
              v-if="index != prioritySortList.length - 1"
              class="drag-no-choose"
              :class="{ 'drag-hover': element.id === selectedNode.id }"
            >
              <n-ellipsis style="width: 160px" tooltip>{{ element.nodeName }}</n-ellipsis>
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
    </div>
    <div class="text-gray-700 mb-3 flex">
      <span class="mr-1">满足以下条件时进入当前分支</span>
      <n-tooltip trigger="hover">
        <template #trigger>
          <i class="x-iconfont x-icon-line-tips"></i>
        </template>
        只有必填选项控件才能作为审批条件
      </n-tooltip>
    </div>

    <GroupItem />
    <div class="flex justify-center">
      <n-button type="default" style="width: 96%" size="small" @click="addConditionGroup">
        <template #icon>
          <i class="x-icon-plus x-iconfont"></i>
        </template>
        添加条件组
      </n-button>
    </div>
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
