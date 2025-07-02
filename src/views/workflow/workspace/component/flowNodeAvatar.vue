<!-- 流程节点头像 -->
<script setup>
import { computed, onBeforeMount, ref, watch } from 'vue';
import { getUserInfo } from '@/service/api/workflow/org';

const user = ref({
  name: '',
  avatar: ''
});

const props = defineProps({
  size: { type: Number, default: 32 },
  userId: { type: String, default: '' },
  showName: { type: Boolean, default: true },
  setType: { type: Number, default: 1 }
});

const shortName = computed(() => {
  return user.value.name.length > 2 ? user.value.name.slice(-2) : user.value.name;
});

watch(
  () => props.userId,
  () => loadUserDetail()
);

const loadUserDetail = () => {
  console.log("props:",props)
  getUserInfo(props.userId, props.setType).then(resp => {
    console.log("getUserInfo:",resp.data)
    user.value = resp.data || { name: '', avatar: '' };
  });
};

const AvatarStyle = computed(() => {
  const padding = props.showName ? 4 : 0;
  return {
    height: `${props.size + padding * 2}px`,
    borderRadius: `${(props.size + padding * 2) / 2}px`,
    padding: `${padding}px`
  };
});

const NameStyle = computed(() => {
  return {
    fontSize: `${props.size / 2 + 1}px`
  };
});

onBeforeMount(() => {
  loadUserDetail();
});
</script>

<template>
  <div class="avatar" :style="AvatarStyle">
    <n-avatar v-if="user && user.avatar" :size="size" class="icon" :image-url="user.avatar" round />
    <n-avatar
      v-else
      :size="size"
      class="icon"
      round
      :style="{
        color: '#fff',
        backgroundColor: '#03a9f4'
      }"
    >
      {{ shortName }}
    </n-avatar>
    <div v-if="showName && user && user.name" class="name" :style="NameStyle">{{ user.name }}</div>
  </div>
</template>

<style lang="less" scoped>
.avatar {
  background: #f2f4f5;
  display: flex;
  align-items: center;
  width: fit-content;
  box-sizing: border-box;
  .icon {
    overflow: hidden;
    flex-shrink: 0;
  }

  .name {
    user-select: none;
    font-family:
      PingFangSC-Regular,
      PingFang SC;
    color: #34383e;
    margin: 0 4px;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
    max-width: 64px;
  }
}
</style>
