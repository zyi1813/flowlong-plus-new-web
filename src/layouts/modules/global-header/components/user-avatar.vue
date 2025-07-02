<script setup lang="ts">
import { computed } from 'vue';
import type { VNode } from 'vue';
import { useSvgIconRender } from '@yuencode/hooks';
import { useAuthStore } from '@/store/modules/auth';
import { useRouterPush } from '@/hooks/common/router';
import { $t } from '@/locales';
import SvgIcon from '@/components/custom/svg-icon.vue';
import { logout as logoutAccount } from '@/service/api/auth'

defineOptions({
  name: 'UserAvatar'
});

const authStore = useAuthStore();
console.log("authStore:",authStore.userInfo.nickname)
const { routerPushByKey, toLogin } = useRouterPush();
const { SvgIconVNode } = useSvgIconRender(SvgIcon);

function loginOrRegister() {
  toLogin();
}

type DropdownKey = 'user-center' | 'logout';

type DropdownOption =
  | {
      key: DropdownKey;
      label: string;
      icon?: () => VNode;
    }
  | {
      type: 'divider';
      key: string;
    };

const options = computed(() => {
  const opts: DropdownOption[] = [
    {
      label: $t('common.userCenter'),
      key: 'user-center',
      icon: SvgIconVNode({ icon: 'ph:user-circle', fontSize: 18 })
    },
    {
      type: 'divider',
      key: 'divider'
    },
    {
      label: $t('common.logout'),
      key: 'logout',
      icon: SvgIconVNode({ icon: 'ph:sign-out', fontSize: 18 })
    }
  ];

  return opts;
});

function logout() {
  window.$dialog?.info({
    title: $t('common.tip'),
    content: $t('common.logoutConfirm'),
    positiveText: $t('common.confirm'),
    negativeText: $t('common.cancel'),
    onPositiveClick: () => {
      logoutAccount().then(()=>{
        authStore.resetStore();
      })
    }
  });
}

function handleDropdown(key: DropdownKey) {
  if (key === 'logout') {
    logout();
  } else {
    routerPushByKey(key);
  }
}
</script>

<template>
  <NButton v-if="!authStore.isLogin" quaternary @click="loginOrRegister">
    {{ $t('page.login.common.loginOrRegister') }}
  </NButton>
  <NDropdown v-else placement="bottom" trigger="click" :options="options" @select="handleDropdown">
    <div class="flex-center h-full cursor-pointer">
      <ButtonIcon>
        <SvgIcon icon="ph:user-circle" class="text-icon-large" />
        <span class="text-16px font-medium ml-2">{{ authStore.userInfo.nickname }}</span>
      </ButtonIcon>
    </div>
  </NDropdown>
</template>

<style scoped></style>
