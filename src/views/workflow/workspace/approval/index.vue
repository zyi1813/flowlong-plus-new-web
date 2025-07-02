<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useMessage } from 'naive-ui';
import { getFormGroup } from '@/service/api/workflow/designer';
import { startProcess } from '@/service/api/workflow/workspace';
import FlowStart from '@/views/workflow/workspace/approval/FlowStart.vue';

const templateGroups = ref([]);

const flowStartRef = ref();

const message = useMessage();

const defaultExpands = computed(() => {
  return templateGroups.value.map(item => item.id);
});

const isShow = ref(false);
const clickItem = ref({});

function stringToColor(str) {
  // 将字符串转换为哈希值
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }

  // 生成颜色代码
  const color = `#${Math.floor(Math.abs(Math.sin(hash) * 16777215) % 16777215).toString(16)}`;

  return color;
}

const handleClick = template => {
  clickItem.value = template;
  isShow.value = true;
};

const submitApproval = () => {
  flowStartRef.value.validate(valid => {
    if (valid) {
      startProcess({
        templateId: clickItem.value.templateId,
        variable: flowStartRef.value.formData
      }).then(res => {
        console.log('startProcess', res);
        isShow.value = false;
        message.success('提交成功');
      });
    } else {
      message.warning('请完善表单');
    }
  });
};

onMounted(() => {
  getFormGroup().then(res => {
    templateGroups.value = res.data;
  });
});
</script>

<template>
  <div>
    <NCard>
      审批列表
      <n-collapse :expanded-names="defaultExpands">
        <n-collapse-item
          v-for="item in templateGroups"
          v-show="item.items.length > 0"
          :key="item.id"
          :title="item.name"
          :name="item.id"
        >
          <div class="flex justify-start flex-wrap cursor-pointer">
            <n-card
              v-for="template in item.items"
              :key="template.templateId"
              style="width: 300px; margin-left: 8px"
              class="hover:border-blue-400"
              @click="handleClick(template)"
            >
              <div class="flex">
                <NAvatar :color="stringToColor(template.templateName)">{{ template.templateName.slice(0, 1) }}</NAvatar>
                <div class="flex ml-3 items-center">
                  <p class="text-sm font-medium text-slate-900">{{ template.templateName }}</p>
                  <div class="ml-16 text-blue-400">发起申请</div>
                </div>
              </div>
            </n-card>
          </div>
        </n-collapse-item>
      </n-collapse>
    </NCard>
    <n-drawer v-model:show="isShow" :width="500" placement="right">
      <n-drawer-content title="">
        <FlowStart v-if="isShow" ref="flowStartRef" :template-id="clickItem.templateId" />
        <template #footer>
          <div class="flex justify-end">
            <NButton @click="isShow = false">关闭</NButton>
            <NButton type="primary" class="ml-3" @click="submitApproval">提交</NButton>
          </div>
        </template>
      </n-drawer-content>
    </n-drawer>
  </div>
</template>

<style scoped lang="less"></style>
