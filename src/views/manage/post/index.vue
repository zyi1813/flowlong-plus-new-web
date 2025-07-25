<script setup lang="tsx">
import { ref } from 'vue';
import { NButton, NPopconfirm, NTag } from 'naive-ui';
import { useBoolean } from '@yuencode/hooks';
import { deletePost, infoPost, listPost } from '@/service/api/system-manage';
import { useAppStore } from '@/store/modules/app';
import { useTable } from '@/hooks/common/table';
import { $t } from '@/locales';
import { enableStatusRecord } from '@/constants/business';
import PostOperateDrawer, { type OperateType } from './modules/post-operate-drawer.vue';
import PostSearch from './modules/post-search.vue';

const appStore = useAppStore();
const { bool: drawerVisible, setTrue: openDrawer } = useBoolean();

const { columns, filteredColumns, data, loading, pagination, getData, searchParams, resetSearchParams } = useTable<
  Api.SystemManage.Post,
  typeof listPost,
  'index' | 'operate'
>({
  apiFn: listPost,
  apiParams: {
    pageNum: 1,
    pageSize: 10,
    // if you want to use the searchParams in Form, you need to define the following properties, and the value is null
    // the value can not be undefined, otherwise the property in Form will not be reactive
    postCode: null,
    postName: null,
    status: null
  },
  transformer: res => {
    const { list = [], pageNum = 1, pageSize = 10, total = 0 } = res.data || {};

    return {
      data: list,
      pageNum,
      pageSize,
      total
    };
  },
  columns: () => [
    {
      type: 'selection',
      align: 'center',
      width: 48
    },
    {
      key: 'index',
      title: $t('common.index'),
      render: (_, index): string => getIndex(index),
      width: 64,
      align: 'center'
    },
    {
      key: 'postName',
      title: '岗位名称',
      align: 'center',
      minWidth: 120
    },
    {
      key: 'postCode',
      title: '岗位编码',
      align: 'center',
      minWidth: 120
    },
    {
      key: 'status',
      title: '岗位状态',
      align: 'center',
      width: 100,
      render: row => {
        if (row.status === null) {
          return null;
        }

        const tagMap: Record<Api.Common.EnableStatus, NaiveUI.ThemeColor> = {
          1: 'success',
          2: 'warning'
        };

        const label = $t(enableStatusRecord[row.status]);

        return <NTag type={tagMap[row.status]}>{label}</NTag>;
      }
    },
    {
      key: 'operate',
      title: $t('common.operate'),
      align: 'center',
      width: 130,
      render: row => (
        <div class="flex-center gap-8px">
          <NButton type="primary" ghost size="small" onClick={() => handleEdit(row.postId)}>
            {$t('common.edit')}
          </NButton>
          <NPopconfirm onPositiveClick={() => handleDelete(row.postId)}>
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

const checkedRowKeys = ref<string[]>([]);

async function handleBatchDelete() {
  deletePost(checkedRowKeys.value.join(',')).then(() => {
    window.$message?.success($t('common.deleteSuccess'));
    checkedRowKeys.value = [];
    getData();
  });
}

/** the editing row data */
const editingData = ref<Api.SystemManage.Post | null>(null);

function handleEdit(id: number) {
  operateType.value = 'edit';
  infoPost(id).then(res => {
    editingData.value = res.data;
    openDrawer();
  });
}

async function handleDelete(id: number) {
  deletePost(String(id)).then(() => {
    window.$message?.success($t('common.deleteSuccess'));
    getData();
  });
}

function getIndex(index: number) {
  const { page = 0, pageSize = 10 } = pagination;

  return String((page - 1) * pageSize + index + 1);
}
</script>

<template>
  <div class="flex-vertical-stretch gap-16px overflow-hidden <sm:overflow-auto">
    <PostSearch v-model:model="searchParams" @reset="resetSearchParams" @search="getData" />
    <NCard title="岗位列表" :bordered="false" size="small" class="card-wrapper sm:flex-1-hidden">
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
        :row-key="item => item.postId"
        class="sm:h-full"
      />
      <PostOperateDrawer
        v-model:visible="drawerVisible"
        :operate-type="operateType"
        :row-data="editingData"
        @submitted="getData"
      />
    </NCard>
  </div>
</template>

<style scoped></style>
