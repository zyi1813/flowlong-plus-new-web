<script setup lang="ts">
import { computed, nextTick, onMounted, reactive, ref, watch } from 'vue';
import { getTemplateDetail, processPreview } from '@/service/api/workflow/workspace';
import FormRender from '@/views/workflow/designer/common/form/FormRender.vue';
import FlowNodeAvatar from '@/views/workflow/workspace/component/flowNodeAvatar.vue';

const NODE = {
  START: 0,
  APPROVE: 1,
  COPY: 2,
  END: -1
};

interface TemplateInfo {
  templateId: string;
  templateName: string;
  logo: string;
  formItems: any[];
  process: any;
  remark: string;
  settings?: any;
}

interface ProcessNode {
  type: number;
  examineMode?: number;
  nodeAssigneeList?: any[];
  selectMode?: number;
  userIds?: string[];
  setType?: number;
}

const props = defineProps<{
  templateId: string;
}>();

const templateInfo = ref<TemplateInfo>({
  templateId: '',
  templateName: '',
  logo: '',
  formItems: [],
  process: {},
  remark: ''
});

const formRenderRef = ref<InstanceType<typeof FormRender>>();
const forms = computed(() => templateInfo.value.formItems);
const formData = ref<Record<string, any>>({});

const loadTemplateDetail = () => {
  getTemplateDetail(props.templateId).then((res: any) => {
    const info = res.data;
    info.settings = JSON.parse(info.settings);
    info.formItems = JSON.parse(info.formItems);
    info.process = JSON.parse(info.process);
    templateInfo.value = info;
    nextTick(() => {
      flowPreview(true);
    });
  });
};

const flowProcessNodes = ref<ProcessNode[]>([]);
const flowPreview = (clean = false) => {
  formRenderRef.value?.validate((success: boolean) => {
    if (clean) {
      formRenderRef.value?.reset();
    }
    if (success) {
      processPreview(props.templateId, formData.value).then((res: any) => {
        flowProcessNodes.value = res.data;
      });
    }
  });
};

watch(
  () => formData.value,
  () => {
    flowPreview();
  },
  { deep: true }
);

onMounted(() => {
  loadTemplateDetail();
});

const flowTimeLineDotColors: Record<number, { color: string }> = reactive({});
flowTimeLineDotColors[NODE.START] = { color: '#a9b4cd' };
flowTimeLineDotColors[NODE.APPROVE] = { color: '#ff943e' };
flowTimeLineDotColors[NODE.COPY] = { color: '#3296fa' };
flowTimeLineDotColors[NODE.END] = { color: '#a9b4cd' };

const validate = (cb: (success: boolean) => void) => {
  formRenderRef.value?.validate((success: boolean) => {
    cb(success);
  });
};

defineExpose({
  validate,
  formData
});
</script>

<template>
  <div>
    <n-divider title-placement="left">{{ templateInfo.templateName }}表单</n-divider>
    <FormRender ref="formRenderRef" v-model:value="formData" class="process-form" :forms="forms" />
    <n-divider title-placement="left">审批流程</n-divider>
    <div v-if="flowProcessNodes && flowProcessNodes.length > 0" class="flow-preview-box">
      <div class="flow-preview-nodes">
        <n-timeline>
          <n-timeline-item
            v-for="(node, index) in flowProcessNodes"
            :key="index"
            :color="flowTimeLineDotColors[node.type].color"
          >
            <!-- 开始节点 -->
            <div v-if="node.type == NODE.START" class="node-box">
              <div class="node-name">开始</div>
            </div>
            <!-- 审批人节点 -->
            <div v-else-if="node.type == NODE.APPROVE" class="node-box">
              <div class="node-name">
                审批
                <div v-if="node.examineMode == 3 || (node.nodeAssigneeList && node.nodeAssigneeList.length == 1)" class="node-type">
                  <span>只需一人审批同意</span>
                </div>
                <div v-else-if="node.examineMode == 2 || node.examineMode == 1" class="node-type">
                  <span>需所有人审批同意</span>
                </div>
                <div v-else-if="node.examineMode == 4" class="node-type">
                  <span>需总权重大于50%</span>
                </div>
              </div>
              <div class="node-content flex">
                <div v-if="node.selectMode == 1 || node.selectMode == 2" class="initator-chioce">
                  <n-button size="tiny" secondary>
                    <template #icon>
                      <i class="x-iconfont x-icon-plus"></i>
                    </template>
                  </n-button>
                </div>
                <template v-else>
                  <FlowNodeAvatar v-for="userId in (node.userIds || [])" :size="20" :user-id="userId" :set-type="node.setType || 1" class="assignee-item" />
                </template>
              </div>
            </div>
            <!-- 抄送人节点 -->
            <div v-else-if="node.type == NODE.COPY" class="node-box">
              <div class="node-name">抄送</div>
              <div class="node-content">
                <div class="node-cc">
                  <template v-if="(node.userIds && node.userIds.length > 0)">
                    <FlowNodeAvatar v-for="userId in node.userIds" :size="20" :user-id="userId" :set-type="node.setType || 1" class="assignee-item" />
                  </template>
                  <template v-else>
                    <div class="null-tooltip">没有抄送人</div>
                  </template>
                </div>
              </div>
            </div>
            <!-- 结束节点 -->
            <div v-else-if="node.type == NODE.END" class="node-box">
              <div class="node-name">结束</div>
            </div>
          </n-timeline-item>
        </n-timeline>
      </div>
    </div>
    <n-alert v-else type="warning">必填信息填写完整后，将显示审批流程，之后方可提交审批。</n-alert>
  </div>
</template>

<style scoped lang="less">
.flow-preview-box {
  user-select: none;
  margin-top: 16px;

  .flow-preview-nodes {
    margin-top: 8px;

    .node-box {
      .node-name {
        display: flex;
        flex-direction: row;
        align-items: baseline;

        .node-type {
          font-size: 12px;
          color: #8f959e;
          margin-left: 4px;
        }
      }

      .node-content {
        margin-bottom: 30px;

        .node-assignee,
        .node-cc {
          margin-top: 4px;
          display: flex;
          flex-flow: row wrap;
          gap: 6px;
        }

        .assignee-item {
          margin-right: 4px;
          margin-top: 4px;
          max-width: 70px;
        }

        .null-tooltip {
          font-weight: 400;
          color: #86909c;
          font-size: 12px;
        }

        .initator-chioce {
          margin-top: 4px;
          display: flex;

          .assignee-list {
            flex: 1;
            margin-left: 10px;
            display: grid;
            gap: 4px;
            grid-template-columns: repeat(auto-fill, minmax(70px, max-content));
          }
        }
      }
    }
  }
}
</style>
