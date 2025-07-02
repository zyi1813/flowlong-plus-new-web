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
  onlyRead?: boolean;
  maxSize?: number;
  maxNumber?: number;
  fileTypes?: [];
}

const emit = defineEmits(['update:value']);

const props = withDefaults(defineProps<Props>(), {
  mode: 'DESIGN',
  placeholder: '请选择附件',
  readerMode: false,
  value: () => [],
  onlyRead: false, // 是否只读，false只能在线预览，true可以下载
  maxSize: 50, // 文件最大大小MB
  maxNumber: 3, // 最大上传数量
  fileTypes: () => {
    return [];
  }
});

const sizeTip = computed(() =>
  props.fileTypes.length > 0
    ? `只允许上传[${String(props.fileTypes).replaceAll(',', '、')}]格式的文件，且单个附件不超过${props.maxSize}MB`
    : ` | 单个附件不超过${props.maxSize}MB`
);

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
      <n-upload>
        <n-button disabled size="small" round class="button-font">选择文件</n-button>
      </n-upload>
      <p class="font">{{ placeholder }} {{ sizeTip }}</p>
    </div>
    <div v-else>
      <n-upload
        :action="fileUploadUrl"
        :headers="headers"
        :max="maxNumber"
        multiple
        :data="{}"
        @finish="
          options => {
            uploadFinishHandle(options);
          }
        "
      >
        <n-button size="small" round class="button-font">选择文件</n-button>
      </n-upload>
      <p class="font">{{ placeholder }} {{ sizeTip }}</p>
    </div>
  </div>
</template>

<style scoped lang="less">
.button-font {
  padding: 0 26px 0 26px;
  font-size: 12px;
  color: #606266;
}

.font {
  font-size: 12px;
  color: #303133;
  margin-top: 7px;
}
</style>
