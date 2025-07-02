// 审批节点默认属性
export const APPROVAL_PROPS = {
  /** 审核人类型<p> 1，指定成员 2，主管 3，角色 4，发起人自选 5，发起人自己 7，连续多级主管</p> */
  setType: 1,
  nodeAssigneeList: [],
  examineMode: 1,
  termAuto: false,
  term: 5,
  termMode: 0
};

// 根节点默认属性
export const ROOT_PROPS = {
  nodeAssigneeList: []
};

export const Cc_PROPS = {
  setType: 1,
  nodeAssigneeList: []
};

export default {
  APPROVAL_PROPS,
  ROOT_PROPS,
  Cc_PROPS
};
