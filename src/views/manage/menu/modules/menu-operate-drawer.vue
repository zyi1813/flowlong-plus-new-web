<script setup lang="tsx">
import { computed, reactive, watch } from 'vue';
import type { SelectOption } from 'naive-ui';
import { useFormRules, useNaiveForm } from '@/hooks/common/form';
import { $t } from '@/locales';
import { enableStatusOptions, menuIconTypeOptions, menuTypeOptions } from '@/constants/business';
import SvgIcon from '@/components/custom/svg-icon.vue';
import { getLocalIcons } from '@/utils/icon';
import { createMenu, updateMenu } from '@/service/api/system-manage';

defineOptions({
  name: 'MenuOperateDrawer'
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
  rowData?: Api.SystemManage.Menu | null;
  menuList: Array<Api.SystemManage.Menu>;
  parentId: number;
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
    add: $t('page.manage.menu.addMenu'),
    edit: $t('page.manage.menu.editMenu')
  };
  return titles[props.operateType];
});

type Model = Omit<Api.SystemManage.Menu, 'createBy' | 'updateBy' | 'createTime' | 'updateTime'>;

const model: Model = reactive(createDefaultModel());

function createDefaultModel(): Model {
  return {
    id: 0,
    parentId: 0,
    menuType: '0',
    menuName: '',
    icon: '',
    localIcon: '',
    iconType: '1',
    routeName: '',
    routePath: '',
    component: '',
    status: '1',
    hideInMenu: false,
    orderNum: 0,
    isFrame: false,
    fixedIndexInTab: 0
  };
}

type RuleKey = Extract<keyof Model, 'username' | 'userStatus'>;

const rules: Record<RuleKey, App.Global.FormRule> = {
  menuName: defaultRequiredRule
  // icon: defaultRequiredRule,
  // component: defaultRequiredRule
};

const localIcons = getLocalIcons();
const localIconOptions = localIcons.map<SelectOption>(item => ({
  label: () => (
    <div class="flex-y-center gap-16px">
      <SvgIcon localIcon={item} class="text-icon" />
      <span>{item}</span>
    </div>
  ),
  value: item
}));

function handleUpdateModelWhenEdit() {
  if (props.operateType === 'add') {
    Object.assign(model, createDefaultModel());
    model.parentId = props.parentId;
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
  if (model.iconType === '2') {
    model.localIcon = model.icon;
    model.icon = '';
  }
  if (props.operateType === 'add') {
    createMenu(model).then(() => {
      window.$message?.success($t('common.updateSuccess'));
      closeDrawer();
      emit('submitted');
    });
  }
  if (props.operateType === 'edit') {
    updateMenu(model).then(() => {
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
        <NDivider title-placement="left">{{ $t('page.manage.menu.basicSetting') }}</NDivider>
        <NFormItem label="上级" path="parentId">
          <NTreeSelect
            v-model:value="model.parentId"
            key-field="id"
            label-field="menuName"
            :options="menuList"
            clearable
          />
        </NFormItem>
        <NFormItem :label="$t('page.manage.menu.menuType')" path="menuType">
          <NRadioGroup v-model:value="model.menuType">
            <NRadio v-for="item in menuTypeOptions" :key="item.value" :value="item.value" :label="$t(item.label)" />
          </NRadioGroup>
        </NFormItem>
        <div v-show="model.menuType === '0'">
          <NFormItem :label="$t('page.manage.menu.dirName')" path="menuName">
            <NInput v-model:value="model.menuName" :placeholder="$t('page.manage.menu.form.dirName')" />
          </NFormItem>
        </div>
        <div v-show="model.menuType === '1'">
          <NFormItem :label="$t('page.manage.menu.menuName')" path="menuName">
            <NInput v-model:value="model.menuName" :placeholder="$t('page.manage.menu.form.menuName')" />
          </NFormItem>
        </div>
        <div v-show="model.menuType === '2'">
          <NFormItem :label="$t('page.manage.menu.btnName')" path="menuName">
            <NInput v-model:value="model.menuName" :placeholder="$t('page.manage.menu.form.btnName')" />
          </NFormItem>
        </div>
        <div v-show="model.menuType !== '0'">
          <NGrid x-gap="12" :cols="2">
            <NGi>
              <NFormItem label="权限标识" path="permissionCode">
                <NInput v-model:value="model.permissionCode" placeholder="请输入权限标识" />
              </NFormItem>
            </NGi>
            <NGi>
              <NFormItem label="权限名称" path="permissionName">
                <NInput v-model:value="model.permissionName" placeholder="请输入权限名称" />
              </NFormItem>
            </NGi>
          </NGrid>
        </div>
        <div v-show="model.menuType !== '2'">
          <NFormItem :label="$t('page.manage.menu.iconTypeTitle')" path="iconType">
            <NRadioGroup v-model:value="model.iconType">
              <NRadio
                v-for="item in menuIconTypeOptions"
                :key="item.value"
                :value="item.value"
                :label="$t(item.label)"
              />
              <a
                href="https://icones.js.org/collection/carbon"
                target="_blank"
                rel="noopener noreferrer"
                class="text-color-blue cursor-pointer"
              >
                iconify
              </a>
            </NRadioGroup>
          </NFormItem>
          <NFormItem :label="$t('page.manage.menu.icon')" path="icon">
            <template v-if="model.iconType === '1'">
              <NInput v-model:value="model.icon" :placeholder="$t('page.manage.menu.form.icon')" class="flex-1">
                <template #suffix>
                  <SvgIcon v-if="model.icon" :icon="model.icon" class="text-icon" />
                </template>
              </NInput>
            </template>
            <template v-if="model.iconType === '2'">
              <NSelect
                v-model:value="model.icon"
                :placeholder="$t('page.manage.menu.form.localIcon')"
                :options="localIconOptions"
              />
            </template>
          </NFormItem>
          <NFormItem :label="$t('page.manage.menu.routeName')" path="routeName">
            <NInput v-model:value="model.routeName" :placeholder="$t('page.manage.menu.form.routeName')" />
          </NFormItem>
          <NFormItem :label="$t('page.manage.menu.routePath')" path="routePath">
            <NInput v-model:value="model.routePath" :placeholder="$t('page.manage.menu.form.routePath')" />
          </NFormItem>
          <NFormItem :label="$t('page.manage.menu.component')" path="component">
            <NInput v-model:value="model.component" :placeholder="$t('page.manage.menu.form.component')" />
          </NFormItem>
          <NFormItem :label="$t('page.manage.menu.hideInMenu')" path="hideInMenu">
            <NRadioGroup v-model:value="model.hideInMenu">
              <NRadio :value="true" :label="$t('common.yesOrNo.yes')" />
              <NRadio :value="false" :label="$t('common.yesOrNo.no')" />
            </NRadioGroup>
          </NFormItem>
        </div>
        <NFormItem :label="$t('page.manage.menu.menuStatus')" path="status">
          <NRadioGroup v-model:value="model.status">
            <NRadio v-for="item in enableStatusOptions" :key="item.value" :value="item.value" :label="$t(item.label)" />
          </NRadioGroup>
        </NFormItem>
        <NFormItem :label="$t('page.manage.menu.order')" path="orderNum">
          <NInputNumber v-model:value="model.orderNum" :placeholder="$t('page.manage.menu.form.order')" />
        </NFormItem>
        <div v-show="model.menuType !== '2'">
          <NDivider title-placement="left">拓展设置</NDivider>
          <NGrid v-show="model.menuType === '1'" x-gap="12" :cols="3">
            <NGi>
              <NFormItem label="是否外链" path="isFrame">
                <template #label>
                  <span>
                    <span>是否外链</span>
                  </span>
                </template>
                <NSwitch v-model:value="model.isFrame" />
              </NFormItem>
            </NGi>
            <NGi>
              <NFormItem label="是否缓存" path="keepAlive">
                <template #label>
                  <span>
                    <span>是否缓存</span>
                  </span>
                </template>
                <NSwitch v-model:value="model.keepAlive" />
              </NFormItem>
            </NGi>
            <NGi>
              <NFormItem label="多标签页" path="multiTab">
                <template #label>
                  <span>
                    <span>多标签页</span>
                  </span>
                </template>
                <NSwitch v-model:value="model.multiTab" />
              </NFormItem>
            </NGi>
          </NGrid>
          <NFormItem v-if="model.isFrame && model.menuType === '1'" label="外部地址" path="href">
            <NInput v-model:value="model.href" placeholder="请输入外部地址" />
          </NFormItem>
          <NFormItem label="i18nKey" path="i18nKey">
            <NInput v-model:value="model.i18nKey" placeholder="请输入i18nKey" />
          </NFormItem>
          <NFormItem v-show="model.menuType === '1'" label="固定多页签" path="fixedIndexInTab">
            <NInputNumber v-model:value="model.fixedIndexInTab" />
          </NFormItem>
        </div>
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

<style scoped>
.n-form .n-divider {
  margin-top: 0;
}
</style>
