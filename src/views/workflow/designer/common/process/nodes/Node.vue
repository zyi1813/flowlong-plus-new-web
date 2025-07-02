<script setup lang="ts">
import { useWorkflowStore } from '@/store/modules/workflow';
import InsertButton from '../../InsertButton.vue';

defineOptions({
  name: 'Node'
});

const workflowStore = useWorkflowStore();

defineProps({
  // 是否为根节点
  isRoot: {
    type: Boolean,
    default: false
  },
  // 是否为End节点
  isEnd: {
    type: Boolean,
    default: false
  },
  // 是否显示节点体
  show: {
    type: Boolean,
    default: true
  },
  // 节点内容区域文字
  content: {
    type: String,
    default: ''
  },
  title: {
    type: String,
    default: '标题'
  },
  placeholder: {
    type: String,
    default: '请设置'
  },
  // 节点体左侧图标
  leftIcon: {
    type: String,
    default: undefined
  },
  // 头部图标
  headerIcon: {
    type: String,
    default: ''
  },
  // 头部背景色
  headerBgc: {
    type: String,
    default: '#576a95'
  },
  // 是否显示错误状态
  showError: {
    type: Boolean,
    default: false
  },
  errorInfo: {
    type: String,
    default: '无信息'
  }
});
</script>

<template>
  <div class="node" :class="{ root: isRoot || !show, 'node-error-state': showError }">
    <div
      v-if="show"
      class="node-body"
      :class="{ error: showError }"
      @click="
        () => {
          isEnd || $emit('selected');
        }
      "
    >
      <div>
        <div class="node-body-header" :style="{ 'background-color': headerBgc }">
          <i
            v-if="(headerIcon || '') !== ''"
            :class="headerIcon"
            class="x-iconfont inline-block mr-[5px] align-baseline leading-none"
          ></i>
          <n-ellipsis class="name">{{ title }}</n-ellipsis>
          <i
            v-if="!isRoot && !isEnd && workflowStore.diagramMode !== 'viewer'"
            class="x-icon-close x-iconfont float-right"
            @click="$emit('delNode')"
          ></i>
        </div>
        <div class="node-body-content">
          <i v-if="leftIcon" :class="leftIcon" class="x-iconfont"></i>
          <span v-if="(content || '').trim() === ''" class="placeholder">{{ placeholder }}</span>
          <n-ellipsis v-else :tooltip="false" :line-clamp="3">{{ content }}</n-ellipsis>
          <i v-if="workflowStore.diagramMode !== 'viewer' && !isEnd" class="x-icon-arrow-right x-iconfont"></i>
        </div>
        <div v-if="showError" class="node-error">
          <n-tooltip placement="top-start">
            <template #trigger>
              <i class="x-icon-warning-outline x-iconfont" style="font-size: 24px"></i>
            </template>
            {{ errorInfo }}
          </n-tooltip>
        </div>
      </div>
    </div>
    <div class="node-footer">
      <div class="btn">
        <div v-show="workflowStore.diagramMode !== 'viewer' && !isEnd">
          <InsertButton @insert-node="type => $emit('insertNode', type)" />
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="less" scoped>
.n-ellipsis.n-ellipsis--line-clamp {
  display: -webkit-box;
}
.x-iconfont {
  font-size: 14px;
}
.root {
  &:before {
    display: none !important;
  }
}
.node-error-state {
  .node-body {
    box-shadow: 0 0 5px 0 #f56c6c !important;
  }
}
.node {
  box-sizing: content-box;
  padding: 0 50px;
  width: 220px;
  position: relative;
  &:before {
    content: '';
    position: absolute;
    top: -12px;
    left: 50%;
    -webkit-transform: translateX(-50%);
    transform: translateX(-50%);
    width: 0;
    border-style: solid;
    border-width: 8px 6px 4px;
    border-color: #cacaca transparent transparent;
    background: #f5f5f7;
  }
  .node-body {
    cursor: pointer;
    max-height: 120px;
    position: relative;
    border-radius: 5px;
    background-color: white;
    box-shadow: 0 0 5px 0 #d8d8d8;
    &:hover {
      box-shadow: 0 0 3px 0 @primaryColor;
      .node-body-header {
        .x-icon-close {
          display: inline;
          font-size: medium;
        }
      }
    }
    .node-body-header {
      border-top-left-radius: 5px;
      border-top-right-radius: 5px;
      padding: 5px 15px;
      color: white;
      font-size: xx-small;
      .x-icon-close {
        display: none;
      }
      .name {
        height: 14px;
        width: 150px;
        display: inline-block;
      }
    }
    .node-body-content {
      padding: 18px;
      color: #656363;
      font-size: 14px;
      i {
        position: absolute;
        top: 55%;
        right: 5px;
        font-size: medium;
      }
      .placeholder {
        color: #8c8c8c;
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
