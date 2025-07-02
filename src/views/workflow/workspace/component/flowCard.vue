<script setup>
import { ref, watch } from 'vue';
import moment from 'moment';
import { STATUS_LIST } from '@/views/workflow/common/flowConstant';
import FlowNodeAvatar from './flowNodeAvatar.vue';

const props = defineProps({
  flowInstance: { type: Object, default: null },
  flowInstanceId: { type: String, default: null },
  clickable: { type: Boolean, default: false },
  hoverable: { type: Boolean, default: true }
});

const inst = ref(null);
watch(
  props,
  nv => {
    const id = props.flowInstanceId;
    if (id) {
    } else {
      inst.value = nv.flowInstance || {};
    }
  },
  { immediate: true, deep: true }
);

// 流程详情
const flowDetailVisible = ref(false);
const onCardClick = () => {
  if (props.clickable) {
    flowDetailVisible.value = true;
  }
};
const onDetailClose = () => {
  flowDetailVisible.value = false;
};
</script>

<template>
  <div v-if="inst" class="flow-card-box" :class="[hoverable ? 'flow-card-box-hoverable' : null]" @click="onCardClick()">
    <div class="header">
      <div class="name font-bold">{{ inst.processName }}</div>
      <div class="status">
        <n-tag v-if="inst.instanceState == STATUS_LIST[0].value" type="info" size="small" :bordered="false">
          {{ STATUS_LIST[0].name }}
        </n-tag>
        <n-tag v-else-if="inst.instanceState == STATUS_LIST[1].value" type="success" size="small" :bordered="false">
          {{ STATUS_LIST[1].name }}
        </n-tag>
        <n-tag v-else-if="inst.instanceState == STATUS_LIST[2].value" type="error" size="small" :bordered="false">
          {{ STATUS_LIST[2].name }}
        </n-tag>
        <n-tag v-else-if="inst.instanceState == STATUS_LIST[3].value" type="warning" size="small" :bordered="false">
          {{ STATUS_LIST[3].name }}
        </n-tag>
        <n-tag v-else-if="inst.instanceState == STATUS_LIST[4].value" type="warning" size="small" :bordered="false">
          {{ STATUS_LIST[4].name }}
        </n-tag>
        <n-tag v-else-if="inst.instanceState == STATUS_LIST[5].value" type="error" size="small" :bordered="false">
          {{ STATUS_LIST[5].name }}
        </n-tag>
      </div>
    </div>
    <div class="summary-list">
      <div v-for="(value, label) in inst.summary" class="summary-item">
        <div class="label">{{ label }}：</div>
        <div class="value">{{ value }}</div>
      </div>
    </div>
    <div class="footer">
      <div class="initiator">
        <FlowNodeAvatar :size="20" :user-id="inst.startUser.id" />
      </div>
      <div class="start-time">提交于 {{ moment(inst.startTime).format('yyyy-MM-DD HH:mm:ss') }}</div>
    </div>
  </div>
</template>

<style lang="less" scoped>
@import '../variables.module.less';

.flow-card-box {
  user-select: none;
  border-radius: @BorderRadius;
  overflow: hidden;
  border: 1px solid #e9ebef;
  padding: 10px 12px;
  cursor: pointer;
  transition: box-shadow 0.2s cubic-bezier(0, 0, 1, 1);
  // scroll-snap-align: start;
  // scroll-snap-type: y mandatory;

  .header {
    display: flex;
    align-items: center;
    justify-content: space-between;

    .name {
      font-size: 14px;
    }
  }

  .summary-list {
    margin-top: 10px;

    .summary-item {
      display: flex;
      min-height: 20px;

      .label {
        color: #9ba5b3;
        // width: @FlowCardFieldLabelWidth;
        overflow: hidden;
        white-space: nowrap;
        flex-shrink: 0;
      }

      .value {
        color: #232730;
        // max-width: calc(100% - @FlowCardFieldLabelWidth);
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
    }
  }

  .footer {
    margin-top: 10px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-size: 13px;

    .initiator {
      display: flex;
      align-items: center;
    }

    .start-time {
      color: #86909c;
    }
  }
}

.flow-card-box-hoverable {
  &:hover {
    box-shadow: 4px 4px 12px rgb(229, 230, 235);
  }
}
</style>

<style lang="less">
.flow-card-detail-drawer {
  .arco-drawer-body {
    padding: 0;
  }
}
</style>
