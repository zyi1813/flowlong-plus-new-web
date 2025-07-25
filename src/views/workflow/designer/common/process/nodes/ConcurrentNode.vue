<script setup lang="ts">
import { withDefaults } from 'vue';
import { useWorkflowStore } from '@/store/modules/workflow';
import InsertButton from '@/views/workflow/designer/common/InsertButton.vue';

defineOptions({
  name: 'ConcurrentNode'
});
const workflowStore = useWorkflowStore();

withDefaults(defineProps<{ config: any; level: number; size: number }>(), {
  config: () => {
    return {};
  },
  level: 0,
  // 条件数
  size: 0
});
</script>

<template>
  <div class="node">
    <div class="node-body" @click="$emit('selected')">
      <div
        v-if="level > 1"
        v-show="workflowStore.diagramMode !== 'viewer'"
        class="node-body-left"
        @click.stop="$emit('leftMove')"
      >
        <i class="x-icon-arrow-left x-iconfont"></i>
      </div>
      <div class="node-body-main">
        <div class="node-body-main-header">
          <span class="title">
            <i class="x-icon-s-operation x-iconfont"></i>
            <n-ellipsis class="name" tooltip>{{ config.name ? config.name : '并行任务' + level }}</n-ellipsis>
          </span>
          <span v-show="workflowStore.diagramMode !== 'viewer'" class="option">
            <n-tooltip placement="top">
              <template #trigger>
                <i class="x-icon-copy-document x-iconfont" @click.stop="$emit('copy')"></i>
              </template>
              复制分支
            </n-tooltip>
            <i class="x-icon-close x-iconfont" @click.stop="$emit('delNode')"></i>
          </span>
        </div>
        <div class="node-body-main-content">
          <span>并行任务（同时进行）</span>
        </div>
      </div>
      <div
        v-if="level < size"
        v-show="workflowStore.diagramMode !== 'viewer'"
        class="node-body-right"
        @click.stop="$emit('rightMove')"
      >
        <i class="x-icon-arrow-right x-iconfont"></i>
      </div>
    </div>
    <div class="node-footer">
      <div v-show="workflowStore.diagramMode !== 'viewer'" class="btn">
        <InsertButton @insert-node="type => $emit('insertNode', type)" />
      </div>
    </div>
  </div>
</template>

<style lang="less" scoped>
.node {
  padding: 30px 55px 0;
  width: 220px;
  .node-body {
    overflow: hidden;
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
        .option {
          display: inline-block !important;
        }
      }
      box-shadow: 0px 0px 3px 0px @primaryColor;
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
    }
    .node-body-main {
      position: absolute;
      width: 188px;
      left: 17px;
      display: inline-block;

      .node-body-main-header {
        padding: 10px 0px 5px;
        font-size: xx-small;
        position: relative;
        .title {
          color: #718dff;
          .name {
            display: inline-block;
            height: 14px;
            width: 130px;
            margin-left: 2px;
          }
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
      }
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
