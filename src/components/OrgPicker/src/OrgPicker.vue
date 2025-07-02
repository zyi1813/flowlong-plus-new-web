<script setup lang="ts">
import { computed, ref } from 'vue';
import { useMessage } from 'naive-ui';
import { getOrgTree, searchOrgTreeUser as getUserByName, getAllRoles, getUsersByRole, getDeptTree } from '@/service/api/workflow/org';
import { IconX } from '@/components/Iconx';

const message = useMessage();

const emit = defineEmits(['confirm', 'cancel']);

const props = defineProps({
  title: {
    default: '请选择',
    type: String
  },
  type: {
    default: 'org', // org-可以选择部门/人员  user-只能选人  dept-只能选部门  role-只能选角色
    type: String
  },
  /** 是否开启多选 */
  multiple: {
    default: true,
    type: Boolean
  },
  selected: {
    default: () => [],
    type: Array
  }
});
const orgData = ref<any>([]);
const orgData_ = computed(() => {
  return orgUserData.value.length > 0 ? orgUserData.value : orgData.value;
});

const loading = ref(false);
const loadOrgData = (deptId: number, cb?: () => void) => {
  loading.value = true;
  getOrgTree({ deptId }).then(res => {
    orgData.value = res.data;
    loading.value = false;
    if (cb) {
      cb();
    }
  });
};

// 加载角色数据
const loadRoleData = (cb?: () => void) => {
  loading.value = true;
  getAllRoles().then(res => {
    orgData.value = res.data;
    loading.value = false;
    if (cb) {
      cb();
    }
  });
};

// 加载部门数据
const loadDeptData = (cb?: () => void) => {
  loading.value = true;
  getDeptTree().then(res => {
    orgData.value = res.data;
    loading.value = false;
    if (cb) {
      cb();
    }
  });
};

// 根据角色加载用户数据
const loadUsersByRole = (roleId: string, cb?: () => void) => {
  loading.value = true;
  getUsersByRole(roleId).then(res => {
    orgData.value = res.data;
    loading.value = false;
    if (cb) {
      cb();
    }
  });
};

const isDeptDisableHandle = (node: any) => {
  // 如果是部门选择模式，部门不被禁用
  if (props.type === 'dept') {
    return false;
  }
  // 如果是用户选择模式，部门被禁用
  return props.type === 'user' && node.type === 'dept';
};

const visible = ref(false);

/** 先前节点 */
const beforeNodes = ref<Array<any>>([]);
const lastNodeHandle = () => {
  if (beforeNodes.value.length == 0) {
    return;
  }
  if (beforeNodes.value.length == 1) {
    if (props.type === 'role') {
      loadRoleData();
    } else if (props.type === 'dept') {
      loadDeptData();
    } else {
      loadOrgData(0);
    }
    beforeNodes.value.splice(beforeNodes.value.length - 1, 1);
  } else {
    const node = beforeNodes.value[beforeNodes.value.length - 2];
    beforeNodes.value.splice(beforeNodes.value.length - 1, 1);
    if (props.type === 'role') {
      loadRoleData();
    } else if (props.type === 'dept') {
      loadDeptData();
    } else {
      loadOrgData(node.id);
    }
  }
};

const nextNodeHandle = (node: any) => {
  beforeNodes.value.push(node);
  if (props.type === 'role' && node.type === 'role') {
    // 如果选择的是角色，加载该角色下的用户
    loadUsersByRole(node.id);
  } else {
    loadOrgData(node.id);
  }
};

const deptStr = computed(() => {
  return String(beforeNodes.value.map(v => v.name)).replaceAll(',', ' > ');
});

const queryParams = ref({
  name: ''
});

/** 搜索的用户列表 */
const orgUserData = ref<any[]>([]);
const searchUserHandle = () => {
  if (queryParams.value.name.trim() == '') {
    orgUserData.value = [];
    return;
  }

  // 根据类型调用不同的搜索接口
  if (props.type === 'role') {
    // 角色类型，暂时不支持搜索，清空搜索结果
    orgUserData.value = [];
  } else if (props.type === 'dept') {
    // 部门类型，暂时不支持搜索，清空搜索结果
    orgUserData.value = [];
  } else {
    // 用户类型，调用用户搜索接口
    getUserByName({ username: queryParams.value.name }).then(res => {
      orgUserData.value = res.data;
    });
  }
};

const show = () => {
  console.log('OrgPicker show called, props.type:', props.type);
  checkAll.value = false;
  visible.value = true;
  // 清空之前的数据
  beforeNodes.value = [];
  orgUserData.value = [];
  // 清空之前加载的数据
  orgData.value = [];
  // 重新初始化selectedNodes
  selectedNodes.value = [...props.selected];

  // 根据类型加载初始数据
  if (props.type === 'role') {
    console.log('Loading role data...');
    loadRoleData(() => {
      if (props.selected?.length > 0) {
        orgData.value.forEach((item: any) => {
          const el = props.selected?.find((it: any) => it.id == item.id);
          if (el) {
            item.selected = true;
          }
        });
      }
    });
  } else if (props.type === 'dept') {
    console.log('Loading dept data...');
    // 部门类型，加载部门数据
    loadDeptData(() => {
      if (props.selected?.length > 0) {
        orgData.value.forEach((item: any) => {
          const el = props.selected?.find((it: any) => it.id == item.id);
          if (el) {
            item.selected = true;
          }
        });
      }
    });
  } else {
    console.log('Loading org data...');
    // 用户类型或其他类型，加载完整的组织架构
    loadOrgData(0, () => {
      if (props.selected?.length > 0) {
        orgData.value.forEach((item: any) => {
          const el = props.selected?.find((it: any) => it.id == item.id);
          if (el) {
            item.selected = true;
          }
        });
      }
    });
  }
};

const checkAll = ref<boolean>(false);
/** 已选择的数据 */
const selectedNodes = ref<any[]>([...props.selected]);

const checkboxChangeHandle = (checked: boolean, node: any) => {
  if (checked) {
    if (!props.multiple && selectedNodes.value.length !== 0) {
      message.warning('禁止多选');
      return;
    }
    selectedNodes.value.push(node);
  } else {
    checkAll.value = false;
    removeNode(node);
  }
  node.selected = checked;
};

/** 移除节点 */
const removeNode = (node: any) => {
  selectedNodes.value = selectedNodes.value.filter(item => {
    return item.id != node.id;
  });
  const orgItem = orgData.value.find((item: any) => item.id == node.id);
  if (orgItem) {
    orgItem.selected = false;
  }
};

/** 清空选择 */
const clearSelectedHandle = () => {
  selectedNodes.value.forEach(item => removeNode(item));
};

const getShortName = (name: string): string => {
  if (name) {
    return name.length > 2 ? name.substring(1, 3) : name;
  }
  return '**';
};

/** 全选 */
const checkAllChangeHandle = (val: boolean) => {
  checkAll.value = val;
  for (const i in orgData.value) {
    if (isDeptDisableHandle(orgData.value[i])) {
      continue;
    }
    orgData.value[i].selected = val;
    // fix: n-checkbox组件 -> v-model:checked改变不会触发@update:checked
    if (val) {
      if (!selectedNodes.value.find(item => item.id == orgData.value[i].id)) {
        selectedNodes.value.push(orgData.value[i]);
      }
    }
  }
  if (!val) {
    selectedNodes.value.forEach(item => removeNode(item));
  }
};

const pickerTitle = computed(() => {
  switch (props.type) {
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

// 添加搜索框placeholder的计算属性
const searchPlaceholder = computed(() => {
  switch (props.type) {
    case 'role':
      return '角色暂不支持搜索';
    case 'dept':
      return '部门暂不支持搜索';
    default:
      return '搜索人员，支持拼音、姓名';
  }
});

defineExpose({
  show
});
</script>

<template>
  <n-modal v-model:show="visible">
    <n-card :title="pickerTitle" style="width: 680px" closable @close="visible = false">
      <div class="picker">
        <div v-loading="loading" class="candidate">
          <div class="candidate_header" style="padding: 6px">
            <n-input
              v-model:value="queryParams.name"
              style="font-size: 12px; width: 95%"
              size="small"
              type="text"
              clearable
              :placeholder="searchPlaceholder"
              :disabled="props.type === 'role' || props.type === 'dept'"
              @input="searchUserHandle"
            >
              <template #prefix>
                <IconX name="x-icon-search" color="#C0C4CC" size="18" />
              </template>
            </n-input>
            <div>
              <n-ellipsis
                hover-tip
                style="height: 18px; color: #8c8c8c; padding: 5px 0 0; box-sizing: content-box"
                :line-clamp="1"
              >
                <IconX name="x-icon-building" color="#8c8c8c" size="18" />
                {{ deptStr }}
              </n-ellipsis>
            </div>
            <div style="margin-top: 5px">
              <n-checkbox
                v-model:checked="checkAll"
                :disabled="!props.multiple || !orgData_.length || !!orgUserData.length"
                :on-update:checked="checkAllChangeHandle"
              >
                全选
              </n-checkbox>
              <span v-show="beforeNodes!.length > 0" class="last_node" @click="lastNodeHandle">上一级</span>
            </div>
          </div>

          <div class="org_items">
            <n-empty v-show="orgData_.length == 0" description="似乎没有数据" />
            <div
              v-for="(org, index) in orgData_"
              :key="index"
              class="org-item"
              :class="{
                'org-dept-item': org.type === 'dept',
                'org-user-item': org.type === 'user',
                'org-role-item': org.type === 'role'
              }"
            >
              <div v-if="org.type == 'dept'">
                <n-checkbox
                  v-model:checked="org.selected"
                  :disabled="isDeptDisableHandle(org)"
                  @update:checked="checked => checkboxChangeHandle(checked, org)"
                />
                <IconX name="x-icon-folder" color="#606266" size="14" />
                <span class="name">{{ org.name }}</span>
                <span
                  :class="`next-dept${org.selected ? '-disable' : ''}`"
                  @click="
                    () => {
                      if (!org.selected) {
                        nextNodeHandle(org);
                      }
                    }
                  "
                >
                  <IconX name="x-icon-branch_1" :color="org.selected ? '#8c8c8c' : '#2d8cf0'" size="14" />
                  下级
                </span>
              </div>
              <div v-if="org.type == 'user'">
                <n-checkbox
                  v-model:checked="org.selected"
                  :disabled="isDeptDisableHandle(org)"
                  :on-update:checked="checked => checkboxChangeHandle(checked, org)"
                />
                <span class="avatar">{{ getShortName(org.name) }}</span>
                <span class="name">{{ org.name }}</span>
              </div>
              <div v-if="org.type == 'role'">
                <n-checkbox
                  v-model:checked="org.selected"
                  :on-update:checked="checked => checkboxChangeHandle(checked, org)"
                />
                <IconX name="x-icon-users" color="#606266" size="14" />
                <span class="name">{{ org.name }}</span>
                <span
                  :class="`next-dept${org.selected ? '-disable' : ''}`"
                  @click="
                    () => {
                      if (!org.selected) {
                        nextNodeHandle(org);
                      }
                    }
                  "
                >
                  <IconX name="x-icon-branch_1" :color="org.selected ? '#8c8c8c' : '#2d8cf0'" size="14" />
                  查看用户
                </span>
              </div>
            </div>
          </div>
        </div>
        <div class="selected">
          <div class="count" style="box-sizing: content-box">
            <span>已选 {{ selectedNodes.length }} 项</span>
            <span @click="clearSelectedHandle">清空</span>
          </div>
          <n-empty v-show="selectedNodes.length == 0" description="点击左侧选择数据" />
          <div
            v-for="(org, index) in selectedNodes"
            :key="index"
            class="org-item"
            :class="{
              'org-dept-item': org.type === 'dept',
              'org-user-item': org.type === 'user',
              'org-role-item': org.type === 'role'
            }"
          >
            <div v-if="org.type === 'dept'">
              <IconX name="x-icon-folder" color="#606266" size="14" />
              <span style="position: static" class="name">{{ org.name }}</span>
            </div>
            <div v-if="org.type === 'user'" style="display: flex; align-items: center">
              <span class="avatar">{{ getShortName(org.name) }}</span>
              <span class="name">{{ org.name }}</span>
            </div>
            <div v-if="org.type === 'role'" style="display: flex; align-items: center">
              <IconX name="x-icon-users" color="#606266" size="14" />
              <span class="name">{{ org.name }}</span>
            </div>
            <IconX
              style="position: absolute; right: 5px; cursor: pointer"
              name="x-icon-close"
              color="#606266"
              size="18"
              @click="removeNode(org)"
            />
          </div>
        </div>
      </div>
      <template #footer>
        <n-space justify="end">
          <n-button
            type="primary"
            size="small"
            @click="
              () => {
                emit('confirm', selectedNodes);
                visible = false;
              }
            "
          >
            确认
          </n-button>
          <n-button
            size="small"
            @click="
              () => {
                emit('cancel');
                visible = false;
              }
            "
          >
            取消
          </n-button>
        </n-space>
      </template>
    </n-card>
  </n-modal>
</template>

<style lang="less" scoped>
@containWidth: 278px;
.candidate,
.selected {
  flex: 1;
  overflow-y: auto;
  border: 1px solid #e8e8e8;
}

.picker {
  display: flex;
  height: 402px;

  .org_items {
    overflow-y: auto;
    position: relative;
    height: 310px;

    .n-checkbox {
      margin-right: 10px;
    }

    .x-icon-folder {
      margin-right: 4px;
    }

    & > .n-empty {
      position: absolute;
      left: 50%;
      top: 50%;
      transform: translate(-50%, -50%);
    }
  }
}

.org-dept-item {
  padding: 10px 5px;

  & > div {
    display: inline-block;

    & > span:last-child {
      position: absolute;
      right: 5px;
    }
  }
}

.org-user-item {
  display: flex;
  align-items: center;
  padding: 5px;

  & > div {
    display: inline-block;
  }
}

.org-role-item {
  padding: 10px 5px;

  & > div {
    display: inline-block;

    & > span:last-child {
      position: absolute;
      right: 5px;
    }
  }
}

.org-item {
  width: calc(100% - 18px);
  position: relative;

  &:hover {
    background: #f1f1f1;
  }

  .avatar {
    width: 35px;
    text-align: center;
    display: inline-block;
    line-height: 35px;
    background: @primaryColor;
    color: white;
    border-radius: 50%;
  }

  .name {
    margin-left: 5px;
  }
}

.selected {
  position: relative;

  & > .n-empty {
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
  }
}

.next-dept {
  float: right;
  color: @primaryColor;
  cursor: pointer;
}

.next-dept-disable {
  float: right;
  color: #8c8c8c;
  cursor: not-allowed;
}

.last_node {
  cursor: pointer;
  color: @primaryColor;
}

.selected {
  .count {
    width: calc(@containWidth - 20px);
    padding: 10px;
    display: inline-block;
    border-bottom: 1px solid #e8e8e8;
    margin-bottom: 5px;

    & > span:nth-child(2) {
      float: right;
      color: #d03050;
      cursor: pointer;
    }
  }
}
</style>
