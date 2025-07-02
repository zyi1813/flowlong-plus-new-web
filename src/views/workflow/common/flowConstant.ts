// 流程节点
export const NODE = {
  END: -1, // "结束"
  START: 0, // "开始"
  APPROVE: 1, // "审核"
  COPY: 2, // "抄送"
  CONDITION: 3, // "条件审批"
  CONDITION_BRANCH: 4 // "条件分支"
};


// 流程动作
export const ACTION = {
  START: 0, // "发起"
  AUTO_REJECTED: 1, // "自动拒绝"
  AUTO_APPROVED: 2, // "自动通过"
  REJECTED: 3, // "拒绝"
  APPROVED: 4, // "通过"
  CANCELED: 5, // "撤销"
  ASSIGN: 6, // "转交"
  BACK: 7, // "回退"
  ADD_SIGN: 8, // "加签"
  DEL_SIGN: 9, // "减签"
  ADD_BEFORE_SIGN: 10, // "前加签"
  ADD_AFTER_SIGN: 11, // "后加签"
  COPY: 12, // "抄送"
  FORWARD: 13, // "转发"
  COMMENT: 14, // "评论"
  TRANSACT: 15 // "办理"
};

// 流程状态
export const STATUS = {
  UNDERWAY: 0, // "审批中"
  APPROVED: 1, // "已通过"
  REJECTED: 2, // "不通过"
  CANCELLED: 3, // "已撤销"
  TIMEOUT: 4, // "超时"
  CLOSED: 5 // "强制终止"
};

export const STATUS_LIST = [
  { value: STATUS.UNDERWAY, name: '审批中' },
  { value: STATUS.APPROVED, name: '已通过' },
  { value: STATUS.REJECTED, name: '不通过' },
  { value: STATUS.CANCELLED, name: '已撤销' },
  { value: STATUS.TIMEOUT, name: '超时' },
  { value: STATUS.CLOSED, name: '强制终止' }
];
