import { request } from '../request';

/** get role list */
export function fetchGetRoleList(params?: Api.SystemManage.RoleSearchParams) {
  return request<Api.SystemManage.RoleList>({
    url: '/systemManage/getRoleList',
    method: 'get',
    params
  });
}

/**
 * get all roles
 *
 * these roles are all enabled
 */
export function getRoleOptions() {
  return request<Api.SystemManage.AllRole[]>({
    url: '/api/role/options',
    method: 'get'
  });
}

export function fetchRoleList(params: Api.SystemManage.RoleSearchParams) {
  return request<Api.Common.PaginatingQueryRecord<Api.SystemManage.Role>>({
    url: '/api/role/list',
    method: 'get',
    params
  });
}

type RoleApi = Pick<
  Api.SystemManage.Role,
  'roleName' | 'roleCode' | 'remark' | 'status' | 'permissions' | 'permissionKeys'
>;

export function addRole(data: RoleApi) {
  return request<null>({
    url: '/api/role/add',
    method: 'post',
    data
  });
}

export function updateRole(data: RoleApi) {
  return request<null>({
    url: '/api/role/update',
    method: 'post',
    data
  });
}

export function deleteRole(ids: string) {
  return request<null>({
    url: '/api/role/delete',
    method: 'delete',
    params: {
      ids
    }
  });
}

export function infoRole(roleId: number) {
  return request<Api.SystemManage.Role>({
    url: '/api/role/info',
    method: 'get',
    params: {
      roleId
    }
  });
}

/** get user list */
export function fetchGetUserList(params?: Api.SystemManage.UserSearchParams) {
  return request<Api.SystemManage.UserList>({
    url: '/api/user/list',
    method: 'get',
    params
  });
}

export function fetchGetUserInfo(userId: number) {
  return request<Api.SystemManage.User>({
    url: '/api/user/info',
    method: 'get',
    params: {
      userId
    }
  });
}

export function deleteUser(ids: string) {
  return request<any>({
    url: '/api/user/delete',
    method: 'delete',
    params: {
      ids
    }
  });
}
type UserModel = Pick<
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
export function updateUser(data: UserModel) {
  return request<null>({
    url: '/api/user/update',
    method: 'post',
    data
  });
}

export function addUser(data: UserModel) {
  return request<null>({
    url: '/api/user/add',
    method: 'post',
    data
  });
}

/** get menu list */
export function fetchGetMenuList() {
  return request<Api.SystemManage.Menu[] | any>({
    // url: '/systemManage/getMenuList',
    url: '/api/role/listAllPermission',
    method: 'get'
  });
}

export function createMenu(data: Omit<Api.SystemManage.Menu, 'createBy' | 'updateBy' | 'createTime' | 'updateTime'>) {
  return request<any>({
    url: '/api/permission/add',
    method: 'post',
    data
  });
}

export function updateMenu(data: Omit<Api.SystemManage.Menu, 'createBy' | 'updateBy' | 'createTime' | 'updateTime'>) {
  return request<any>({
    url: '/api/permission/update',
    method: 'post',
    data
  });
}

export function infoMenu(permissionId: number) {
  return request<any>({
    url: '/api/permission/info',
    method: 'get',
    params: {
      permissionId
    }
  });
}

export function deleteMenu(ids: string) {
  return request<any>({
    url: '/api/permission/delete',
    method: 'delete',
    params: {
      ids
    }
  });
}
/** @description: 部门树形列表 */
export function getDeptTreeList() {
  return request({
    url: '/api/dept/getDeptTree',
    method: 'get'
  });
}

/** @description: 部门信息 */
export function infoDept(deptId: number) {
  return request({
    url: '/api/dept/info',
    method: 'get',
    params: {
      deptId
    }
  });
}

export function deleteDept(ids: string) {
  return request({
    url: '/api/dept/delete',
    method: 'delete',
    params: {
      ids
    }
  });
}

type DeptApi = Omit<Api.SystemManage.Dept, 'createBy' | 'updateBy' | 'createTime' | 'updateTime' | 'status' | 'id'>;
export function addDept(data: DeptApi) {
  return request({
    url: '/api/dept/add',
    method: 'post',
    data
  });
}

export function updateDept(data: DeptApi) {
  return request({
    url: '/api/dept/update',
    method: 'post',
    data
  });
}

type PostApi = Omit<Api.SystemManage.Post, 'createBy' | 'updateBy' | 'createTime' | 'updateTime' | 'id'>;
export function addPost(data: PostApi) {
  return request({
    url: '/api/post/add',
    method: 'post',
    data
  });
}

export function updatePost(data: PostApi) {
  return request({
    url: '/api/post/update',
    method: 'post',
    data
  });
}

export function infoPost(postId: number) {
  return request({
    url: '/api/post/info',
    method: 'get',
    params: {
      postId
    }
  });
}

export function deletePost(ids: string) {
  return request({
    url: '/api/post/delete',
    method: 'delete',
    params: {
      ids
    }
  });
}

export function listPost(params?: Api.SystemManage.PostSearchParams) {
  return request({
    url: '/api/post/list',
    method: 'get',
    params
  });
}

export function getPostOptions() {
  return request<Api.SystemManage.PostOptions[]>({
    url: '/api/post/options',
    method: 'get'
  });
}

type TenantApi = Omit<Api.SystemManage.Tenant, 'createBy' | 'updateBy' | 'createTime' | 'updateTime' | 'id'>;
export function addTenant(data: TenantApi) {
  return request({
    url: '/api/tenant/add',
    method: 'post',
    data
  });
}

export function updateTenant(data: TenantApi) {
  return request({
    url: '/api/tenant/update',
    method: 'post',
    data
  });
}

export function infoTenant(tenantId: number) {
  return request({
    url: '/api/tenant/info',
    method: 'get',
    params: {
      tenantId
    }
  });
}

export function deleteTenant(ids: string) {
  return request({
    url: '/api/tenant/delete',
    method: 'delete',
    params: {
      ids
    }
  });
}

export function listTenant(params?: Api.SystemManage.TenantSearchParams) {
  return request({
    url: '/api/tenant/list',
    method: 'get',
    params
  });
}


export function getTenantOptions() {
  return request<
    {
      tenantId: number;
      tenantName: string;
      tenantCode: string;
    }[]
  >({
    url: '/api/tenant/options',
    method: 'get'
  });
}
