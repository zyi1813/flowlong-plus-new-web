<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue';
import { cloneDeep } from 'lodash-es';
import { useFormRules, useNaiveForm } from '@/hooks/common/form';
import { addUser, getDeptTreeList, getRoleOptions, updateUser, getPostOptions } from '@/service/api/system-manage';
import { $t } from '@/locales';
import { userGenderOptions } from '@/constants/business';

defineOptions({
  name: 'UserOperateDrawer'
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
  rowData?: Api.SystemManage.User | null;
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
    add: $t('page.manage.user.addUser'),
    edit: $t('page.manage.user.editUser')
  };
  return titles[props.operateType];
});

type Model = Pick<
  Api.SystemManage.User,
  | 'account'
  | 'sex'
  | 'nickname'
  | 'mobile'
  | 'email'
  | 'roleIds'
  | 'isEnable'
  | 'deptId'
  | 'postId'
  | 'password'
  | 'userId'
>;

const model: Model = reactive(createDefaultModel());

function createDefaultModel(): Model {
  return {
    account: '',
    password: '',
    sex: '1',
    nickname: '',
    mobile: '',
    email: '',
    roleIds: [],
    isEnable: true,
    deptId: 0,
    postId: [],
    userId: 0
  };
}

type RuleKey = Extract<keyof Model, 'account' | 'nickname'>;

const rules: Record<RuleKey, App.Global.FormRule> = {
  account: defaultRequiredRule,
  nickname: defaultRequiredRule
};

/** the enabled role options */
const roleOptions = ref<Api.SystemManage.AllRole[]>([]);
const deptOptions = ref<any[]>();
const postOptions = ref<Api.SystemManage.PostOptions[]>();

async function getRoleOptionsHandle() {
  const { data } = await getRoleOptions();
  roleOptions.value = data ? data : [];
}

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
  const submitData: any = cloneDeep(model);
  if (props.operateType === 'add') {
    await addUser(submitData);
  }
  if (props.operateType === 'edit') {
    await updateUser(submitData);
  }
  window.$message?.success($t('common.updateSuccess'));
  closeDrawer();
  emit('submitted');
}

watch(visible, () => {
  if (visible.value) {
    handleUpdateModelWhenEdit();
    restoreValidation();
    getRoleOptionsHandle();
    getDeptTreeList().then(res => {
      deptOptions.value = res.data;
    });
    getPostOptions().then(res => {
      postOptions.value = res.data ? res.data : [];
    });
  }
});
</script>

<template>
  <NDrawer v-model:show="visible" :title="title" display-directive="show" :width="360">
    <NDrawerContent :title="title" :native-scrollbar="false" closable>
      <NForm ref="formRef" :model="model" :rules="rules">
        <NFormItem :label="$t('page.manage.user.username')" path="account">
          <NInput v-model:value="model.account" :placeholder="$t('page.manage.user.form.username')" />
        </NFormItem>
        <NFormItem label="密码" path="password">
          <NInput v-model:value="model.password" placeholder="请输入密码" />
        </NFormItem>
        <NFormItem :label="$t('page.manage.user.userGender')" path="userGender">
          <NRadioGroup v-model:value="model.sex">
            <NRadio v-for="item in userGenderOptions" :key="item.value" :value="item.value" :label="$t(item.label)" />
          </NRadioGroup>
        </NFormItem>
        <NFormItem :label="$t('page.manage.user.nickName')" path="nickName">
          <NInput v-model:value="model.nickname" :placeholder="$t('page.manage.user.form.nickName')" />
        </NFormItem>
        <NFormItem :label="$t('page.manage.user.userPhone')" path="userPhone">
          <NInput v-model:value="model.mobile" :placeholder="$t('page.manage.user.form.userPhone')" />
        </NFormItem>
        <NFormItem :label="$t('page.manage.user.userEmail')" path="email">
          <NInput v-model:value="model.email" :placeholder="$t('page.manage.user.form.userEmail')" />
        </NFormItem>
        <NFormItem label="所属部门" path="deptId">
          <NTreeSelect
            v-model:value="model.deptId"
            label-field="deptName"
            value-field="deptId"
            key-field="deptId"
            :options="deptOptions"
            clearable
            placeholder="请选择部门"
          />
        </NFormItem>
        <NFormItem label="所在岗位" path="postId">
          <NSelect
            v-model:value="model.postId"
            label-field="postName"
            value-field="postId"
            :options="postOptions"
            clearable
            placeholder="请选择所在岗位"
          />
        </NFormItem>
        <NFormItem :label="$t('page.manage.user.userRole')" path="roles">
          <NSelect
            v-model:value="model.roleIds"
            multiple
            label-field="roleName"
            value-field="roleId"
            :options="roleOptions"
            :placeholder="$t('page.manage.user.form.userRole')"
          />
        </NFormItem>
        <NFormItem :label="$t('page.manage.user.userStatus')" path="status">
          <NSwitch v-model:value="model.isEnable"></NSwitch>
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
