<script setup lang="ts">
import Node from './Node.vue';

defineOptions({
  name: 'EmptyNode'
});
</script>

<template>
  <Node :show="false" />
</template>

<style scoped></style>
