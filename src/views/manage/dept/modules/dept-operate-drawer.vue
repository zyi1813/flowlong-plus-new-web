<script setup lang="tsx">
import { computed, reactive, ref, watch } from 'vue';
import { useFormRules, useNaiveForm } from '@/hooks/common/form';
import { $t } from '@/locales';
import { addDept, getDeptTreeList, updateDept } from '@/service/api/system-manage';

defineOptions({
  name: 'DeptOperateDrawer'
});

/**
 * the type of operation
 *
 * - add: add user
 * - edit: edit user
 */
export type OperateType = 'add' | 'edit';

interface Props {
  /** the type of operation */
  operateType: OperateType;
  /** the edit row data */
  rowData?: Api.SystemManage.Dept | null;
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
    add: '新增部门',
    edit: '编辑部门'
  };
  return titles[props.operateType];
});

type Model = Omit<Api.SystemManage.Dept, 'createBy' | 'updateBy' | 'createTime' | 'updateTime' | 'status' | 'id'>;

const model: Model = reactive(createDefaultModel());

function createDefaultModel(): Model {
  return {
    deptId: 0,
    deptName: '',
    parent: 0,
    orderNum: 0,
    isEnable: true
  };
}

type RuleKey = Extract<keyof Model, 'deptName'>;

const rules: Record<RuleKey, App.Global.FormRule> = {
  deptName: defaultRequiredRule
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
  // request
  if (props.operateType === 'add') {
    addDept(model).then(() => {
      window.$message?.success($t('common.updateSuccess'));
      closeDrawer();
      emit('submitted');
    });
  }
  if (props.operateType === 'edit') {
    updateDept(model).then(() => {
      window.$message?.success($t('common.updateSuccess'));
      closeDrawer();
      emit('submitted');
    });
  }
}

const deptTreeList = ref([]);
watch(visible, () => {
  if (visible.value) {
    handleUpdateModelWhenEdit();
    restoreValidation();

    getDeptTreeList().then(res => {
      deptTreeList.value = res.data;
    });
  }
});
</script>

<template>
  <NDrawer v-model:show="visible" :title="title" display-directive="show" :width="520">
    <NDrawerContent :title="title" :native-scrollbar="false" closable>
      <NForm ref="formRef" :model="model" :rules="rules" label-placement="left" :label-width="80">
        <NFormItem label="上级" path="parentId">
          <NTreeSelect
            v-model:value="model.parent"
            label-field="deptName"
            value-field="deptId"
            key-field="deptId"
            :options="deptTreeList"
            clearable
            placeholder="请选择上级部门"
          />
        </NFormItem>
        <NFormItem label="部门名称" path="deptName">
          <NInput v-model:value="model.deptName" placeholder="请输入部门名称" />
        </NFormItem>
        <NFormItem :label="$t('page.manage.menu.order')" path="orderNum">
          <NInputNumber v-model:value="model.orderNum" :placeholder="$t('page.manage.menu.form.order')" />
        </NFormItem>
        <NFormItem label="状态" path="isEnable">
          <n-switch v-model:value="model.isEnable">
            <template #checked>启用</template>
            <template #unchecked>禁用</template>
          </n-switch>
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
