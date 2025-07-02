<script setup lang="tsx">
import { computed, getCurrentInstance, h, ref } from 'vue';
import { NButton, useMessage } from 'naive-ui';
import { useWorkflowStore } from '@/store/modules/workflow';

import RootNode from '@/views/workflow/designer/common/process/nodes/RootNode.vue';
import ApprovalNode from '@/views/workflow/designer/common/process/nodes/ApprovalNode.vue';
import CcNode from '@/views/workflow/designer/common/process/nodes/CcNode.vue';
import ConditionNode from '@/views/workflow/designer/common/process/nodes/ConditionNode.vue';
import EndNode from '@/views/workflow/designer/common/process/nodes/EndNode.vue';
import EmptyNode from '@/views/workflow/designer/common/process/nodes/EmptyNode.vue';
import DefaultProps from './DefaultNodeProps';

const { proxy }: any = getCurrentInstance();

defineOptions({
  name: 'ProcessTree'
});

// 节点类型映射
const nodeTypeMap = {
  '-1': EndNode,
  0: RootNode,
  1: ApprovalNode,
  2: CcNode,
  3: ConditionNode,
  empty: EmptyNode
};

const emit = defineEmits(['selectedNode']);

const workflowStore = useWorkflowStore();
const message = useMessage();

const nodeMap = computed(() => workflowStore.nodeMap);
const dom = computed(() => workflowStore.design.process);

const NodeComponent = {
  render: () => {
    console.log('渲染流程树');
    nodeMap.value.clear();
    console.log(dom.value);
    const processTrees = getDomTree(dom.value);
    // 插入末端节点
    processTrees.push(
      <div style={'text-align:center'}>
        <div class={'process-end'}>流程结束</div>
      </div>
    );
    return (
      <div class={'_root'} ref={'_root'}>
        {processTrees}
      </div>
    );
  }
};

const nodeRefs = {};
const getDomTree = node => {
  if (!node) {
    return [];
  }
  toMapping(node);
  if (isPrimaryNode(node)) {
    // 普通业务节点
    const childDoms = getDomTree(node.childNode);
    decodeAppendDom(node, childDoms);
    return [<div class={'primary-node'}>{childDoms}</div>];
  } else if (isBranchNode(node)) {
    let index = 0;
    // 遍历分支节点，包含并行及条件节点
    const branchItems = node.conditionNodes.map(branchNode => {
      // 处理每个分支内子节点
      toMapping(branchNode);
      const childDoms = getDomTree(branchNode.childNode);
      decodeAppendDom(branchNode, childDoms, {
        size: node.conditionNodes.length
      });
      // 插入4条横线，遮挡掉条件节点左右半边线条
      insertCoverLine(index, childDoms, node.conditionNodes);
      // 遍历子分支尾部分支
      index++;
      return h('div', { class: { 'branch-node-item': true } }, childDoms);
    });
    // 插入添加分支/条件的按钮
    branchItems.unshift(
      h('div', { class: { 'add-branch-btn': true } }, [
        h(
          NButton,
          {
            class: { 'add-branch-btn-el': true },
            size: 'small',
            round: true,
            onClick: () => addBranchNode(node)
          },
          {
            default: () => `添加${isConditionNode(node) ? '条件' : '分支'}`
          }
        )
      ])
    );
    const bchDom = [h('div', { class: { 'branch-node': true } }, branchItems)];
    // 继续遍历分支后的节点
    const afterChildDoms = getDomTree(node.childNode);
    // 插入一个空节点 用于显示一个按钮
    decodeAppendDom({ type: 'empty', node }, afterChildDoms);
    const emptyDom = h('div', { class: { 'empty-node': true } }, afterChildDoms);

    return [h('div', {}, [bchDom, emptyDom])];
  }
  // 遍历到了末端，无子节点
  return [];
};
// 解码渲染的时候插入dom到同级
const decodeAppendDom = (node, dom, props: any = {}) => {
  nodeRefs[node.id] = ref(null);
  dom.unshift(
    h(
      nodeTypeMap[node.type],
      {
        ...props,
        config: node,
        ref: nodeRefs[node.id],
        key: node.id,
        // 定义事件，插入节点，删除节点，选中节点，复制/移动
        onInsertNode: (type: string) => insertNode(type, node),
        onDelNode: () => delNode(node),
        onSelected: () => selectNode(node),
        onCopy: () => copyBranch(node),
        onLeftMove: () => branchMove(node, -1),
        onRightMove: () => branchMove(node, 1)
      },
      () => []
    )
  );
};
// id映射到map，用来向上遍历
const toMapping = node => {
  if (node && node.id) {
    console.log(`node=> ${node.id} name:${node.nodeName} type:${node.type}`);
    nodeMap.value.set(node.id, node);
  }
};

// 插入4条横线
const insertCoverLine = (index, doms, conditionNodes) => {
  if (index === 0) {
    // 最左侧分支
    doms.unshift(h('div', { class: { 'line-top-left': true } }, []));
    doms.unshift(h('div', { class: { 'line-bot-left': true } }, []));
  } else if (index === conditionNodes.length - 1) {
    // 最右侧分支
    doms.unshift(h('div', { class: { 'line-top-right': true } }, []));
    doms.unshift(h('div', { class: { 'line-bot-right': true } }, []));
  }
};

const deepCopy = (obj: object) => {
  return JSON.parse(JSON.stringify(obj));
};
const copyBranch = node => {
  const parentNode = nodeMap.value.get(node.parentId);
  const branchNode = deepCopy(node);
  branchNode.nodeName += '-copy';
  forEachNode(parentNode, branchNode, (parent, node) => {
    const id = getRandomId();
    console.log(node, `新id =>${id}`, `老nodeId:${node.id}`);
    node.id = id;
    node.parentId = parent.id;
  });
  parentNode.conditionNodes.splice(parentNode.conditionNodes.indexOf(node), 0, branchNode);
  // 重新分配优先级
  let level = 1;
  parentNode.conditionNodes.forEach(item => {
    item.priorityLevel = level;
    level++;
  });
  proxy.$forceUpdate();
};

const branchMove = (node, offset) => {
  const parentNode = nodeMap.value.get(node.parentId);
  const index = parentNode.conditionNodes.indexOf(node);
  const branch = parentNode.conditionNodes[index + offset];
  parentNode.conditionNodes[index + offset] = parentNode.conditionNodes[index];
  parentNode.conditionNodes[index] = branch;
  // 重新分配优先级
  let level = 1;
  parentNode.conditionNodes.forEach(item => {
    item.priorityLevel = level;
    level++;
  });
  proxy.$forceUpdate();
};

// 判断是否为主要业务节点
const isPrimaryNode = node => {
  return node && (node.type === -1 || node.type === 0 || node.type === 1 || node.type === 2);
};

// 判断是否为分支节点
const isBranchNode = node => node && node.type === 4;

// 判断是否为条件分支节点
const isConditionNode = node => node.type === 4;

// 判断是否是分支中节点
const isBranchSubNode = node => node && node.type === 3;

// 给分支添加节点
const addBranchNode = node => {
  if (node.conditionNodes.length < 8) {
    // 条件分支
    if (isConditionNode(node)) {
      // 插入倒数第二位置
      node.conditionNodes.splice(node.conditionNodes.length - 1, 0, {
        id: getRandomId(),
        parentId: node.id,
        nodeName: `条件${node.conditionNodes.length}`,
        nodeKey:getNodeKey(),
        priorityLevel: 0,
        conditionList: [],
        type: 3
      });
      // 重新分配优先级
      let level = 1;
      node.conditionNodes.forEach(item => {
        item.priorityLevel = level;
        level++;
      });
    }
  } else {
    message.warning('最多只能添加 8 项!');
  }
};
const getRandomId = () => {
  return `node_${new Date().getTime().toString().substring(5)}${Math.round(Math.random() * 9000 + 1000)}`;
};

/**
 * 生成节点key
 */
const getNodeKey = () => {
  return `flk_${new Date().getTime().toString().substring(5)}${Math.round(Math.random() * 9000 + 1000)}`;
};
// 选中一个节点
const selectNode = node => {
  workflowStore.selectedNode = node;
  emit('selectedNode', node);
};
// 处理节点插入逻辑
const insertNode = (type, parentNode) => {
  if (parentNode.type === 'empty') {
    parentNode = parentNode.node;
  }
  // 缓存一下后面的节点
  const afterNode = parentNode.childNode;
  // 插入新节点
  parentNode.childNode = {
    id: getRandomId(),
    parentId: parentNode.id,
    type
  };
  switch (type) {
    case -1:
      insertEndNode(parentNode);
      break;
    case 1:
      insertApprovalNode(parentNode);
      break;
    case 2:
      insertCcNode(parentNode);
      break;
    case 4:
      insertConditionsNode(parentNode);
      break;
    default:
      break;
  }
  // 拼接后续节点
  if (afterNode && afterNode.id) {
    afterNode.parentId = parentNode.childNode.id;
  }

  if (afterNode && Object.keys(afterNode).length) {
    parentNode.childNode.childNode = afterNode;
  }
  proxy.$forceUpdate();
};

const insertEndNode = parentNode => {
  parentNode.childNode.nodeName = '结束';
  parentNode.childNode.nodeKey=getNodeKey();
  parentNode.childNode.showClose = true;
};
const insertApprovalNode = parentNode => {
  parentNode.childNode.nodeName = '审批人';
  parentNode.childNode.nodeKey=getNodeKey();
  parentNode.childNode = { ...parentNode.childNode, ...deepCopy(DefaultProps.APPROVAL_PROPS) };
};
const insertCcNode = parentNode => {
  parentNode.childNode.nodeName = '抄送人';
  parentNode.childNode.nodeKey=getNodeKey();
  parentNode.childNode = { ...parentNode.childNode, ...deepCopy(DefaultProps.Cc_PROPS) };
};
const insertConditionsNode = parentNode => {
  parentNode.childNode.nodeName = '条件分支';
  parentNode.childNode.nodeKey=getNodeKey();

  parentNode.childNode.conditionNodes = [
    {
      id: getRandomId(),
      parentId: parentNode.childNode.id,
      nodeName: '条件1',
      nodeKey:getNodeKey(),
      type: 3,
      priorityLevel: 1,
      conditionList: []
    },
    {
      id: getRandomId(),
      parentId: parentNode.childNode.id,
      nodeName: '默认条件',
      nodeKey:getNodeKey(),
      type: 3,
      priorityLevel: 2,
      conditionList: []
    }
  ];
};
// 获取最后一个节点
const getBranchEndNode = conditionNode => {
  if (!conditionNode.childNode || !conditionNode.childNode.id) {
    return conditionNode;
  }
  return getBranchEndNode(conditionNode.childNode);
};
// 删除当前节点
const delNode = node => {
  console.log('删除节点', node);
  // 获取该节点的父节点
  const parentNode = nodeMap.value.get(node.parentId);
  if (parentNode) {
    // 判断该节点节点是分支节点内的条件 且该节点的父节点是分支节点
    if (isBranchSubNode(node) && isBranchNode(parentNode)) {
      // 移除该分支
      parentNode.conditionNodes.splice(parentNode.conditionNodes.indexOf(node), 1);
      // 处理只剩1个分支的情况
      if (parentNode.conditionNodes.length < 2) {
        // 获取条件组的父节点
        const ppNode = nodeMap.value.get(parentNode.parentId);
        // 判断唯一分支是否存在业务节点
        if (parentNode.conditionNodes[0].childNode && parentNode.conditionNodes[0].childNode.id) {
          // 将剩下的唯一分支头部合并到主干
          ppNode.childNode = parentNode.conditionNodes[0].childNode;
          ppNode.childNode.parentId = ppNode.id;
          // 搜索唯一分支末端最后一个节点
          const endNode = getBranchEndNode(parentNode.conditionNodes[0]);
          // 后续节点进行拼接
          endNode.childNode = parentNode.childNode;
          if (endNode.childNode && endNode.childNode.id) {
            endNode.childNode.parentId = endNode.id;
          }
        } else {
          // 直接合并分支后面的节点
          ppNode.childNode = parentNode.childNode;
          if (ppNode.childNode && ppNode.childNode.id) {
            ppNode.childNode.parentId = ppNode.id;
          }
        }
      } else {
        // 重新分配优先级
        let level = 1;
        parentNode.conditionNodes.forEach(item => {
          item.priorityLevel = level;
          level++;
        });
      }
    } else {
      // 不是的话就直接删除
      if (node.childNode && node.childNode.id) {
        node.childNode.parentId = parentNode.id;
      }
      parentNode.childNode = node.childNode;
    }
    proxy.$forceUpdate();
  } else {
    message.warning('出现错误，找不到上级节点😥');
  }
};

const valid = ref<boolean>(false);

const validateNode = (err, node) => {
  if (nodeRefs[node.id].value.validate) {
    valid.value = nodeRefs[node.id].value.validate(err);
  }
};

// 给定一个起始节点，遍历内部所有节点
const forEachNode = (parent, node, callback) => {
  if (isBranchNode(node)) {
    callback(parent, node);
    forEachNode(node, node.childNode, callback);
    node.conditionNodes.map(branchNode => {
      callback(node, branchNode);
      forEachNode(branchNode, branchNode.childNode, callback);
    });
  } else if (isPrimaryNode(node) || isBranchSubNode(node)) {
    callback(parent, node);
    forEachNode(node, node.childNode, callback);
  }
};

// 校验所有节点设置
const validate = (err, node) => {
  if (isPrimaryNode(node)) {
    validateNode(err, node);
    validate(err, node.childNode);
  } else if (isBranchNode(node)) {
    // 校验每个分支
    node.conditionNodes.map(branchNode => {
      // 校验条件节点
      validateNode(err, branchNode);
      // 校验条件节点后面的节点
      validate(err, branchNode.childNode);
    });
    validate(err, node.childNode);
  }
};

const validateProcess = () => {
  valid.value = true;
  const err: string[] = [];
  validate(err, dom.value);
  return err;
};

defineExpose({
  validateProcess
});
</script>

<template>
  <NodeComponent />
</template>

<style lang="less">
._root {
  margin: 0 auto;
}
.process-end {
  width: 60px;
  margin: 0 auto;
  margin-bottom: 20px;
  border-radius: 15px;
  padding: 5px 10px;
  font-size: small;
  color: #747474;
  background-color: #f2f2f2;
  box-shadow: 0 0 10px 0 #bcbcbc;
  box-sizing: content-box;
}
.primary-node {
  display: flex;
  align-items: center;
  flex-direction: column;
}
.branch-node {
  display: flex;
  justify-content: center;
  /*border-top: 2px solid #cccccc;
  border-bottom: 2px solid #cccccc;*/
}
.branch-node-item {
  position: relative;
  display: flex;
  background: #f5f6f6;
  flex-direction: column;
  align-items: center;
  border-top: 2px solid #cccccc;
  border-bottom: 2px solid #cccccc;
  &:before {
    content: '';
    position: absolute;
    top: 0;
    left: calc(50% - 1px);
    margin: auto;
    width: 2px;
    height: 100%;
    background-color: #cacaca;
  }
  .line-top-left,
  .line-top-right,
  .line-bot-left,
  .line-bot-right {
    position: absolute;
    width: 50%;
    height: 8px;
    background-color: #f5f6f6;
  }
  .line-top-left {
    top: -4px;
    left: -1px;
  }
  .line-top-right {
    top: -4px;
    right: -1px;
  }
  .line-bot-left {
    bottom: -4px;
    left: -1px;
  }
  .line-bot-right {
    bottom: -4px;
    right: -1px;
  }
}
.add-branch-btn {
  position: absolute;
  width: 80px;
  .add-branch-btn-el {
    background-color: #fff;
    &:hover {
      background-color: #fff;
    }
    z-index: 999;
    position: absolute;
    top: -15px;
  }
}

.empty-node {
  display: flex;
  justify-content: center;
  flex-direction: column;
  align-items: center;
}
</style>
