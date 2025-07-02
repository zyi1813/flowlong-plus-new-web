<script lang="ts" setup>
import { computed } from 'vue';
const props = defineProps({
  size: {
    type: [Number, String],
    default: 24
  },
  name: {
    type: String,
    required: true
  },
  color: {
    type: String,
    default: '#000'
  }
});

const clazz = computed(() => {
  return `x-iconfont ${props.name}`;
});
</script>

<template>
  <i
    :style="{
      color: props.color,
      fontSize: props.size + 'px'
    }"
    class="xpark-icon"
    :class="clazz"
  ></i>
</template>

<style scoped lang="less">
.xpark-icon {
  height: 1em;
  width: 1em;
  line-height: 1em;
  display: inline-block;
  justify-content: center;
  align-items: center;
  position: relative;
  fill: currentColor;
  font-size: inherit;
}
</style>
