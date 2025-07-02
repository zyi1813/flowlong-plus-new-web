<script setup lang="tsx">
import { format } from 'date-fns/esm';
import { createServiceConfig } from '~/env.config';
import FlowFileName from './flowFileName.vue';
import { ref, watch } from 'vue';

interface Props {
  formItems: any[];
  formData: any;
  editable?: boolean;
}

const props = defineProps<Props>();
const emit = defineEmits(['update:formData']);
const { baseURL } = createServiceConfig(import.meta.env);

const localFormData = ref({ ...props.formData });
watch(
  () => props.formData,
  (val) => {
    localFormData.value = { ...val };
  },
  { deep: true, immediate: true }
);
watch(
  () => localFormData.value,
  (val) => {
    if (props.editable) emit('update:formData', val);
  },
  { deep: true }
);
// 附件下载
const onAttachmentDownload = (attachment, evt) => {
  evt.stopPropagation();
  window.open(`${baseURL}/api/oss/file/${attachment.id}?download=true`, '_blank');
};
</script>

<template>
  <!-- 表单信息 -->
  <div class="flow-form-box">
    <template v-for="formItem in formItems">
      <template v-if="props.editable">
        <div class="form-item">
          <div class="label">{{ formItem.title }}</div>
          <div class="value">
            <n-input v-if="['TextInput', 'TextareaInput', 'SelectInput'].includes(formItem.name)" v-model:value="localFormData[formItem.id]" />
            <n-input-number v-else-if="formItem.name === 'NumberInput'" v-model:value="localFormData[formItem.id]" />
            <n-input v-else-if="formItem.name === 'AmountInput'" v-model:value="localFormData[formItem.id]" />
            <n-select v-else-if="formItem.name === 'MultipleSelect'" v-model:value="localFormData[formItem.id]" :options="formItem.props.options || []" multiple />
            <!-- 其他类型可扩展 -->
            <span v-else>{{ localFormData[formItem.id] }}</span>
          </div>
        </div>
      </template>
      <template v-else>
        <template
          v-if="[
            'TextInput',
            'NumberInput',
            'TextareaInput',
            'AmountInput',
            'SelectInput',
            'MultipleSelect',
            'DateTime',
            'DateTimeRange',
            'ImageUpload',
            'FileUpload'
          ].includes(formItem.name)"
        >
          <!-- 文本、单选 -->
          <div v-if="['TextInput', 'TextareaInput', 'SelectInput'].includes(formItem.name)" class="form-item">
            <div class="label">{{ formItem.title }}</div>
            <div class="value">{{ formData[formItem.id] ? formData[formItem.id] : '--' }}</div>
          </div>
          <!-- 数值 -->
          <div v-else-if="['NumberInput'].includes(formItem.name)" class="form-item">
            <div class="label">{{ formItem.title }}</div>
            <div class="value">{{ formData[formItem.id] ? formData[formItem.id] : '--' }}</div>
          </div>
          <!-- 金额 -->
          <div v-else-if="['AmountInput'].includes(formItem.name)" class="form-item">
            <div class="label">{{ formItem.title }}</div>
            <div class="value">{{ formData[formItem.id] ? formData[formItem.id] : '--' }}</div>
          </div>
          <!-- 多选 -->
          <div v-else-if="['MultipleSelect'].includes(formItem.name)" class="form-item">
            <div class="label">{{ formItem.title }}</div>
            <div class="value">{{ formData[formItem.id] ? (formData[formItem.id] || []).join(', ') : '--' }}</div>
          </div>
          <!-- 日期 -->
          <div v-else-if="['DateTime'].includes(formItem.name)" class="form-item">
            <div class="label">{{ formItem.title }}</div>
            <div class="value">
              {{ formData[formItem.id] ? format(formData[formItem.id], formItem.props.format) : '--' }}
            </div>
          </div>
          <!-- 日期区间 -->
          <div v-else-if="['DateTimeRange'].includes(formItem.name)" class="form-item">
            <div class="label">{{ formItem.title }}</div>
            <div v-if="formData[formItem.id] && formData[formItem.id].length === 2" class="value">
              {{ formData[formItem.id][0] ? format(formData[formItem.id][0], formItem.props.format) : '--' }} 至
              {{ formData[formItem.id][1] ? format(formData[formItem.id][1], formItem.props.format) : '--' }}
            </div>
            <div class="value">--</div>
          </div>
          <!-- 图片 -->
          <div v-else-if="['ImageUpload'].includes(formItem.name)" class="form-item">
            <div class="label">{{ formItem.title }}</div>
            <div class="value img-preview">
              <n-image v-for="id in formData[formItem.id] || []" :key="id" :src="`${baseURL}/api/oss/file/${id}`" />
            </div>
          </div>
          <!-- 附件 -->
          <div v-else-if="['FileUpload'].includes(formItem.name)" class="form-item">
            <div class="label">{{ formItem.title }}</div>
            <div class="value">
              <div class="attachment-box">
                <div
                  v-for="attachmentId in formData[formItem.id] || []"
                  class="attachment-item"
                  @click="onAttachmentDownload({ id: attachmentId }, $event)"
                >
                  <div class="link">
                    <FlowFileName :file-id="attachmentId" />
                  </div>
                  <div class="action">
                    <i class="x-icon-download x-iconfont"></i>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </template>
      </template>
    </template>
  </div>
</template>

<style lang="less" scoped>
@import '../variables.module.less';

@FormLabelWidth: 84px;

.flow-form-box {
  padding: 10px 0;

  .form-item {
    font-size: 14px;
    display: flex;

    + .form-item {
      margin-top: 12px;
    }

    .label {
      color: #9ba5b3;
      width: @FormLabelWidth;
      white-space: nowrap;
      overflow: hidden;
      text-align: right;
      margin-right: 16px;
      flex-shrink: 0;
    }

    .value {
      color: #1d2129;
      display: flex;
      align-items: flex-start;
      width: calc(100% - @FormLabelWidth - 16px);
      word-wrap: anywhere;
      word-break: break-all;
    }
  }

  .img-preview {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 8px;

    .n-image {
      width: 56px;
      height: 56px;
      cursor: pointer;
    }
  }

  .attachment-box {
    width: 100%;
    display: flex;
    flex-wrap: wrap;
    gap: 8px;

    .attachment-item {
      background-color: #f7f8fa;
      display: flex;
      align-items: center;
      cursor: pointer;
      padding: 8px 12px;
      border-radius: 4px;
      font-size: 13px;
    }
  }
}
</style>
