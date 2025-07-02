<script setup lang="ts">
defineOptions({
  name: 'GlobalFooter'
});
</script>

<template>
  <DarkModeContainer class="flex-center h-full">
    <a href="https://github.com/jarryxy" target="_blank" rel="noopener noreferrer">
      Copyright © {{ new Date().getFullYear() }} JIAXIAOYU
    </a>
  </DarkModeContainer>
</template>

<style scoped></style>
