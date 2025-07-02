<script setup lang="ts">
import { computed, ref, withDefaults } from 'vue';
import InsertButton from '@/views/workflow/designer/common/InsertButton.vue';
import { useWorkflowStore } from '@/store/modules/workflow';

const props = withDefaults(defineProps<{ config: any; size: number }>(), {
  config: () => {
    return {};
  },
  // 条件数
  size: 0
});

const placeholder = ref<string>('请设置条件');
const showError = ref(false);
const errorInfo = ref('');

const workflowStore = useWorkflowStore();

const operatorMap = {
  '==': '等于',
  '!=': '不等于',
  '>': '大于',
  '>=': '大于等于',
  '<': '小于',
  '<=': '小于等于'
};

const isLast = computed(() => props.config.priorityLevel == props.size && props.size != 0);

const content = computed(() => {
  const groups = props.config.conditionList;
  let content = '';
  groups.forEach((group, idx) => {
    let conditionStr = '';
    if (idx === 0) {
      conditionStr += '当 ';
    } else {
      conditionStr += '或 ';
    }
    for (let i = 0; i < group.length; i++) {
      const condition = group[i];
      if (i !== 0) {
        conditionStr += '且 ';
      }
      console.log(condition);
      conditionStr += `${condition.label} ${operatorMap[condition.operator]} ${condition.value}`;
      if (i != group.length - 1) {
        conditionStr += ',';
      }
    }
    content += `${conditionStr}<br/>`;
  });
  return content;
});

// 校验数据配置的合法性
const validate = err => {
  if (!(props.config.priorityLevel == props.size && props.size != 0) && !props.config.childNode?.id) {
    showError.value = true;
    errorInfo.value = '条件分支后不能为空';
    err.push(`条件分支后不能为空`);
    return !showError.value;
  }
  // 对默认节点不进行判断
  if (props.config.priorityLevel != props.size) {
    if (props.config.conditionList.length <= 0) {
      showError.value = true;
      errorInfo.value = '请设置分支条件';
      err.push(`${props.config.nodeName}未设置条件`);
    } else {
      for (let i = 0; i < props.config.conditionList.length; i++) {
        const num = i + 1;
        const conditions = props.config.conditionList[i];
        if (conditions.length === 0) {
          showError.value = true;
          errorInfo.value = `请设置条件组${num}内的条件`;
          err.push(`${props.config.nodeName}中条件组${num}内未设置条件`);
          break;
        } else {
          for (let ci = 0; ci < conditions.length; ci++) {
            const condition = conditions[ci];
            showError.value = condition.value.length === 0;
            if (showError.value) {
              errorInfo.value = `请完善条件组${num}内的${condition.label}条件`;
              err.push(`${props.config.nodeName}中条件组${num}内${condition.label}条件未完善`);
              return false;
            }
          }
        }
      }
    }
  }
  return !showError.value;
};

defineExpose({
  validate
});
</script>

<template>
  <div class="node" :class="{ 'node-error-state': showError }">
    <div class="node-body" :class="{ error: showError }">
      <div
        v-if="props.config.priorityLevel > 1 && workflowStore.diagramMode !== 'viewer' && !isLast"
        class="node-body-left"
        @click="$emit('leftMove')"
      >
        <i class="x-icon-arrow-left x-iconfont"></i>
      </div>
      <div class="node-body-main" @click="!isLast && $emit('selected')">
        <div class="node-body-main-header">
          <i class="x-icon-branch_2 x-iconfont"></i>
          <n-ellipsis class="title" tooltip>
            {{ props.config.nodeName ? props.config.nodeName : '条件' + props.config.priorityLevel }}
          </n-ellipsis>
          <span class="level">优先级{{ props.config.priorityLevel }}</span>
          <span v-if="workflowStore.diagramMode !== 'viewer' && !isLast" class="option">
            <n-tooltip placement="top">
              <template #trigger>
                <i class="x-icon-copy-document x-iconfont" @click.stop="$emit('copy')"></i>
              </template>
              复制条件
            </n-tooltip>
            <i class="x-icon-close x-iconfont" @click.stop="$emit('delNode')"></i>
          </span>
        </div>
        <div class="node-body-main-content">
          <span v-if="(content || '').trim() === ''" class="placeholder">
            {{ isLast ? '如存在未满足其他分支条件的情况，则进入此分支' : placeholder }}
          </span>
          <n-ellipsis v-else tooltip :line-clamp="2">
            <div v-html="content"></div>
          </n-ellipsis>
        </div>
      </div>
      <div
        v-if="props.config.priorityLevel < props.size - 1 && workflowStore.diagramMode !== 'viewer'"
        class="node-body-right"
        @click="$emit('rightMove')"
      >
        <i class="x-icon-arrow-right x-iconfont"></i>
      </div>
      <div v-if="showError" class="node-error">
        <n-tooltip placement="top-start">
          <template #trigger>
            <i class="x-icon-warning-outline x-iconfont"></i>
          </template>
          {{ errorInfo }}
        </n-tooltip>
      </div>
    </div>
    <div class="node-footer">
      <div v-if="workflowStore.diagramMode !== 'viewer'" class="btn">
        <InsertButton @insert-node="type => $emit('insertNode', type)" />
      </div>
    </div>
  </div>
</template>

<style lang="less" scoped>
.node-error-state {
  .node-body {
    box-shadow: 0px 0px 5px 0px #f56c6c !important;
  }
}

.node {
  padding: 30px 55px 0;
  width: 220px;
  box-sizing: content-box;

  .node-body {
    cursor: pointer;
    min-height: 80px;
    max-height: 120px;
    position: relative;
    border-radius: 5px;
    background-color: white;
    box-shadow: 0px 0px 5px 0px #d8d8d8;

    &:hover {
      .node-body-left,
      .node-body-right {
        i {
          display: block !important;
        }
      }

      .node-body-main {
        .level {
          display: none !important;
        }

        .option {
          display: inline-block !important;
        }
      }
      box-shadow: 0 0 3px 0 @primaryColor;
    }

    .node-body-left,
    .node-body-right {
      display: flex;
      align-items: center;
      position: absolute;
      height: 100%;

      i {
        display: none;
      }

      &:hover {
        background-color: #ececec;
      }
    }

    .node-body-left {
      left: 0;
    }

    .node-body-right {
      right: 0;
      top: 0;
    }

    .node-body-main {
      //position: absolute;
      width: 188px;
      margin-left: 17px;
      display: inline-block;

      .node-body-main-header {
        padding: 10px 0px 5px;
        font-size: xx-small;
        position: relative;

        .title {
          color: #15bca3;
          display: inline-block;
          height: 14px;
          width: 125px;
        }

        .level {
          position: absolute;
          right: 15px;
          color: #888888;
        }

        .option {
          position: absolute;
          right: 0;
          display: none;
          font-size: medium;

          i {
            color: #888888;
            padding: 0 3px;
          }
        }
      }

      .node-body-main-content {
        padding: 6px;
        color: #656363;
        font-size: 14px;

        i {
          position: absolute;
          top: 55%;
          right: 10px;
          font-size: medium;
        }

        .placeholder {
          color: #8c8c8c;
        }
      }
    }

    .node-error {
      position: absolute;
      right: -40px;
      top: 20px;
      font-size: 25px;
      color: #f56c6c;
    }
  }

  .node-footer {
    position: relative;

    .btn {
      width: 100%;
      display: flex;
      height: 70px;
      padding: 20px 0 32px;
      justify-content: center;
    }

    &::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      z-index: -1;
      margin: auto;
      width: 2px;
      height: 100%;
      background-color: #cacaca;
    }
  }
}
</style>
