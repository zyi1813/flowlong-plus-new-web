<script setup lang="ts">
import { computed, ref } from 'vue';
import { useWorkflowStore } from '@/store/modules/workflow';
import { ValueType } from '../../form/ComponentsConfigExport';
const workflowStore = useWorkflowStore();

const selectedNode: any = workflowStore.selectedNode;

const delGroup = index => {
  selectedNode.conditionList.splice(index, 1);
};

const addCondition = (group: any[]) => {
  group.push({});
};

const rmCondition = (conditionGroup: any[], index: number) => {
  conditionGroup.splice(index, 1);
};

const operatorMap = {
  '==': '等于',
  '!=': '不等于',
  '>': '大于',
  '>=': '大于等于',
  '<': '小于',
  '<=': '小于等于'
};

const operatorOptions = computed(() => {
  return Object.entries(operatorMap).map(([key, value]) => ({
    label: value,
    value: key
  }));
});

const supportTypes = [
  ValueType.number,
  ValueType.string
  // ValueType.date,
  // ValueType.dept,
  // ValueType.user,
];

const conditionItems = [];
const conditionItemMap = new Map();
// 过滤表单项
const filterCondition = (item, list) => {
  conditionItemMap.set(item.id, item);
  if (item.name === 'SpanLayout') {
    item.props.items.forEach(sub => filterCondition(sub, list));
  } else if (supportTypes.includes(item.valueType) && item.props.required) {
    list.push(item);
  }
};

const conditionOptions = computed(() => {
  workflowStore.design.formItems.forEach(item => filterCondition(item, conditionItems));
  return conditionItems.map(item => {
    return {
      label: item.title,
      value: item.id
    };
  });
});

const conditionKeyUpdateHandle = (value, condition) => {
  const formItem = conditionItemMap.get(value);
  condition.label = formItem.title;
  condition.field = formItem.id;
  condition.operator = '==';
  condition.value = '';
};
</script>

<template>
  <div>
    <div v-for="(conditionGroup, index) in selectedNode.conditionList" :key="index + '_g'">
      <div v-if="index != 0" class="text-gray-700 mb-3">或满足</div>
      <div class="group mb-3">
        <div class="group-header">
          <span class="group-name">条件组 {{ index + 1 }}</span>
          <div class="group-cp">
            <span>组内条件关系：且</span>
          </div>
          <div class="group-operation">
            <i class="x-icon-delete x-iconfont" @click="delGroup(index)"></i>
          </div>
        </div>
        <div class="group-content">
          <div v-for="(condition, idx) in conditionGroup" :key="idx">
            <div class="condition-relation">
              <span>{{ idx == 0 ? '当' : '且' }}</span>
              <i class="x-icon-delete x-iconfont cursor-pointer" @click="rmCondition(conditionGroup, idx)"></i>
            </div>
            <div class="condition-key">
              <n-select
                v-model:value="condition.field"
                :options="conditionOptions"
                size="small"
                @update:value="conditionKeyUpdateHandle($event, condition)"
              />
            </div>
            <div class="condition-content">
              <div class="compare-select mb-[8px]">
                <n-select v-model:value="condition.operator" :options="operatorOptions" size="small" />
              </div>
              <div class="content-value">
                <n-input v-model:value="condition.value" size="small" />
              </div>
            </div>
          </div>
          <n-button class="mt-3" quaternary type="info" @click="addCondition(conditionGroup)">
            <template #icon>
              <i class="x-icon-plus x-iconfont"></i>
            </template>
            添加条件
          </n-button>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="less" scoped>
.group {
  color: #5e5e5e;
  overflow: hidden;
  border-radius: 6px;
  border: 1px solid #e3e3e3;

  .group-header {
    padding: 8px 12px;
    background: #f4f6f8;
    position: relative;

    div {
      display: inline-block;
    }

    .group-name {
      font-size: small;
    }

    .group-cp {
      font-size: small;
      position: absolute;
      left: 100px;
      display: flex;
      top: 8px;
      justify-content: center;
      align-items: center;
    }

    .group-operation {
      position: absolute;
      right: 10px;

      i {
        padding: 0 10px;

        &:hover {
          cursor: pointer;
        }
      }
    }
  }

  .group-content {
    padding: 10px 5px;

    .condition-relation {
      color: #aaa;
      display: flex;
      align-items: center;
      height: 36px;
      justify-content: space-between;
      padding: 0 2px;
    }

    .condition-content {
      margin-top: 8px;
    }
  }

  .condition-title {
    display: block;
    width: 100px;
  }
}
</style>
