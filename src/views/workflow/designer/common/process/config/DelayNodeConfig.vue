<script setup lang="ts">
import { computed, withDefaults } from 'vue';
const emit = defineEmits(['update:config']);

const props = withDefaults(
  defineProps<{
    config: {
      type: string;
      time: number;
      unit: string;
      dateTime: string;
    };
  }>(),
  {
    config: () => {
      return {
        type: 'FIXED',
        time: 0,
        unit: 'M',
        dateTime: '00:00:00'
      };
    }
  }
);

const config_ = computed({
  get: () => props.config,
  set: val => {
    emit('update:config', val);
  }
});
</script>

<template>
  <div>
    <div style="margin-bottom: 20px">
      <p class="mb-2 block">延时方式</p>
      <n-radio-group v-model:value="config_.type" size="small">
        <n-radio-button value="FIXED">固定时长</n-radio-button>
        <n-radio-button value="AUTO">自动计算</n-radio-button>
      </n-radio-group>
    </div>
    <div v-if="config_.type === 'FIXED'" class="flex">
      <n-input-number v-model:value="config_.time" style="width: 100px" placeholder="时间单位" size="small" />
      <n-select
        v-model:value="config_.unit"
        style="width: 75px"
        placeholder="请选择"
        size="small"
        :options="[
          { label: '天', value: 'D' },
          { label: '小时', value: 'H' },
          { label: '分钟', value: 'M' }
        ]"
      >
        <!--        <n-option label="天" value="D" />-->
        <!--        <n-option label="小时" value="H" />-->
        <!--        <n-option label="分钟" value="M" />-->
      </n-select>
      <span class="inline-block ml-2" style="line-height: 28px">后进入下一步</span>
    </div>
    <div v-else class="flex">
      <span class="inline-block mr-2" style="line-height: 28px">至当天</span>
      <NTimePicker
        value-format="HH:mm:ss"
        style="width: 150px"
        size="small"
        :formatted-value="config_.dateTime ? config_.dateTime : '00:00:00'"
        placeholder="任意时间点"
        @update:formatted-value="config_.dateTime = $event"
      />
      <span class="inline-block ml-2" style="line-height: 28px">后进入下一步</span>
    </div>
  </div>
</template>

<style scoped lang="less"></style>
