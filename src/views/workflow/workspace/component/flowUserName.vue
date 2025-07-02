<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { getUserInfo } from '@/service/api/workflow/org';

interface Props {
  userId: string;
  setType: number;
}
const props = withDefaults(defineProps<Props>(), {
  userId: '',
  setType: 1
});

const name = ref('');

onMounted(() => {
  if (props.userId) {
    getUserInfo(props.userId, props.setType).then(res => {
      name.value = res.data.name;
    });
  } else {
    console.warn('userId is required!');
  }
});
</script>

<template>
  <div>{{ name }}</div>
</template>

<style scoped lang="less"></style>
