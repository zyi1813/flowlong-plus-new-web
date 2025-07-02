import { request } from '../../request';

// 存储列表
export function storageList(params?) {
  return request({
    url: '/api/file/oss/pluginList',
    method: 'get',
    params
  });
}

// 存储设置
export function saveStorage(data?) {
  return request({
    url: '/api/file/oss/saveApliPlugin',
    method: 'post',
    data
  });
}

/** 存储配置列表 */
export function storageConfigList(params?) {
  return request({
    url: '/api/storageConfig/list',
    method: 'get',
    params
  });
}

/** 存储配置新增 */
export function storageConfigAdd(data?) {
  return request({
    url: '/api/storageConfig/add',
    method: 'POST',
    data
  });
}

/** 存储配置修改 */
export function storageConfigUpdate(data?) {
  return request({
    url: '/api/storageConfig/update',
    method: 'PUT',
    data
  });
}

/** 存储配置删除 */
export function storageConfigDelete(id?) {
  return request({
    url: '/api/storageConfig/delete',
    method: 'DELETE',
    params: { id }
  });
}

/** 存储配置 启用禁用 */
export function storageConfigSwitchEnable(id, enable) {
  return request({
    url: '/api/storageConfig/switchEnable',
    method: 'PUT',
    params: { id, enable }
  });
}
