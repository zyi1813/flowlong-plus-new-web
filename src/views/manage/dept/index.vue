import { deleteDept } from '@/service/api/system-manage';
<script setup lang="tsx">
import { ref } from 'vue';
import { NButton, NPopconfirm } from 'naive-ui';
import { useBoolean } from '@yuencode/hooks';
import { deleteDept, getDeptTreeList, infoDept } from '@/service/api/system-manage';
import { useAppStore } from '@/store/modules/app';
import { useTable } from '@/hooks/common/table';
import { $t } from '@/locales';
import DeptOperateDrawer, { type OperateType } from './modules/dept-operate-drawer.vue';

defineOptions({
  name: 'DeptManageList'
});

const appStore = useAppStore();
const { bool: drawerVisible, setTrue: openDrawer } = useBoolean();

const { columns, filteredColumns, data, loading, pagination, getData } = useTable<
  Api.SystemManage.Dept,
  typeof getDeptTreeList,
  'index' | 'operate'
>({
  apiFn: getDeptTreeList,
  transformer: res => {
    const dept = res.data || [];
    return {
      data: dept,
      pageNum: 1,
      pageSize: 10,
      total: dept.length
    };
  },
  columns: () => [
    {
      type: 'selection',
      align: 'center',
      width: 48
    },
    {
      key: 'deptId',
      title: $t('page.manage.menu.id'),
      align: 'center'
    },
    {
      key: 'deptName',
      title: '部门名称',
      align: 'center',
      width: 80
    },
    {
      key: 'parentName',
      title: '上级部门名称',
      align: 'center',
      minWidth: 120
    },
    {
      key: 'operate',
      title: $t('common.operate'),
      align: 'center',
      width: 260,
      render: row => (
        <div class="flex-center justify-end gap-8px">
          <NButton type="primary" ghost size="small" onClick={() => handleEdit(row.deptId)}>
            {$t('common.edit')}
          </NButton>
          <NPopconfirm onPositiveClick={() => handleDelete(row.deptId)}>
            {{
              default: () => $t('common.confirmDelete'),
              trigger: () => (
                <NButton type="error" ghost size="small">
                  {$t('common.delete')}
                </NButton>
              )
            }}
          </NPopconfirm>
        </div>
      )
    }
  ]
});

const operateType = ref<OperateType>('add');

function handleAdd() {
  operateType.value = 'add';
  openDrawer();
}

const checkedRowKeys = ref<number[]>([]);

async function handleBatchDelete() {
  deleteDept(checkedRowKeys.value.join(',')).then(() => {
    window.$message?.success($t('common.deleteSuccess'));
    checkedRowKeys.value = [];
    getData();
  });
}

/** the editing row data */
const editingData = ref<Api.SystemManage.Dept | null>(null);

function handleEdit(id: number) {
  operateType.value = 'edit';
  infoDept(id).then(res => {
    editingData.value = res.data;
    openDrawer();
  });
}

async function handleDelete(id: number) {
  // request
  deleteDept(`${id}`).then(() => {
    window.$message?.success($t('common.deleteSuccess'));
    getData();
  });
}
</script>

<template>
  <div class="flex-vertical-stretch gap-16px overflow-hidden <sm:overflow-auto">
    <NCard title="部门列表" :bordered="false" size="small" class="card-wrapper sm:flex-1-hidden">
      <template #header-extra>
        <TableHeaderOperation
          v-model:columns="filteredColumns"
          :disabled-delete="checkedRowKeys.length === 0"
          :loading="loading"
          @add="handleAdd"
          @delete="handleBatchDelete"
          @refresh="getData"
        />
      </template>
      <NDataTable
        v-model:checked-row-keys="checkedRowKeys"
        :columns="columns"
        :data="data"
        size="small"
        :flex-height="!appStore.isMobile"
        :scroll-x="640"
        :loading="loading"
        :pagination="pagination"
        :row-key="item => item.deptId"
        class="sm:h-full"
      />
      <DeptOperateDrawer
        v-model:visible="drawerVisible"
        :operate-type="operateType"
        :row-data="editingData"
        @submitted="getData"
      />
    </NCard>
  </div>
</template>

<style></style>
