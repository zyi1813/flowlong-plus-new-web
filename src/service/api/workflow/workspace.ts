import { request } from '../../request';

/** @description: 查询流程信息 */
export function getTemplateDetail(templateId) {
  return request({
    url: '/workflow/workspace/process/detail',
    method: 'GET',
    params: {
      templateId
    }
  });
}

/** @description: 预览流程 */
export function processPreview(templateId, variable) {
  return request({
    url: '/workflow/workspace/process/preview',
    method: 'POST',
    data: {
      templateId,
      variable
    }
  });
}

/** @description: 发起流程 */
export function startProcess(data) {
  return request({
    url: '/workflow/workspace/process/start',
    method: 'POST',
    data
  });
}

/** @description: 查询我发起的 */
export function applyList(data) {
  return request({
    url: '/workflow/workspace/process/applyList',
    method: 'POST',
    data
  });
}

/** @description: 查看我的待办 */
export function todoList(data) {
  return request({
    url: '/workflow/workspace/process/todoTask',
    method: 'POST',
    data
  });
}

/** @description: 查看我已审批的 */
export function doneList(data) {
  return request({
    url: '/workflow/workspace/process/doneList',
    method: 'POST',
    data
  });
}

/** @description: 查看抄送我的 */
export function ccList(data) {
  return request({
    url: '/workflow/workspace/process/ccList',
    method: 'POST',
    data
  });
}

/** @description: 查询流程实例表单信息 */
export function getInstanceForm(instanceId) {
  return request({
    url: '/workflow/workspace/process/instanceForm',
    method: 'GET',
    params: {
      instanceId
    }
  });
}

/** @description: 查询流程历史动作 */
export function getProcessInstanceAction(instanceId) {
  return request({
    url: '/workflow/workspace/process/instanceAction',
    method: 'GET',
    params: {
      instanceId
    }
  });
}

/** @description: 查询节点信息 */
export function getNodeInfo(processId, nodekey) {
  return request({
    url: '/workflow/workspace/process/getNodeInfo',
    method: 'GET',
    params: {
      processId,
      nodeId: nodekey
    }
  });
}

/** @description: 同意 */
export function agree(data) {
  return request({
    url: '/workflow/workspace/agree',
    method: 'POST',
    data
  });
}

/** @description: 委派人 */
export function delegateTask(data) {
  return request({
    url: '/workflow/workspace/delegateTask',
    method: 'POST',
    data
  });
}

/** @description: 委派人完成的按钮 */
export function resolveTask(data) {
  return request({
    url: '/workflow/workspace/resolveTask',
    method: 'POST',
    data
  });
}

/** @description: 拒绝,驳回 */
export function refuse(data) {
  return request({
    url: '/workflow/workspace/refuse',
    method: 'POST',
    data
  });
}

/** @description: 撤回 */
export function revoke(data) {
  return request({
    url: '/workflow/workspace/revoke',
    method: 'POST',
    data
  });
}

/** @description: 转办 */
export function assignee(data) {
  return request({
    url: '/workflow/workspace/assignee',
    method: 'POST',
    data
  });
}

/** @description: 回退 */
export function rollback(data) {
  return request({
    url: '/workflow/workspace/rollback',
    method: 'POST',
    data
  });
}

/** @description: 加签 */
export function addMulti(data) {
  return request({
    url: '/workflow/workspace/addMulti',
    method: 'POST',
    data
  });
}

/** @description: 查询加签人信息 */
export function queryMultiUsersInfo(data) {
  return request({
    url: '/workflow/workspace/queryMultiUsersInfo',
    method: 'POST',
    data
  });
}

/** @description: 减签 */
export function deleteMulti(data) {
  return request({
    url: '/workflow/workspace/deleteMulti',
    method: 'POST',
    data
  });
}

/** @description: 评论 */
export function comment(data) {
  return request({
    url: '/workflow/workspace/comment',
    method: 'POST',
    data
  });
}

/** @description: 获取历史任务信息列表 */
export function historyTaskList(params) {
  return request({
    url: '/workflow/workspace/historyTaskList',
    method: 'GET',
    params
  });
}

/** @description: 查询可退回的节点 */
export function getRollbackNodes(data) {
  return request({
    url: '/workflow/workspace/getRollbackNodes',
    method: 'POST',
    data
  });
}

/** @description: 再次提交（发起人节点被驳回后） */
export function resubmit(data) {
  return request({
    url: '/workflow/workspace/process/resubmit',
    method: 'POST',
    data
  });
}
