<script setup lang="ts">
import { PlusOutlined } from '@vicons/antd';
import { ref } from 'vue';
import { IconX } from '@/components/IconX';

const isShow = ref<boolean>(false);
const emit = defineEmits(['insertNode']);
// 添加审批节点
const addApprovalNode = () => {
  emit('insertNode', 1);
  isShow.value = false;
};
// 添加抄送节点
const addCcNode = () => {
  emit('insertNode', 2);
  isShow.value = false;
};
// 添加条件分支节点
const addConditionsNode = () => {
  emit('insertNode', 4);
  isShow.value = false;
};
// 添加结束节点
const addEndNode = () => {
  emit('insertNode', -1);
  isShow.value = false;
};
</script>

<template>
  <n-popover
    v-model:show="isShow"
    placement="bottom-start"
    title="添加流程节点"
    :width="350"
    trigger="manual"
    @clickoutside="
      () => {
        isShow = false;
      }
    "
  >
    <div class="node-select">
      <div @click="addApprovalNode">
        <IconX name="x-icon-seal" color="rgb(255, 148, 62)" size="24" />
        <span>审批人</span>
      </div>
      <!--      <div @click="addTaskNode">-->
      <!--        <IconX name="x-icon-seal" color="rgb(230, 176, 57)" size="24" />-->
      <!--        <span>办理人</span>-->
      <!--      </div>-->
      <div @click="addCcNode">
        <IconX name="x-icon-promotion" color="rgb(50, 150, 250)" size="24" />
        <span>抄送人</span>
      </div>
      <div @click="addConditionsNode">
        <IconX name="x-icon-branch_2" color="rgb(21, 188, 131)" size="24" />
        <span>条件分支</span>
      </div>
      <div @click="addEndNode">
        <IconX name="x-icon-circle-check" color="#878fa4" size="24" />
        <span>结束</span>
      </div>
      <!--      <div @click="addConcurrentsNode">-->
      <!--        <IconX name="x-icon-branch_1" color="#718dff" size="24" />-->
      <!--        <span>并行分支</span>-->
      <!--      </div>-->
      <!--      <div @click="addInclusivesNode">-->
      <!--        <IconX name="x-icon-inclusive" color="#718dff" size="24" />-->
      <!--        <span>包容分支</span>-->
      <!--      </div>-->
      <!--      <div @click="addDelayNode">-->
      <!--        <IconX name="x-icon-clock" color="#f25643" size="24" />-->
      <!--        <span>延迟等待</span>-->
      <!--      </div>-->
      <!--      <div @click="addTriggerNode">-->
      <!--        <IconX name="x-icon-trigger" color="#15bc83" size="24" />-->
      <!--        <span>触发器</span>-->
      <!--      </div>-->
    </div>
    <template #trigger>
      <n-button type="primary" size="small" circle @click="isShow = true">
        <template #icon>
          <n-icon>
            <PlusOutlined />
          </n-icon>
        </template>
      </n-button>
    </template>
  </n-popover>
</template>

<style lang="less" scoped>
.node-select {
  div {
    display: inline-block;
    margin: 5px 5px;
    cursor: pointer;
    padding: 10px 15px;
    border: 1px solid #f8f9f9;
    background-color: #f8f9f9;
    border-radius: 10px;
    width: 130px;
    position: relative;
    span {
      position: absolute;
      left: 65px;
      top: 18px;
    }
    &:hover {
      background-color: #fff;
      box-shadow: 0 0 8px 2px #d6d6d6;
    }
    i {
      box-sizing: content-box;
      font-size: 25px;
      border: 1px solid #dedfdf;
      padding: 5px;
      border-radius: 14px;
    }
  }
}
</style>
