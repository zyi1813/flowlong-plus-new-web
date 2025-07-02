<script setup lang="ts">
// import OrgItemView from '../../OrgItemView.vue';
import { computed, reactive, ref } from 'vue';
import { OrgPicker } from '@/components/OrgPicker';
import { useWorkflowStore } from '@/store/modules/workflow';
import OrgItemsView from '@/views/workflow/designer/common/OrgItemsView.vue';
import { ValueType } from '../../form/ComponentsConfigExport';

const workflowStore = useWorkflowStore();
const orgPickerRef = ref();

interface stateInterface {
  ValueType: object;
  users: string[];
  orgType: string;
  showOrgSelect: boolean;
  groupNames: string[];
  supportTypes: string[];
  explains: Array<{ label: string; value: string }>;
}

const state = reactive<stateInterface>({
  ValueType,
  users: [],
  orgType: 'user',
  showOrgSelect: false,
  groupNames: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'],
  supportTypes: [ValueType.number, ValueType.string, ValueType.date, ValueType.dept, ValueType.user],
  explains: [
    { label: '等于', value: '=' },
    { label: '大于', value: '>' },
    { label: '大于等于', value: '>=' },
    { label: '小于', value: '<' },
    { label: '小于等于', value: '<=' },
    { label: '包含在', value: 'IN' },
    { label: 'x < 值 < x', value: 'B' },
    { label: 'x ≤ 值 < x', value: 'AB' },
    { label: 'x < 值 ≤ x', value: 'BA' },
    { label: 'x ≤ 值 ≤ x', value: 'ABA' }
  ]
});

const selectedNode: any = workflowStore.selectedNode;
// const select = computed(() => selectedNode.props.assignedUser || []);
const formItems = computed(() => workflowStore.design.formItems);
const formMap = computed(() => {
  const map = new Map();
  formItems.value.forEach(item => itemToMap(map, item));
  return map;
});
const conditionList = computed(() => {
  const conditionItems: any[] = [];
  formItems.value.forEach(item => filterCondition(item, conditionItems));
  if (conditionItems.length === 0 || conditionItems[0].id !== 'root') {
    conditionItems.unshift({ id: 'root', title: '发起人', valueType: 'User' });
  }
  return conditionItems;
});

const itemToMap = (map: any, item: any) => {
  map.set(item.id, item);
  if (item.name === 'SpanLayout') {
    item.props.items.forEach(sub => itemToMap(map, sub));
  }
};

const isSelect = (formId: any) => {
  const form = formMap.value.get(formId);
  return Boolean(form && (form.name === 'SelectInput' || form.name === 'MultipleSelect'));
};

const getOptions = (formId: any) => {
  return formMap.value.get(formId).props.options || [];
};

const conditionValType = (type: any) => {
  switch (type) {
    case '=':
    case '>':
    case '>=':
    case '<':
    case '<=':
      return 0;
    case 'IN':
      return 1;
    default:
      return 2;
  }
};

const selectUser = (value: any, orgType: any) => {
  state.orgType = orgType;
  state.users = value;
  orgPickerRef.value.show();
};

const filterCondition = (item: any, list: any) => {
  if (item.name === 'SpanLayout') {
    item.props.items.forEach(sub => filterCondition(sub, list));
  } else if (state.supportTypes.includes(item.valueType) && item.props.required) {
    list.push({ title: item.title, id: item.id, valueType: item.valueType });
  }
};

const confirmHandle = (select: any[]) => {
  state.users.length = 0;
  select.forEach(u => state.users.push(u));
};

const delGroup = index => {
  selectedNode.props.groups.splice(index, 1);
};

const rmSubCondition = (group, index) => {
  group.cids.splice(index, 1);
  group.conditions.splice(index, 1);
};

const conditionChange = group => {
  group.cids.forEach((cid: any) => {
    if (group.conditions.findIndex((cd: any) => cd.id === cid) < 0) {
      const condition = { ...conditionList.value.find(c_item => c_item.id === cid) };
      condition.compare = '';
      condition.value = [];
      group.conditions.push(condition);
    }
  });
  for (let i = 0; i < group.conditions.length; i++) {
    if (!group.cids.includes(group.conditions[i].id)) {
      group.conditions.splice(i, 1);
    }
  }
};
</script>

<template>
  <div>
    <div v-for="(group, index) in selectedNode.props.groups" :key="index + '_g'" class="group">
      <div class="group-header">
        <span class="group-name">条件组 {{ state.groupNames[index] }}</span>
        <div class="group-cp">
          <span>组内条件关系：</span>
          <n-switch v-model:value="group.groupType" selected-value="AND" unchecked-value="OR">
            <template #checked>且</template>
            <template #unchecked>或</template>
          </n-switch>
        </div>
        <div class="group-operation">
          <n-popover placement="bottom" width="300" trigger="click">
            <div>选择审批条件</div>
            <!-- <div>以下条件将决定具体的审批流程</div>-->
            <n-checkbox-group
              :value="group.cids"
              value-key="id"
              @update:value="
                val => {
                  group.cids = val;
                  conditionChange(group);
                }
              "
            >
              <n-checkbox
                v-for="condition in conditionList"
                :key="condition.id"
                :label="condition.title"
                :value="condition.id"
              />
            </n-checkbox-group>
            <template #trigger>
              <i class="x-icon-plus x-iconfont"></i>
            </template>
          </n-popover>
          <i class="x-icon-delete x-iconfont" @click="delGroup(index)"></i>
        </div>
      </div>
      <div class="group-content">
        <p v-if="group.conditions.length === 0">点击右上角 + 为本条件组添加条件 ☝</p>
        <div v-else>
          <n-form ref="condition-form" labn-width="100px">
            <!--构建表达式-->
            <n-form-item v-for="(condition, cindex) in group.conditions" :key="condition.id + '_' + cindex">
              <n-ellipsis tooltip>{{ condition.title }}</n-ellipsis>
              <span v-if="condition.valueType === ValueType.string">
                <n-select
                  v-model:value="condition.compare"
                  size="small"
                  placeholder="判断符"
                  style="width: 120px"
                  :options="[
                    {
                      label: '等于',
                      value: '='
                    },
                    {
                      label: '包含在',
                      value: 'IN'
                    }
                  ]"
                  @change="condition.value = []"
                />
                <span v-if="isSelect(condition.id)" style="margin-left: 10px">
                  <n-select
                    v-if="condition.compare === 'IN'"
                    v-model:value="condition.value"
                    style="width: 280px"
                    clearable
                    multiple
                    size="small"
                    :options="getOptions(condition.id)"
                    placeholder="选择值"
                  />
                  <n-select
                    v-else
                    v-model:value="condition.value[0]"
                    style="width: 280px"
                    clearable
                    size="small"
                    :options="getOptions(condition.id)"
                    placeholder="选择值"
                  />
                </span>
                <span v-else style="margin-left: 10px">
                  <n-input
                    v-if="condition.compare === '='"
                    v-model:value="condition.value[0]"
                    style="width: 280px"
                    placeholder="输入比较值"
                    size="small"
                  />
                  <n-select
                    v-else
                    v-model:value="condition.value"
                    style="width: 280px"
                    multiple
                    clearable
                    filterable
                    allow-create
                    size="small"
                    placeholder="输入可能包含的值"
                  />
                </span>
              </span>
              <span v-else-if="condition.valueType === ValueType.number">
                <n-select
                  v-model:value="condition.compare"
                  size="small"
                  placeholder="判断符"
                  style="width: 120px"
                  :options="state.explains"
                />
                <span style="margin-left: 10px">
                  <n-input-number
                    v-if="conditionValType(condition.compare) === 0"
                    v-model:value="condition.value[0]"
                    style="width: 280px"
                    size="small"
                    placeholder="输入比较值"
                  />
                  <n-select
                    v-else-if="conditionValType(condition.compare) === 1"
                    v-model:value="condition.value"
                    style="width: 280px"
                    multiple
                    filterable
                    allow-create
                    size="small"
                    placeholder="输入可能包含的值"
                  />
                  <span v-else>
                    <n-input-number
                      v-model:value="condition.value[0]"
                      style="width: 130px"
                      size="small"
                      placeholder="输入比较值"
                    />
                    <span>
                      ~
                      <n-input-number
                        v-model:value="condition.value[1]"
                        size="small"
                        style="width: 130px"
                        placeholder="输入比较值"
                      />
                    </span>
                  </span>
                </span>
              </span>
              <span v-else-if="condition.valueType === ValueType.user">
                <span style="margin-right: 20px">属于某部门 / 为某些人其中之一</span>
                <n-button size="tiny" type="primary" round @click="selectUser(condition.value, 'user')">
                  <template #icon><i class="x-icon-sort x-iconfont"></i></template>
                  选择人员/部门
                </n-button>
                <OrgItemsView v-model:value="condition.value" />
              </span>
              <span v-else-if="condition.valueType === ValueType.dept">
                <span style="margin-right: 20px">为某部门 / 某部门下的部门</span>
                <n-button size="tiny" type="primary" round @click="selectUser(condition.value, 'dept')">
                  <template #icon><i class="x-icon-sort x-iconfont"></i></template>
                  选择部门
                </n-button>
                <OrgItemsView v-model:value="condition.value" />
              </span>
              <span v-else-if="condition.valueType === ValueType.date"></span>
              <i class="x-icon-delete x-iconfont" @click="rmSubCondition(group, cindex)"></i>
            </n-form-item>
          </n-form>
        </div>
      </div>
    </div>
    <OrgPicker ref="orgPickerRef" :type="state.orgType" multiple :selected="state.users" @confirm="confirmHandle" />
  </div>
</template>

<style lang="less" scoped>
.group {
  margin-bottom: 20px;
  color: #5e5e5e;
  overflow: hidden;
  border-radius: 6px;
  border: 1px solid #e3e3e3;

  .group-header {
    padding: 5px 10px;
    background: #e3e3e3;
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
      top: 5px;
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

    :deep(.n-ellipsis) {
      margin-left: 1rem;
      margin-right: 2rem;
    }

    :deep(.n-form-item-blank) {
      align-items: baseline;
    }

    p {
      text-align: center;
      font-size: small;
    }

    .x-icon-delete {
      margin-left: auto;
    }
  }

  .condition-title {
    display: block;
    width: 100px;
  }
}
</style>
