<script setup lang="tsx">
import { computed, reactive, ref, watch } from 'vue';
import moment from 'moment';
import { cloneDeep } from 'lodash-es';
import { useFormRules, useNaiveForm } from '@/hooks/common/form';
import { $t } from '@/locales';
import { addTenant, updateTenant } from '@/service/api/system-manage';
import { enableStatusOptions } from '@/constants/business';

defineOptions({
  name: 'TenantOperateDrawer'
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
  rowData?: Api.SystemManage.Tenant | null;
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
    add: '新增租户',
    edit: '编辑租户'
  };
  return titles[props.operateType];
});

type Model = Omit<Api.SystemManage.Tenant, 'createBy' | 'updateBy' | 'createTime' | 'updateTime'>;

const model: Model = reactive(createDefaultModel());

function createDefaultModel(): Model {
  return {
    id: 0,
    tenantName: '',
    tenantCode: '',
    status: '1',
    beginDate: '',
    endDate: ''
  };
}

type RuleKey = Extract<keyof Model, 'tenantName'>;

const rules: Record<RuleKey, App.Global.FormRule> = {
  tenantName: defaultRequiredRule
};

const beginDate = ref(0);
const endDate = ref(0);

function handleUpdateModelWhenEdit() {
  if (props.operateType === 'add') {
    const t = new Date().getTime();
    beginDate.value = t;
    endDate.value = t;
    Object.assign(model, createDefaultModel());
    return;
  }

  if (props.operateType === 'edit' && props.rowData) {
    const rowData = props.rowData;
    beginDate.value = new Date(rowData.beginDate as string).getTime();
    endDate.value = new Date(rowData.endDate as string).getTime();
    Object.assign(model, rowData);
  }
}

function closeDrawer() {
  visible.value = false;
}

async function handleSubmit() {
  await validate();
  // request
  const submitData: Model = cloneDeep(model);
  submitData.beginDate = moment(beginDate.value).format('YYYY-MM-DD HH:mm:ss');
  submitData.endDate = moment(endDate.value).format('YYYY-MM-DD HH:mm:ss');
  if (props.operateType === 'add') {
    addTenant(submitData).then(() => {
      window.$message?.success($t('common.updateSuccess'));
      closeDrawer();
      emit('submitted');
    });
  }
  if (props.operateType === 'edit') {
    updateTenant(submitData).then(() => {
      window.$message?.success($t('common.updateSuccess'));
      closeDrawer();
      emit('submitted');
    });
  }
}

watch(visible, () => {
  if (visible.value) {
    handleUpdateModelWhenEdit();
    restoreValidation();
  }
});
</script>

<template>
  <NDrawer v-model:show="visible" :title="title" display-directive="show" :width="520">
    <NDrawerContent :title="title" :native-scrollbar="false" closable>
      <NForm ref="formRef" :model="model" :rules="rules" label-placement="left" :label-width="80">
        <NFormItem label="租户名称" path="tenantName">
          <NInput v-model:value="model.tenantName" placeholder="请输入租户名称" />
        </NFormItem>
        <NFormItem label="租户编码" path="tenantCode">
          <NInput v-model:value="model.tenantCode" placeholder="请输入租户编码" />
        </NFormItem>
        <NFormItem label="开始时间" path="beginDate">
          <NDatePicker v-model:value="beginDate" type="datetime" clearable />
        </NFormItem>
        <NFormItem label="结束时间" path="endDate">
          <NDatePicker v-model:value="endDate" type="datetime" clearable />
        </NFormItem>
        <NFormItem label="状态" path="status">
          <NRadioGroup v-model:value="model.status">
            <NRadio v-for="item in enableStatusOptions" :key="item.value" :value="item.value" :label="$t(item.label)" />
          </NRadioGroup>
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
