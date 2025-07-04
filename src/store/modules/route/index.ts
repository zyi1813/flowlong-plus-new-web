import { computed, ref } from 'vue';
import type { RouteRecordRaw } from 'vue-router';
import { defineStore } from 'pinia';
import { useBoolean } from '@yuencode/hooks';
import type { CustomRoute, ElegantConstRoute, LastLevelRouteKey, RouteKey, RouteMap } from '@elegant-router/types';
import { SetupStoreId } from '@/enum';
import { router } from '@/router';
import { ROOT_ROUTE, createRoutes, getAuthVueRoutes } from '@/router/routes';
import { getRouteName, getRoutePath } from '@/router/elegant/transform';
import { fetchGetUserRoutes, fetchIsRouteExist } from '@/service/api/route';
import { useAppStore } from '../app';
import { useAuthStore } from '../auth';
import { useTabStore } from '../tab';
import {
  filterAuthRoutesByRoles,
  getBreadcrumbsByRoute,
  getCacheRouteNames,
  getGlobalMenusByAuthRoutes,
  getSelectedMenuKeyPathByKey,
  isRouteExistByRouteName,
  sortRoutesByOrder,
  updateLocaleOfGlobalMenus
} from './shared';

export const useRouteStore = defineStore(SetupStoreId.Route, () => {
  const appStore = useAppStore();
  const authStore = useAuthStore();
  const tabStore = useTabStore();
  const { bool: isInitAuthRoute, setBool: setIsInitAuthRoute } = useBoolean();
  const removeRouteFns: (() => void)[] = [];

  /**
   * Auth route mode
   *
   * It recommends to use static mode in the development environment, and use dynamic mode in the production
   * environment, if use static mode in development environment, the auth routes will be auto generated by plugin
   * "@elegant-router/vue"
   */
  const authRouteMode = ref(import.meta.env.VITE_AUTH_ROUTE_MODE);

  /** Home route key */
  const routeHome = ref(import.meta.env.VITE_ROUTE_HOME);

  /**
   * Set route home
   *
   * @param routeKey Route key
   */
  function setRouteHome(routeKey: LastLevelRouteKey) {
    routeHome.value = routeKey;
  }

  /** Global menus */
  // 菜单栏数据
  const menus = ref<App.Global.Menu[]>([]);

  /** Get global menus */
  function getGlobalMenus(routes: ElegantConstRoute[]) {
    menus.value = getGlobalMenusByAuthRoutes(routes);
  }

  /** Update global menus by locale */
  function updateGlobalMenusByLocale() {
    menus.value = updateLocaleOfGlobalMenus(menus.value);
  }

  /** Cache routes */
  const cacheRoutes = ref<RouteKey[]>([]);

  /**
   * Get cache routes
   *
   * @param routes Vue routes
   */
  function getCacheRoutes(routes: RouteRecordRaw[]) {
    const { constantVueRoutes } = createRoutes();

    cacheRoutes.value = getCacheRouteNames([...constantVueRoutes, ...routes]);
  }

  /**
   * Add cache routes
   *
   * @param routeKey
   */
  function addCacheRoutes(routeKey: RouteKey) {
    if (cacheRoutes.value.includes(routeKey)) return;

    cacheRoutes.value.push(routeKey);
  }

  /**
   * Remove cache routes
   *
   * @param routeKey
   */
  function removeCacheRoutes(routeKey: RouteKey) {
    const index = cacheRoutes.value.findIndex(item => item === routeKey);

    if (index === -1) return;

    cacheRoutes.value.splice(index, 1);
  }

  /**
   * Re-cache routes by route key
   *
   * @param routeKey
   */
  async function reCacheRoutesByKey(routeKey: RouteKey) {
    removeCacheRoutes(routeKey);

    await appStore.reloadPage();

    addCacheRoutes(routeKey);
  }

  /**
   * Re-cache routes by route keys
   *
   * @param routeKeys
   */
  async function reCacheRoutesByKeys(routeKeys: RouteKey[]) {
    for await (const key of routeKeys) {
      await reCacheRoutesByKey(key);
    }
  }

  /** Global breadcrumbs */
  const breadcrumbs = computed(() => getBreadcrumbsByRoute(router.currentRoute.value, menus.value));

  /** Reset store */
  async function resetStore() {
    const routeStore = useRouteStore();

    routeStore.$reset();

    resetVueRoutes();
  }

  /** Reset vue routes */
  function resetVueRoutes() {
    removeRouteFns.forEach(fn => fn());
    removeRouteFns.length = 0;
  }

  /** Init auth route */
  async function initAuthRoute() {
    if (authRouteMode.value === 'static') {
      await initStaticAuthRoute();
    } else {
      await initDynamicAuthRoute();
    }

    tabStore.initHomeTab();
  }

  /** Init static auth route */
  // 初始化静态定义中需要授权的路由中，有权限的路由 与动态二选一
  async function initStaticAuthRoute() {
    const { authRoutes } = createRoutes();

    const filteredAuthRoutes = filterAuthRoutesByRoles(authRoutes, authStore.userInfo.roles);

    handleAuthRoutes(filteredAuthRoutes);

    setIsInitAuthRoute(true);
  }

  /** Init dynamic auth route */
  // 初始化接口获取的需要授权的路由中，有权限的路由 与静态二选一
  async function initDynamicAuthRoute() {
    const { data, error } = await fetchGetUserRoutes();

    if (!error) {
      const { routes, home } = data;
      console.log(routes);
      handleAuthRoutes(routes);

      setRouteHome(home);

      handleUpdateRootRouteRedirect(home);

      setIsInitAuthRoute(true);
    } else {
      // 登录过期
      localStorage.removeItem('token');
    }
  }

  /**
   * Handle routes
   *
   * @param routes Auth routes
   */
  function handleAuthRoutes(routes: ElegantConstRoute[]) {
    const sortRoutes = sortRoutesByOrder(routes);

    const vueRoutes = getAuthVueRoutes(sortRoutes);
    console.log(vueRoutes);
    // 添加授权的路由
    addRoutesToVueRouter(vueRoutes);
    // 设置菜单数据
    getGlobalMenus(sortRoutes);

    getCacheRoutes(vueRoutes);
  }

  /**
   * Add routes to vue router
   *
   * @param routes Vue routes
   */
  function addRoutesToVueRouter(routes: RouteRecordRaw[]) {
    routes.forEach(route => {
      const removeFn = router.addRoute(route);
      addRemoveRouteFn(removeFn);
    });
  }

  /**
   * Add remove route fn
   *
   * @param fn
   */
  function addRemoveRouteFn(fn: () => void) {
    removeRouteFns.push(fn);
  }

  /**
   * Update root route redirect when auth route mode is dynamic
   *
   * @param redirectKey Redirect route key
   */
  function handleUpdateRootRouteRedirect(redirectKey: LastLevelRouteKey) {
    const redirect = getRoutePath(redirectKey);

    if (redirect) {
      const rootRoute: CustomRoute = { ...ROOT_ROUTE, redirect };

      router.removeRoute(rootRoute.name);

      const [rootVueRoute] = getAuthVueRoutes([rootRoute]);

      router.addRoute(rootVueRoute);
    }
  }

  /**
   * Get is auth route exist
   *
   * @param routePath Route path
   */
  async function getIsAuthRouteExist(routePath: RouteMap[RouteKey]) {
    const routeName = getRouteName(routePath);

    if (!routeName) {
      return false;
    }

    if (authRouteMode.value === 'static') {
      const { authRoutes } = createRoutes();

      return isRouteExistByRouteName(routeName, authRoutes);
    }

    // const { data } = await fetchIsRouteExist(routeName);
    return true;
  }

  /**
   * Get selected menu key path
   *
   * @param selectedKey Selected menu key
   */
  function getSelectedMenuKeyPath(selectedKey: string) {
    return getSelectedMenuKeyPathByKey(selectedKey, menus.value);
  }

  return {
    resetStore,
    routeHome,
    menus,
    updateGlobalMenusByLocale,
    cacheRoutes,
    reCacheRoutesByKey,
    reCacheRoutesByKeys,
    breadcrumbs,
    initAuthRoute,
    isInitAuthRoute,
    setIsInitAuthRoute,
    getIsAuthRouteExist,
    getSelectedMenuKeyPath
  };
});
