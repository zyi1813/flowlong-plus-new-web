<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue';
import { useFormRules, useNaiveForm } from '@/hooks/common/form';
import { $t } from '@/locales';
import { addRole, fetchGetMenuList, updateRole } from '@/service/api/system-manage';
import { enableStatusOptions } from '@/constants/business';

defineOptions({
  name: 'RoleOperateDrawer'
});

/**
 * the type of operation
 *
 * - add: add role
 * - edit: edit role
 */
export type OperateType = 'add' | 'edit';

interface Props {
  /** the type of operation */
  operateType: OperateType;
  /** the edit row data */
  rowData?: Api.SystemManage.Role | null;
}

const props = defineProps<Props>();

interface Emits {
  (e: 'submitted'): void;
}

const emit = defineEmits<Emits>();

const visible = defineModel<boolean>('visible', {
  default: false
});

const { formRef, validate, restoreValidation } = useNaiveForm();
const { defaultRequiredRule } = useFormRules();

const title = computed(() => {
  const titles: Record<OperateType, string> = {
    add: $t('page.manage.role.addRole'),
    edit: $t('page.manage.role.editRole')
  };
  return titles[props.operateType];
});

type Model = Pick<
  Api.SystemManage.Role,
  'roleName' | 'roleCode' | 'remark' | 'status' | 'permissions' | 'permissionKeys'
>;

const model: Model = reactive(createDefaultModel());

function createDefaultModel(): Model {
  return {
    roleName: '',
    roleCode: '',
    remark: '',
    status: '1',
    permissionKeys: [],
    permissions: []
  };
}

type RuleKey = Exclude<keyof Model, 'remark' | 'permissions' | 'permissionKeys'>;

const rules: Record<RuleKey, App.Global.FormRule> = {
  roleName: defaultRequiredRule,
  roleCode: defaultRequiredRule,
  status: defaultRequiredRule
};

function handleUpdateModelWhenEdit() {
  if (props.operateType === 'add') {
    Object.assign(model, createDefaultModel());
    return;
  }

  if (props.operateType === 'edit' && props.rowData) {
    Object.assign(model, props.rowData);
  }
}

function closeDrawer() {
  visible.value = false;
}

async function handleSubmit() {
  await validate();
  if (props.operateType === 'add') {
    await addRole(model);
  }
  if (props.operateType === 'edit') {
    await updateRole(model);
  }
  window.$message?.success($t('common.updateSuccess'));
  closeDrawer();
  emit('submitted');
}

const checkedKeys = ref<number[]>([]);
const permissionList = ref<any>([]);
const isSpread = ref(false);
const isAll = ref(false);
const treeRef = ref();
const expandedKeys = ref();

function onExpandedKeys(keys: any) {
  expandedKeys.value = keys;
}
function indeterminateChange(keys: number[]) {
  model.permissionKeys = keys;
}

function checkedTree(keys: number[]) {
  model.permissions = keys;
  checkedKeys.value = keys;
}
function packHandle(value: boolean) {
  if (!value) {
    expandedKeys.value = [];
  } else {
    expandedKeys.value = permissionList.value?.map((item: any) => item.id as string) as [];
  }
}

function handleCheckAll(value: boolean) {
  if (!value) {
    model.permissions = [];
  } else {
    model.permissions = getAllIds(permissionList.value as { id: number; children: [] }[]);
  }
}

function getAllIds(list: { id: number; children: [] }[] = [], ids: number[] = []) {
  for (const item of list) {
    !ids.includes(item.id) && ids.push(item.id);
    if (item.children && item.children.length) getAllIds(item.children, ids);
  }
  return ids;
}

watch(visible, () => {
  if (visible.value) {
    handleUpdateModelWhenEdit();
    restoreValidation();

    fetchGetMenuList().then(res => {
      permissionList.value = res.data;
      // 移除空的children
      const removeEmptyChildren = (obj: any) => {
        if (obj.children && obj.children.length === 0) {
          delete obj.children;
        } else if (obj.children && obj.children.length > 0) {
          obj.children.forEach((child: any) => {
            removeEmptyChildren(child);
          });
        }
      }
      permissionList.value.forEach((obj: any) => {
        removeEmptyChildren(obj);
      });
    });
  }
});
</script>

<template>
  <NDrawer v-model:show="visible" :title="title" display-directive="show" :width="360">
    <NDrawerContent :title="title" :native-scrollbar="false" closable>
      <NForm ref="formRef" :model="model" :rules="rules">
        <NFormItem :label="$t('page.manage.role.roleName')" path="roleName">
          <NInput v-model:value="model.roleName" :placeholder="$t('page.manage.role.form.roleName')" />
        </NFormItem>
        <NFormItem :label="$t('page.manage.role.roleCode')" path="roleCode">
          <NInput v-model:value="model.roleCode" :placeholder="$t('page.manage.role.form.roleCode')" />
        </NFormItem>
        <NFormItem label="角色权限" path="permissionIds">
          <NCard>
            <n-space>
              <NCheckbox v-model:checked="isSpread" @update:checked="packHandle">展开/收起</NCheckbox>
              <NCheckbox v-model:checked="isAll" @update:checked="handleCheckAll">全选/全不选</NCheckbox>
            </n-space>
            <n-divider />
            <n-tree ref="treeRef" block-line cascade checkable virtual-scroll :data="permissionList"
              :checked-keys="model.permissions" :expanded-keys="expandedKeys" key-field="id" label-field="menuName"
              @update:checked-keys="checkedTree" @update:indeterminate-keys="indeterminateChange"
              @update:expanded-keys="onExpandedKeys" />
          </NCard>
        </NFormItem>
        <NFormItem :label="$t('page.manage.role.roleStatus')" path="status">
          <NRadioGroup v-model:value="model.status">
            <NRadio v-for="item in enableStatusOptions" :key="item.value" :value="item.value" :label="$t(item.label)" />
          </NRadioGroup>
        </NFormItem>
        <NFormItem :label="$t('page.manage.role.roleDesc')" path="remark">
          <NInput v-model:value="model.remark" :placeholder="$t('page.manage.role.form.roleDesc')" />
        </NFormItem>
      </NForm>
      <template #footer>
        <NSpace :size="16">
          <NButton @click="closeDrawer">{{ $t('common.cancel') }}</NButton>
          <NButton type="primary" @click="handleSubmit">{{ $t('common.confirm') }}</NButton>
        </NSpace>
      </template>
    </NDrawerContent>
  </NDrawer>
</template>

<style scoped></style>
