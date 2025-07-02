import { request } from '../../request';

/** @description: 查询组织架构树 */
export function getOrgTree(params?: any) {
  return request({
    url: '/workflow/oa/org/tree',
    method: 'GET',
    params
  });
}

/** @description: 模糊搜索用户 */
export function searchOrgTreeUser(params?: any) {
  return request({
    url: '/workflow/oa/org/tree/user/search',
    method: 'GET',
    params
  });
}

/** 获取用户信息 */
export function getUserInfo(userId: string, setType: number) {
  return request({
    url: '/workflow/oa/org/getUserInfo',
    method: 'GET',
    params: {
      userId,
      setType
    }
  });
}

/** @description: 获取所有角色列表 */
export function getAllRoles() {
  return request({
    url: '/api/role/all',
    method: 'GET'
  });
}

/** @description: 根据角色ID获取用户列表 */
export function getUsersByRole(roleId: string) {
  return request({
    url: '/api/role/users',
    method: 'GET',
    params: {
      roleId
    }
  });
}

/** @description: 获取部门树 */
export function getDeptTree() {
  return request({
    url: '/api/dept/all',
    method: 'GET'
  });
}
