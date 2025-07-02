import { request } from '../request';

/**
 * Login
 *
 * @param username User name
 * @param password Password
 */
export function fetchLogin(data: {
  account: string;
  password: string;
  tenantId: number;
  verCode: string;
}) {
  return request<Api.Auth.LoginToken>({
    url: '/api/auth/login',
    method: 'post',
    data
  });
}

/**
 * 退出登录
 */
export function logout() {
  return request<any>({
    url: '/api/auth/logout',
    method: 'post'
  });
}

/** Get user info */
export function fetchGetUserInfo() {
  return request<Api.Auth.UserInfo>({ url: '/api/auth/info', method: 'post' });
}


export function captchaBase64() {
  return request<{ img: string }>({
    url: '/api/auth/captchaBase64',
    method: 'GET',
  });
}
