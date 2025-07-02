<script setup lang="ts">
import { h, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { NIcon, useDialog, useMessage } from 'naive-ui';
import type { Component } from 'vue';
import {
  AddOutline as AddIcon,
  TrashOutline as DeleteIcon,
  Pencil as EditIcon,
  SettingsOutline as SettingIcon
} from '@vicons/ionicons5';
import { deleteFormGroup, getFormGroup } from '@/service/api/workflow/designer';
import FormGroupModal from './FormGroupModal.vue';

const router = useRouter();
const dialog = useDialog();
const message = useMessage();
const formGroupList = ref();
const formGroupModalTitle = ref('创建分组');

const renderIcon = (icon: Component) => {
  return () => {
    return h(NIcon, null, {
      default: () => h(icon)
    });
  };
};
const dropdownOptions = ref([
  {
    label: '修改名称',
    key: 'updateName',
    icon: renderIcon(EditIcon)
  },
  {
    label: '删除分组',
    key: 'deleteGroup',
    icon: renderIcon(DeleteIcon)
  }
]);

const formGroupModalRef = ref();
const handleSelect = (key: string | number, data) => {
  if (key == 'updateName') {
    formGroupModalTitle.value = '编辑分组';
    const { openModal } = formGroupModalRef.value;
    openModal({ id: data.id, name: data.name });
  }
  if (key == 'deleteGroup') {
    dialog.warning({
      title: '警告',
      content: `删除分组并不会删除表单，表单将会被转移到 "其他" 分组，确定要删除分组 [${data.name}]?`,
      positiveText: '确定',
      negativeText: '取消',
      onPositiveClick: () => {
        deleteFormGroup({ id: data.id }).then(() => {
          message.success('删除成功');
          loadFormGroupList();
        });
      },
      onNegativeClick: () => {}
    });
  }
};

const loadFormGroupList = () => {
  getFormGroup().then(res => {
    formGroupList.value = res.data;
  });
};

/** 创建新流程 */
const createProcessHandle = data => {
  if (data) {
    router.push(`/workflow/designer/create?groupId=${data.id}`);
    return;
  }
  router.push('/workflow/designer/create');
};

const handleEditTemplate = templateId => {
  router.push(`/workflow/designer/create?templateId=${templateId}`);
};

/** 创建新分组 */
const createFormGroupHandle = () => {
  const { openModal } = formGroupModalRef.value;
  openModal({});
};
onMounted(() => {
  loadFormGroupList();
});
</script>

<template>
  <div>
    <n-space justify="end">
      <n-button round type="info" :render-icon="renderIcon(AddIcon)" @click="createProcessHandle(null)">
        新建流程
      </n-button>
      <n-button round type="default" :render-icon="renderIcon(AddIcon)" @click="createFormGroupHandle">
        新建分组
      </n-button>
    </n-space>
    <div v-for="(item, index) in formGroupList" :key="index" class="group">
      <n-card :title="item.name + '(' + item.items.length + ')'" :segmented="{ content: true, footer: 'soft' }">
        <template #header-extra>
          <n-dropdown :options="dropdownOptions" @select="handleSelect($event, item)">
            <div>
              <n-button text>
                <template #icon>
                  <NIcon :component="SettingIcon" />
                </template>
                编辑分组
              </n-button>
            </div>
          </n-dropdown>
        </template>
        <div v-if="item.items.length == 0">
          <n-space justify="center">
            <n-button text type="info" @click="createProcessHandle(item)">
              <template #icon>
                <NIcon>
                  <AddIcon />
                </NIcon>
              </template>
              创建新流程
            </n-button>
          </n-space>
        </div>
        <div v-else>
          <template v-for="item_ in item.items" :key="item_.templateId">
            <div class="flex h-8 items-center p-1 mt-1 border-dashed border-2 border-gray-300 rounded">
              <div class="flex">
                <div>{{ item_.templateName }}</div>
                <div class="ml-4">最后更新时间：{{ item_.updateTime }}</div>
              </div>
              <div class="ml-auto">
                <NButton quaternary type="info" @click="handleEditTemplate(item_.templateId)">编辑</NButton>
              </div>
            </div>
          </template>
        </div>
      </n-card>
    </div>

    <FormGroupModal ref="formGroupModalRef" :title="formGroupModalTitle" @change="loadFormGroupList" />
  </div>
</template>

<style scoped lang="less">
.group {
  margin-top: 12px;
}
</style>
