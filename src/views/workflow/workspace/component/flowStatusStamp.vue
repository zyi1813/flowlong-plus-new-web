<!-- 流程印章 -->
<script setup>
import { computed } from 'vue';
import { STATUS } from '@/views/workflow/common/flowConstant';

const props = defineProps({
  status: [Number, String],
  size: { type: Number, default: 48 }
});

const style = computed(() => {
  return {
    width: `${props.size}px`,
    height: `${props.size}px`
  };
});
</script>

<template>
  <div class="flow-stamp-container">
    <img v-if="status == STATUS.APPROVED" :style="style" src="@/assets/stamp/approved.svg" alt="" />
    <img v-else-if="status == STATUS.REJECTED" :style="style" src="@/assets/stamp/rejected.svg" alt="" />
    <img v-else-if="status == STATUS.UNDERWAY" :style="style" src="@/assets/stamp/underway.svg" alt="" />
    <img v-else-if="status == STATUS.CANCELLED" :style="style" src="@/assets/stamp/canceled.svg" alt="" />
  </div>
</template>

<style lang="less" scoped>
.flow-stamp-container {
  img {
    overflow: hidden;
    background-color: transparent;
    z-index: 999;
  }
}
</style>
