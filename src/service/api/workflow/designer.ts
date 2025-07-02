import { request } from '../../request';

/** @description: 查询分组列表 */
export function getFormGroup(params?) {
  return request({
    url: '/workflow/group',
    method: 'GET',
    params
  });
}

/** @description: 更新分组名称 */
export function updateFormGroup(params?) {
  return request({
    url: '/workflow/group',
    method: 'PUT',
    params
  });
}

/** @description: 删除分组 */
export function deleteFormGroup(params?) {
  return request({
    url: '/workflow/group',
    method: 'DELETE',
    params
  });
}

/** @description: 新增分组 */
export function createFormGroup(params?) {
  return request({
    url: '/workflow/group',
    method: 'POST',
    params
  });
}

/** @description: 获取分组选项 */
export function getGroupOptions() {
  return request({
    url: '/workflow/group/options',
    method: 'GET'
  });
}

/** @description: 新建流程模版 */
export function createTemplate(data) {
  return request({
    url: '/workflow/template',
    method: 'POST',
    data
  });
}

/** @description: 更新流程模版 */
export function updateTemplate(data) {
  return request({
    url: '/workflow/template/update',
    method: 'PUT',
    data
  });
}

/** @description: 获取流程模版详情 */
export function getTemplateDetail(templateId) {
  return request({
    url: '/workflow/template/detail',
    method: 'GET',
    params: {
      templateId
    }
  });
}
