<script setup lang="ts">
import { computed } from 'vue';
import { useAuthStore } from '@/store/modules/auth';
import { createServiceConfig } from '~/env.config';
const userAuth = useAuthStore();
const { baseURL } = createServiceConfig(import.meta.env);

const fileUploadUrl = `${baseURL}/api/oss/upload`; // 文件上传地址
const headers = {
  token: userAuth.token,
  tanentId: userAuth.tenantId
};
interface Props {
  mode?: string;
  placeholder?: string;
  readerMode?: boolean;
  value?: any;
  maxSize?: number;
  maxNumber?: number;
  enableZip?: boolean;
}

const emit = defineEmits(['update:value']);

const props = withDefaults(defineProps<Props>(), {
  mode: 'DESIGN',
  placeholder: '请输入内容',
  readerMode: false,
  value: () => [],
  maxSize: 5, // 图片最大大小MB
  maxNumber: 3, // 最大上传数量
  enableZip: true
});

const sizeTip = computed(() => (props.maxSize > 0 ? `| 每张图不超过${props.maxSize}MB` : ''));

const uploadFinishHandle = (options: any) => {
  const resp = JSON.parse((options.event?.target as XMLHttpRequest).response);
  const value = props.value ? props.value : [];
  value.push(resp.data.id);
  emit('update:value', value);
};
</script>

<template>
  <div>
    <div v-if="mode === 'DESIGN'">
      <n-upload list-type="image-card" disabled />
      <p>{{ placeholder }} {{ sizeTip }}</p>
    </div>
    <div v-else>
      <n-upload
        :action="fileUploadUrl"
        :headers="headers"
        :max="maxNumber"
        multiple
        :data="{}"
        list-type="image-card"
        @finish="
          options => {
            uploadFinishHandle(options);
          }
        "
      />
      <p class="font">{{ placeholder }} {{ sizeTip }}</p>
    </div>
  </div>
</template>

<style scoped lang="less">
.font {
  font-size: 12px;
  color: #303133;
  margin-top: 7px;
}
</style>
