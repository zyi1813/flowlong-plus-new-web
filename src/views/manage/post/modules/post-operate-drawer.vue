<script setup lang="tsx">
import { computed, reactive, watch } from 'vue';
import { useFormRules, useNaiveForm } from '@/hooks/common/form';
import { $t } from '@/locales';
import { addPost, updatePost } from '@/service/api/system-manage';
import { enableStatusOptions } from '@/constants/business';

defineOptions({
  name: 'PostOperateDrawer'
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
  rowData?: Api.SystemManage.Post | null;
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
    add: '新增岗位',
    edit: '编辑岗位'
  };
  return titles[props.operateType];
});

type Model = Omit<Api.SystemManage.Post, 'createBy' | 'updateBy' | 'createTime' | 'updateTime' | 'id'>;

const model: Model = reactive(createDefaultModel());

function createDefaultModel(): Model {
  return {
    postId: 0,
    postName: '',
    postCode: '',
    orderNum: 0,
    status: '1'
  };
}

type RuleKey = Extract<keyof Model, 'postName'>;

const rules: Record<RuleKey, App.Global.FormRule> = {
  postName: defaultRequiredRule
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
    addPost(model).then(() => {
      window.$message?.success($t('common.updateSuccess'));
      closeDrawer();
      emit('submitted');
    });
  }
  if (props.operateType === 'edit') {
    updatePost(model).then(() => {
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
        <NFormItem label="岗位名称" path="postName">
          <NInput v-model:value="model.postName" placeholder="请输入岗位名称" />
        </NFormItem>
        <NFormItem label="岗位编码" path="postCode">
          <NInput v-model:value="model.postCode" placeholder="请输入岗位编码" />
        </NFormItem>
        <NFormItem :label="$t('page.manage.menu.order')" path="orderNum">
          <NInputNumber v-model:value="model.orderNum" :placeholder="$t('page.manage.menu.form.order')" />
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
