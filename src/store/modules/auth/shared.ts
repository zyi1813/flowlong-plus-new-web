import { localStg } from '@/utils/storage';

/** Get token */
export function getToken() {
  return localStg.get('token') || '';
}

/** Get tenantId */
export function getTenantId() {
  return localStg.get('tenantId') || '';
}

/** Get user info */
export function getUserInfo() {
  const emptyInfo: Api.Auth.UserInfo = {
    userId: '',
    username: '',
    roles: []
  };
  const userInfo = localStg.get('userInfo') || emptyInfo;

  return userInfo;
}

/** Clear auth storage */
export function clearAuthStorage() {
  localStg.remove('token');
  localStg.remove('tenantId');
  localStg.remove('refreshToken');
  localStg.remove('userInfo');
}
