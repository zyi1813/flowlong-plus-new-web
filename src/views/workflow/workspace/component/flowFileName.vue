<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { fileInfo } from '@/service/api/oss';

interface Props {
  fileId: string;
}
const props = withDefaults(defineProps<Props>(), {
  fileId: ''
});

const name = ref('');

onMounted(() => {
  if (props.fileId) {
    fileInfo(props.fileId).then(res => {
      name.value = res.data.originalFilename;
    });
  } else {
    console.warn('fileId is required!');
  }
});
</script>

<template>
  <div>{{ name }}</div>
</template>

<style scoped lang="less"></style>
