<script setup lang="ts">
import { PaperPlaneOutline as PublishIcon, EyeOutline as ViewIcon } from '@vicons/ionicons5';
import { type PropType, computed, onBeforeMount, onBeforeUnmount, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { isEmpty } from 'lodash-es';
import { useMessage } from 'naive-ui';
import { createTemplate, getTemplateDetail, updateTemplate } from '@/service/api/workflow/designer';
import { useWorkflowStore } from '@/store/modules/workflow/index';
import ProcessDesign from '@/views/workflow/designer/components/ProcessDesign/index.vue';
import FormDesign from '../designer/components/FormDesign/index.vue';
import FormProSetting from '../designer/components/FormProSetting/index.vue';
import FormBaseSetting from '../designer/components/FormBaseSetting/index.vue';

const message = useMessage();

const workflowStore = useWorkflowStore();

const route = useRoute();
const router = useRouter();
const groupId = ref<string | number | null>(null);

let isNew = true;
const getNodeKey = () => {
  return `flk_${new Date().getTime().toString().substring(5)}${Math.round(Math.random() * 9000 + 1000)}`;
};
const loadInitFrom = () => {
  workflowStore.loadForm({
    templateId: null,
    templateName: '未命名流程',
    templateKey: '',
    settings: {
      sign: false
    },
    groupId: undefined,
    formItems: [],
    process: {
      id: 'node_start',
      parentId: null,
      type: 0,
      nodeName: '发起人',
      nodeKey:getNodeKey(),
      nodeAssigneeList: [],
      childNode: {
        id: 'node_end',
        parentId: 'node_root',
        type: -1,
        nodeName: '结束',
        nodeAssigneeList: []
      }
    },
    remark: ''
  });
};

const baseSettingRef = ref();
const formDesignRef = ref();
const processDesignRef = ref();
const proSettingRef = ref();

const activeTab = ref('baseSetting');

const validStep = ref(0);
const validResult = ref({
  errs: [],
  finished: false,
  success: false,
  title: '检查中...',
  action: '处理',
  desc: '正在检查设置项'
});
let timer: any = null;
const validVisible = ref(false);
const validOptions = ref<Array<any | { status: PropType<'process' | 'finish' | 'error' | 'wait'> }>>([
  { title: '基础信息', description: '', icon: '', status: '' },
  { title: '审批表单', description: '', icon: '', status: '' },
  { title: '审批流程', description: '', icon: '', status: '' },
  { title: '拓展设置', description: '', icon: '', status: '' }
]);
const validComponents = [baseSettingRef, formDesignRef, processDesignRef, proSettingRef];

const stopTimer = () => {
  if (timer) {
    clearInterval(timer);
  }
};
const errTitle = computed(() => {
  if (validResult.value.finished && !validResult.value.success) {
    return `${validResult.value.title} (${validResult.value.errs.length}项错误) `;
  }
  return validResult.value.title;
});

const validIcon = computed(() => {
  if (validResult.value.success) {
    return 'success';
  }
  return 'warning';
});
const validateDesign = () => {
  validVisible.value = true;
  validStep.value = 0;
  showValiding();
  stopTimer();
  timer = setInterval(() => {
    validResult.value.errs = validComponents[validStep.value].value.validate();
    if (Array.isArray(validResult.value.errs) && validResult.value.errs.length === 0) {
      validStep.value++;
      if (validStep.value >= validOptions.value.length) {
        stopTimer();
        showValidFinish(true);
      }
    } else {
      stopTimer();
      validOptions.value[validStep.value].status = 'error';
      showValidFinish(false, getDefaultValidErr());
    }
  }, 300);
};

const getDefaultValidErr = () => {
  switch (validStep.value) {
    case 0:
      return '请检查基础设置项';
    case 1:
      return '请检查审批表单相关设置';
    case 2:
      return '请检查审批流程，查看对应标注节点错误信息';
    case 3:
      return '请检查拓展设置';
    default:
      return '未知错误';
  }
};

const showValidFinish = (success: boolean, err?: string) => {
  validResult.value.success = success;
  validResult.value.finished = true;
  validResult.value.title = success ? '校验完成' : '校验失败 ';
  validResult.value.desc = success ? '设置项校验成功，是否提交？' : err || '';
  validResult.value.action = success ? '提 交' : '去修改';
};
const showValiding = () => {
  validResult.value = {
    errs: [],
    finished: false,
    success: false,
    title: '检查中...',
    action: '处理',
    desc: '正在检查设置项'
  };
  validStep.value = 0;
  validOptions.value.forEach(op => {
    op.status = '';
    op.icon = '';
    op.description = '';
  });
};

const publishProcess = () => {
  validateDesign();
};

const doAfter = () => {
  if (validResult.value.success) {
    doPublish();
  } else {
    activeTab.value = ['baseSetting', 'formDesign', 'processDesign', 'proSetting'][validStep.value];
    validVisible.value = false;
  }
};

const doPublish = () => {
  const design = workflowStore.design;
  const processNew = JSON.parse(JSON.stringify(design.process));
  console.log(workflowStore.design);
  // 判断条件分支
  conditionRecursion(processNew);

  const template = {
    templateId: design.templateId,
    templateName: design.templateName,
    templateKey: design.templateKey,
    templateVersion: design.templateVersion,
    settings: JSON.stringify(design.settings),
    groupId: design.groupId,
    formItems: JSON.stringify(design.formItems),
    process: JSON.stringify(processNew),
    remark: design.remark
  };

  if (isNew || isEmpty(design.templateId)) {
    createTemplate(template)
      .then(() => {
        message.success('创建流程模版成功');
        router.push('/workflow/designer');
      })
      .catch(err => {
        console.error(err);
      });
  } else {
    updateTemplate(template)
      .then(() => {
        message.success('更新流程模版成功');
        router.push('/workflow/designer');
      })
      .catch(err => {
        console.error(err);
      });
  }
};

const conditionRecursion = process => {
  if (process != null && undefined != process) {
    if (process.branchs != null && undefined != process.branchs) {
      process.branchs.map((item, i) => {
        item.typeElse = i == process.branchs.length - 1;
        if (item.childNode != null && undefined != item.childNode) {
          conditionRecursion(item.childNode);
        } else {
          return item;
        }
      });
    } else {
      conditionRecursion(process.childNode);
    }
  }
};

const loadTemplateDetail = templateId => {
  getTemplateDetail(templateId).then(res => {
    const detail = res.data;
    detail.logo = JSON.parse(detail.logo);
    detail.settings = JSON.parse(detail.settings);
    detail.formItems = JSON.parse(detail.formItems);
    detail.process = JSON.parse(detail.process);
    groupId.value = detail.groupId;
    workflowStore.loadForm(detail);
  });
};

onBeforeMount(() => {
  loadInitFrom();
  groupId.value = `${route.query.groupId}`;
  if (Number.isNaN(groupId.value)) {
    groupId.value = null;
  }
  if (!isEmpty(route.query.templateId)) {
    isNew = false;
    loadTemplateDetail(route.query.templateId);
  }
});

onBeforeUnmount(() => {
  stopTimer();
});
</script>

<template>
  <div class="workflow-create">
    <n-card content-style="padding: 0;">
      <n-tabs v-model:value="activeTab" default-value="baseSetting" justify-content="center" type="line">
        <n-tab-pane name="baseSetting" tab="①基础信息" display-directive="show">
          <FormBaseSetting ref="baseSettingRef" :group-id="groupId" :is-edit="!isNew" />
        </n-tab-pane>
        <n-tab-pane name="formDesign" tab="②审批表单" display-directive="show">
          <FormDesign ref="formDesignRef" />
        </n-tab-pane>
        <n-tab-pane name="processDesign" tab="③审批流程" display-directive="show">
          <ProcessDesign ref="processDesignRef" />
        </n-tab-pane>
        <n-tab-pane name="proSetting" tab="④拓展设置" display-directive="show">
          <FormProSetting ref="proSettingRef" />
        </n-tab-pane>
        <template #suffix>
          <div class="publish">
            <n-button size="small" round @click="()=>{
              message.info('敬请期待...')
            }">
              <template #icon>
                <n-icon>
                  <ViewIcon />
                </n-icon>
              </template>
              预览
            </n-button>
            <n-button size="small" round type="primary" @click="publishProcess">
              <template #icon>
                <n-icon>
                  <PublishIcon />
                </n-icon>
              </template>
              发布
            </n-button>
          </div>
        </template>
      </n-tabs>
    </n-card>
    <n-modal v-model:show="validVisible">
      <n-card
        style="width: 50%; position: absolute; top: 30%; left: 0; right: 0"
        :segmented="{
          content: true
        }"
        title="设置项检查"
        closable
        @close="
          () => {
            validVisible = false;
          }
        "
      >
        <NSteps :current="validStep" status="process">
          <NStep
            v-for="(item, index) in validOptions"
            :key="index"
            :title="item.title"
            :icon="item.icon"
            :status="item.status"
            :description="item.description"
          />
        </NSteps>
        <NResult :title="errTitle" :status="validIcon" :description="validResult.desc">
          <template #default>
            <div class="flex flex-col justify-center items-center">
              <div class="err-info">
                <NEllipsis v-for="(err, i) in validResult.errs" :key="i + '_err'" hover-tip>
                  <div class="err-info__item">
                    <i style="font-size: 14px; vertical-align: middle" class="x-icon-warning-outline x-iconfont"></i>
                    <span style="font-size: 12px; vertical-align: middle">{{ err }}</span>
                  </div>
                </NEllipsis>
              </div>
              <n-button
                v-if="validResult.finished"
                style="width: 70px; margin-top: 20px"
                type="primary"
                size="small"
                @click="doAfter"
              >
                {{ validResult.action }}
              </n-button>
            </div>
          </template>
          <template v-if="!validResult.finished" #icon>
            <i style="font-size: 30px" class="x-iconfont x-icon-loading loading-icon"></i>
          </template>
        </NResult>
      </n-card>
    </n-modal>
  </div>
</template>

<style scoped lang="less">
.workflow-create {
  .publish .n-button {
    margin-right: 12px;
  }

  :deep(.n-tabs-nav--top) {
    padding: 16px 16px 0;
  }

  .n-tab-pane {
    //padding: 0 !important;
    display: flex;
    justify-content: center;
  }
}

/* 定义旋转动画 */
@keyframes rotate {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.loading-icon {
  animation: rotate 1.5s infinite linear;
}

:deep(.err-info) {
  max-height: 180px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  align-items: center;
  .n-ellipsis {
    display: block;
  }
  .err-info__item {
    padding: 2px;
    margin: 2px 0;
    width: 220px;
    text-align: left;
    border-radius: 3px;
    color: #606266;
    background: rgb(242 242 242);
  }
  i {
    margin: 0 5px;
  }
}
</style>
