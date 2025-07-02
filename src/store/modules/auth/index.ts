import { computed, reactive, ref } from 'vue';
import { defineStore } from 'pinia';
import { useLoading } from '@yuencode/hooks';
import { SetupStoreId } from '@/enum';
import { useRouterPush } from '@/hooks/common/router';
import { fetchGetUserInfo, fetchLogin } from '@/service/api/auth';
import { localStg } from '@/utils/storage';
import { $t } from '@/locales';
import { useRouteStore } from '../route';
import { clearAuthStorage, getTenantId, getToken, getUserInfo } from './shared';

export const useAuthStore = defineStore(SetupStoreId.Auth, () => {
  const routeStore = useRouteStore();
  const { route, toLogin, redirectFromLogin } = useRouterPush(false);
  const { loading: loginLoading, startLoading, endLoading } = useLoading();

  const token = ref(getToken());
  const tenantId = ref(getTenantId());

  const userInfo: Api.Auth.UserInfo = reactive(getUserInfo());

  /** Is login */
  const isLogin = computed(() => Boolean(token.value));

  /** Reset auth store */
  async function resetStore() {
    const authStore = useAuthStore();

    clearAuthStorage();

    authStore.$reset();

    if (!route.value.meta.constant) {
      await toLogin();
    }

    routeStore.resetStore();
  }

  /**
   * Login
   *
   */
  async function login(params: {
    account: string;
    password: string;
    tenantId: number;
    verCode: string;
  }) {
    startLoading();

    const { data: loginToken, error } = await fetchLogin(params);
    if (!error) {
      const pass = await loginByToken(loginToken);

      if (pass) {
        await routeStore.initAuthRoute();

        await redirectFromLogin();

        if (routeStore.isInitAuthRoute) {
          window.$notification?.success({
            title: $t('page.login.common.loginSuccess'),
            content: $t('page.login.common.welcomeBack', { username: userInfo.nickname }),
            duration: 4500
          });
        }
      }
    } else {
      resetStore();
    }

    endLoading();
  }

  async function loginByToken(loginToken: Api.Auth.LoginToken) {
    // 1. stored in the localStorage, the later requests need it in headers
    localStg.set('token', loginToken.token);
    localStg.set('refreshToken', loginToken.refreshToken);
    localStg.set('tenantId', loginToken.tenantId);

    const { data: info, error } = await fetchGetUserInfo();

    if (!error) {
      // 2. store user info
      localStg.set('userInfo', info);

      // 3. update auth route
      token.value = loginToken.token;
      tenantId.value = loginToken.tenantId;
      Object.assign(userInfo, info);

      return true;
    }

    return false;
  }

  return {
    token,
    tenantId,
    userInfo,
    isLogin,
    loginLoading,
    resetStore,
    login
  };
});
