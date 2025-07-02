<script setup lang="tsx">
import { ref, watch } from 'vue';
import { NButton, NPopconfirm, NTag } from 'naive-ui';
import { useBoolean } from '@yuencode/hooks';
import { deleteMenu, fetchGetMenuList, infoMenu } from '@/service/api/system-manage';
import { useAppStore } from '@/store/modules/app';
import { useTable } from '@/hooks/common/table';
import { $t } from '@/locales';
import { yesOrNoRecord } from '@/constants/common';
import { enableStatusRecord, menuTypeRecord } from '@/constants/business';
import SvgIcon from '@/components/custom/svg-icon.vue';
import MenuOperateDrawer, { type OperateType } from './modules/menu-operate-drawer.vue';

const appStore = useAppStore();
const { bool: drawerVisible, setTrue: openDrawer } = useBoolean();

let menuList: Api.SystemManage.Menu[] = [];
const { columns, filteredColumns, data, loading, pagination, getData } = useTable<
  Api.SystemManage.Menu,
  typeof fetchGetMenuList,
  'index' | 'operate'
>({
  apiFn: fetchGetMenuList,
  transformer: res => {
    const menus = res.data || [];
    menuList = menus;
    return {
      data: menus,
      pageNum: 1,
      pageSize: 10,
      total: menus.length
    };
  },
  columns: () => [
    {
      type: 'selection',
      align: 'center',
      width: 48
    },
    {
      key: 'id',
      title: $t('page.manage.menu.id'),
      align: 'center'
    },
    {
      key: 'menuType',
      title: $t('page.manage.menu.menuType'),
      align: 'center',
      width: 80,
      render: row => {
        const tagMap: Record<number, NaiveUI.ThemeColor> = {
          0: 'default',
          1: 'primary',
          2: 'info'
        };

        const label = $t(menuTypeRecord[row.menuType]);

        return <NTag type={tagMap[row.menuType]}>{label}</NTag>;
      }
    },
    {
      key: 'menuName',
      title: $t('page.manage.menu.menuName'),
      align: 'center',
      minWidth: 120,
      render: row => {
        const { i18nKey, menuName } = row;

        const label = i18nKey ? $t(i18nKey) : menuName;

        return <span>{label}</span>;
      }
    },
    {
      key: 'icon',
      title: $t('page.manage.menu.icon'),
      align: 'center',
      width: 60,
      render: row => {
        return (
          <div class="flex-center">
            <SvgIcon icon={row.icon} localIcon={row.localIcon} class="text-icon" />
          </div>
        );
      }
    },
    {
      key: 'routeName',
      title: $t('page.manage.menu.routeName'),
      align: 'center',
      minWidth: 120
    },
    {
      key: 'routePath',
      title: $t('page.manage.menu.routePath'),
      align: 'center',
      minWidth: 120
    },
    {
      key: 'status',
      title: $t('page.manage.menu.menuStatus'),
      align: 'center',
      width: 80,
      render: row => {
        if (row.status === null) {
          return null;
        }

        const tagMap: Record<Api.Common.EnableStatus, NaiveUI.ThemeColor> = {
          '1': 'success',
          '2': 'warning'
        };

        const label = $t(enableStatusRecord[row.status]);

        return <NTag type={tagMap[row.status]}>{label}</NTag>;
      }
    },
    {
      key: 'hideInMenu',
      title: $t('page.manage.menu.hideInMenu'),
      align: 'center',
      width: 80,
      render: row => {
        const hide: CommonType.YesOrNo = row.hideInMenu ? 'Y' : 'N';

        const tagMap: Record<CommonType.YesOrNo, NaiveUI.ThemeColor> = {
          Y: 'error',
          N: 'default'
        };

        const label = $t(yesOrNoRecord[hide]);

        return <NTag type={tagMap[hide]}>{label}</NTag>;
      }
    },
    // {
    //   key: 'parentId',
    //   title: $t('page.manage.menu.parentId'),
    //   width: 90,
    //   align: 'center'
    // },
    // {
    //   key: 'orderNum',
    //   title: $t('page.manage.menu.order'),
    //   align: 'center',
    //   width: 60
    // },
    {
      key: 'operate',
      title: $t('common.operate'),
      align: 'center',
      width: 260,
      render: row => (
        <div class="flex-center justify-end gap-8px">
          {row.menuType === '0' && (
            <NButton type="primary" ghost size="small" onClick={() => handleAddChildMenu(row.id)}>
              {$t('page.manage.menu.addChildMenu')}
            </NButton>
          )}
          <NButton type="primary" ghost size="small" onClick={() => handleEdit(row.id)}>
            {$t('common.edit')}
          </NButton>
          <NPopconfirm onPositiveClick={() => handleDelete(row.id)}>
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
  deleteMenu(checkedRowKeys.value.join(',')).then(() => {
    window.$message?.success($t('common.deleteSuccess'));
    checkedRowKeys.value = [];
    getData();
  });
}

const parentId = ref(0);
watch(drawerVisible, () => {
  if (!drawerVisible.value) {
    parentId.value = 0;
  }
});
function handleAddChildMenu(id: number) {
  parentId.value = id;
  operateType.value = 'add';
  openDrawer();
}

/** the editing row data */
const editingData = ref<Api.SystemManage.Menu | null>(null);

function handleEdit(id: number) {
  operateType.value = 'edit';
  infoMenu(id).then(res => {
    editingData.value = res.data;
    openDrawer();
  });
}

async function handleDelete(id: number) {
  // request
  deleteMenu(`${id}`).then(() => {
    window.$message?.success($t('common.deleteSuccess'));
    getData();
  });
}
</script>

<template>
  <div class="flex-vertical-stretch gap-16px overflow-hidden <sm:overflow-auto">
    <NCard :title="$t('page.manage.menu.title')" :bordered="false" size="small" class="card-wrapper sm:flex-1-hidden">
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
        :row-key="item => item.id"
        class="sm:h-full"
      />
      <MenuOperateDrawer
        v-model:visible="drawerVisible"
        :parent-id="parentId"
        :operate-type="operateType"
        :row-data="editingData"
        :menu-list="menuList"
        @submitted="getData"
      />
    </NCard>
  </div>
</template>

<style scoped></style>
