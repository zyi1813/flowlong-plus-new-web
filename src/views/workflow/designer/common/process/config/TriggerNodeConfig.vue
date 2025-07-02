<script setup lang="ts">
import { computed, withDefaults } from 'vue';
import { useMessage } from 'naive-ui';
import { useWorkflowStore } from '@/store/modules/workflow';

const emit = defineEmits(['update:config']);

const workflowStore = useWorkflowStore();
const message = useMessage();

const forms = workflowStore.design.formItems;

interface Props {
  config: {
    type: 'WEBHOOK' | 'EMAIL';
    http: {
      url: string;
      method: string;
      headers: {
        name: string;
        isField: boolean;
        value: string;
      }[];
      params: {
        name: string;
        isField: boolean;
        value: string;
      }[];
      contentType: string;
      handlerByScript: boolean;
      success: string;
      fail: string;
    };
    email: {
      subject: string;
      to: string[];
      content: string;
    };
  };
}
const props = withDefaults(defineProps<Props>(), {
  config: () => {
    return {
      type: 'WEBHOOK',
      http: {
        url: '',
        method: 'GET',
        headers: [],
        params: [],
        contentType: 'JSON',
        handlerByScript: false,
        success: '',
        fail: ''
      },
      email: {
        subject: '',
        to: [],
        content: ''
      }
    };
  }
});

const config_ = computed({
  get: () => props.config,
  set: val => {
    emit('update:config', val);
  }
});

const addItem = (items: any[]) => {
  if (items.length > 0 && (items[items.length - 1].name.trim() === '' || items[items.length - 1].value.trim() === '')) {
    message.warning('请完善之前项后在添加');
    return;
  }
  items.push({ name: '', value: '', isField: true });
};
const delItem = (items: any[], index: number) => {
  items.splice(index, 1);
};
</script>

<template>
  <div>
    <n-form labn-position="top" labn-width="90px">
      <n-form-item label="选择触发的动作:" class="mt-2">
        <n-radio-group v-model:value="config_.type">
          <n-radio value="WEBHOOK">发送网络请求</n-radio>
          <n-radio value="EMAIL">发送邮件</n-radio>
        </n-radio-group>
      </n-form-item>
      <div v-if="config_.type === 'WEBHOOK'">
        <n-form-item label="请求地址" class="mt-7">
          <n-select
            v-model:value="config_.http.method"
            style="width: 115px"
            placeholder="URL"
            :options="[
              { value: 'GET', label: 'GET' },
              { value: 'POST', label: 'POST' },
              { value: 'PUT', label: 'PUT' },
              { value: 'DELETE', label: 'DELETE' }
            ]"
          />
          <n-input v-model:value="config_.http.url" placeholder="请输入URL地址" size="medium" />
        </n-form-item>
        <n-form-item label="Header请求头:" class="mt-7">
          <div>
            <div>
              <n-button size="small" dashed @click="addItem(config_.http.headers)">
                <template #icon>
                  <i class="x-icon-plus x-iconfont"></i>
                </template>
                添加
              </n-button>
            </div>
            <div v-for="(header, index) in config_.http.headers" :key="header.name" class="flex mt-4">
              <i class="x-icon-caret-right x-iconfont"></i>
              <n-input v-model:value="header.name" placeholder="参数名" size="small" style="width: 100px" />
              <n-radio-group v-model:value="header.isField" size="small" style="margin: 0 5px">
                <n-radio-button :value="true">表单</n-radio-button>
                <n-radio-button :value="false">固定</n-radio-button>
              </n-radio-group>
              <n-select
                v-if="header.isField"
                v-model:value="header.value"
                style="width: 180px"
                size="small"
                placeholder="请选择表单字段"
                label-field="title"
                value-field="title"
                :options="forms"
              />
              <n-input
                v-else
                v-model:value="header.value"
                placeholder="请设置字段值"
                size="small"
                style="width: 180px"
              />
              <i
                class="x-icon-delete x-iconfont"
                style="line-height: 28px; margin-left: 5px; color: #c75450; cursor: pointer"
                @click="delItem(config_.http.headers, index as number)"
              ></i>
            </div>
          </div>
        </n-form-item>
        <n-form-item label="Header请求参数:" class="mt-7">
          <div>
            <div>
              <n-button size="small" dashed @click="addItem(config_.http.params)">
                <template #icon>
                  <i class="x-icon-plus x-iconfont"></i>
                </template>
                添加
              </n-button>
              <span class="inline-block ml-4">
                参数类型
                <i class="x-icon-line x-iconfont"></i>
              </span>
              <n-radio-group v-model:value="config_.http.contentType" size="small" style="margin: 0 5px">
                <n-radio-button value="JSON">json</n-radio-button>
                <n-radio-button value="FORM">form</n-radio-button>
              </n-radio-group>
            </div>
            <div v-for="(param, index) in config_.http.params" :key="param.name" class="flex mt-4">
              <i class="x-icon-caret-right x-iconfont"></i>
              <n-input v-model:value="param.name" placeholder="参数名" size="small" style="width: 100px" />
              <n-radio-group v-model:value="param.isField" size="small" style="margin: 0 5px">
                <n-radio-button :value="true">表单</n-radio-button>
                <n-radio-button :value="false">固定</n-radio-button>
              </n-radio-group>
              <n-select
                v-if="param.isField"
                v-model:value="param.value"
                style="width: 180px"
                size="small"
                placeholder="请选择表单字段"
                label-field="title"
                value-field="title"
                :options="forms"
              />
              <n-input
                v-else
                v-model:value="param.value"
                placeholder="请设置字段值"
                size="small"
                style="width: 180px"
              />
              <n-icon
                class="x-icon-delete x-iconfont"
                style="margin-left: 5px; color: #c75450; cursor: pointer"
                @click="delItem(config_.http.params, index as number)"
              />
            </div>
          </div>
        </n-form-item>
        <n-form-item label="请求结果处理" class="mt-7">
          <div>
            <div>
              <span class="mt-3 inline-block mr-1">自定义脚本:</span>
              <n-switch v-model:value="config_.http.handlerByScript" />
            </div>
            <div v-if="config_.http.handlerByScript">
              <p class="mt-3">tip: 返回值为 ture 则流程通过，为 false 则流程将被驳回</p>
              <div class="mt-3">
                支持函数
                <span style="color: dodgerblue">
                  setFormByName(
                  <span style="color: #939494">'表单字段名', '表单字段值'</span>
                  )
                </span>
                可改表单数据
              </div>
            </div>
            <span
v-else class="mt-5 inline-block"
              <i class="x-icon-success x-iconfont text-emerald-600"></i>
              无论请求结果如何，均通过
            </span>
            <div v-if="config_.http.handlerByScript" class="mt-4">
              <div>
                <span class="x-icon-success x-iconfont text-emerald-600 mb-2 inline-block">请求成功：</span>
                <n-input v-model:value="config_.http.success" type="textarea" :rows="5" />
              </div>
              <div class="mt-8">
                <span class="x-icon-error x-iconfont text-rose-700 mb-2 inline-block">请求失败：</span>
                <n-input v-model:value="config_.http.fail" type="textarea" :rows="5" />
              </div>
            </div>
          </div>
        </n-form-item>
      </div>
      <div v-else-if="config_.type === 'EMAIL'">
        <n-form-item label="邮件主题" class="mt-7">
          <n-input v-model:value="config_.email.subject" placeholder="请输入邮件主题" size="medium" />
        </n-form-item>
        <n-form-item label="收件方" class="mt-7">
          <n-select
            v-model:value="config_.email.to"
            size="small"
            style="width: 100%"
            filterable
            multiple
            placeholder="请输入收件人"
            :options="[]"
          />
        </n-form-item>
        <n-form-item label="邮件正文" class="mt-7">
          <n-input
            v-model:value="config_.email.content"
            type="textarea"
            :rows="4"
            placeholder="邮件内容，支持变量提取表单数据 ${表单字段名} "
          />
        </n-form-item>
      </div>
    </n-form>
  </div>
</template>

<style scoped lang="less"></style>
