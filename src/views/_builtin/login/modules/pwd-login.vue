<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue';
import { $t } from '@/locales';
// import { loginModuleRecord } from '@/constants/app';
// import { useRouterPush } from '@/hooks/common/router';
import { useFormRules, useNaiveForm } from '@/hooks/common/form';
import { useAuthStore } from '@/store/modules/auth';
import { getTenantOptions } from '@/service/api/system-manage';
import { captchaBase64 } from '@/service/api/auth';

defineOptions({
  name: 'PwdLogin'
});

const authStore = useAuthStore();
// const { toggleLoginModule } = useRouterPush();
const { formRef, validate } = useNaiveForm();

interface FormModel {
  account: string;
  password: string;
  verCode: string;
  tenantId: number;
}

const model: FormModel = reactive({
  account: 'admin',
  password: '123456',
  verCode: '',
  tenantId: 0
});

const captchaImgUrl = ref<string>('');
const captchaLoading = ref(false);
const tenantOptions = ref();

const rules = computed<Record<keyof FormModel, App.Global.FormRule[]>>(() => {
  const { formRules } = useFormRules(); // inside computed to make locale reactive

  return {
    account: formRules.username,
    password: formRules.pwd,
    verCode: [
      {
        required: true,
        message: '验证码不能为空'
      }
    ],
    tenantId: [
      {
        required: true,
        message: '请选择租户'
      }
    ]
  };
});

async function handleSubmit() {
  await validate();
  await authStore.login({
    account: model.account,
    password: model.password,
    verCode: model.verCode,
    tenantId: model.tenantId
  });
  getCaptcha();
}

// 获取验证码
function getCaptcha() {
  captchaLoading.value = true;
  captchaBase64().then(({ data }) => {
    captchaImgUrl.value = data ? data.img : '';
    captchaLoading.value = false;
  });
}

// 获取租户列表
function getTentantList() {
  getTenantOptions().then(({ data }) => {
    if (data) {
      tenantOptions.value = data;
      if (data.length) {
        model.tenantId = data[0].tenantId;
      }
    }
  });
}

onMounted(() => {
  getCaptcha();
  getTentantList();
});
</script>

<template>
  <NForm ref="formRef" :model="model" :rules="rules" size="large" :show-label="false">
    <NFormItem path="tenantId">
      <n-select
        v-model:value="model.tenantId"
        :options="tenantOptions"
        label-field="tenantName"
        value-field="tenantId"
        placeholder="请选择租户"
        class="tenant-select"
      />
    </NFormItem>
    <NFormItem path="account">
      <NInput v-model:value="model.account" :placeholder="$t('page.login.common.userNamePlaceholder')" />
    </NFormItem>
    <NFormItem path="password">
      <NInput
        v-model:value="model.password"
        type="password"
        :placeholder="$t('page.login.common.passwordPlaceholder')"
      />
    </NFormItem>
    <NFormItem path="verCode">
      <div class="flex w-full">
        <NInput
          v-model:value="model.verCode"
          class="order-first mr-3 rounded-lg"
          :input-props="{ autocomplete: 'new-password' }"
          placeholder="请输入图形验证码"
        ></NInput>

        <NButton :loading="captchaLoading" class="order-last rounded-lg" @click="getCaptcha">
          <img :src="captchaImgUrl" />
        </NButton>
      </div>
    </NFormItem>
    <NSpace vertical :size="24">
      <div class="flex-y-center justify-between">
        <NCheckbox>{{ $t('page.login.pwdLogin.rememberMe') }}</NCheckbox>
        <!-- <NButton quaternary>{{ $t('page.login.pwdLogin.forgetPassword') }}</NButton> -->
      </div>
      <NButton type="primary" size="large" block round :loading="authStore.loginLoading" @click="handleSubmit">
        {{ $t('common.confirm') }}
      </NButton>
      <!--
 <div class="flex-y-center justify-between gap-12px">
        <NButton class="flex-1" block @click="toggleLoginModule('code-login')">
          {{ $t(loginModuleRecord['code-login']) }}
        </NButton>
        <NButton class="flex-1" block @click="toggleLoginModule('register')">
          {{ $t(loginModuleRecord.register) }}
        </NButton>
      </div> 
-->
    </NSpace>
  </NForm>
</template>

<style scoped></style>
