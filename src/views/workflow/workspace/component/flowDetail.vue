<script setup lang="tsx">
import moment from 'moment';
import { computed, reactive, ref, watch } from 'vue';
import type { DropdownOption, FormItemRule } from 'naive-ui';
import FlowStatusStamp from '@/views/workflow/workspace/component/flowStatusStamp.vue';
import FlowNodeAvatar from '@/views/workflow/workspace/component/flowNodeAvatar.vue';
import FlowFromDetail from '@/views/workflow/workspace/component/flowFormDetail.vue';
import { ACTION, STATUS_LIST } from '@/views/workflow/common/flowConstant';
import {
  agree,
  comment,
  getInstanceForm,
  getNodeInfo,
  getProcessInstanceAction,
  refuse,
  revoke,
  resubmit
} from '@/service/api/workflow/workspace';
import FlowUserName from '@/views/workflow/workspace/component/flowUserName.vue';
import { createServiceConfig } from '~/env.config';
import { useMessage } from 'naive-ui';

import { useAuthStore } from '@/store/modules/auth';
const { baseURL } = createServiceConfig(import.meta.env);

const userAuth = useAuthStore();

const fileUploadUrl = `${baseURL}/api/oss/upload`; // 文件上传地址
const headers = {
  token: userAuth.token,
  tanentId: userAuth.tenantId
};
const uploadFinishHandle = ({ event }) => {
  const resp = JSON.parse((event?.target as XMLHttpRequest).response);
  modalConfig.formData.attachments.push(resp.data.id);
};
// 附件下载
const onAttachmentDownload = (attachment, evt) => {
  evt.stopPropagation();
  window.open(`${baseURL}/api/oss/file/${attachment.id}?download=true`, '_blank');
};

const props = defineProps({
  flowInstance: {
    type: Object,
    default: () => {}
  },
  cancelable: { type: Boolean, default: false }, // 撤销按钮
  commentable: { type: Boolean, default: true }, // 评论按钮
  actionable: { type: Boolean, default: false }, // 其他操作按钮
  editable: { type: Boolean, default: false } // 表单是否可以编辑
});

const emits = defineEmits(['update:flowInstance', 'refresh', 'onRemove']);

const flowActions = ref<any>([]);
const currentNodeInfo = ref<any>({});

const finished = computed(() => {
  return props.flowInstance.instanceState != 0;
});

const showMoreOptions = ref(false);
const moreOptions = ref<any>([]);
const onMoreOptionsSelect = (key: string | number) => {
  showMoreOptions.value = false;
  console.log(key);
};
// 更多选项图标
const moreIcon = (option: DropdownOption) => {
  if (option.key === 'assignable') {
    return <i class="x-iconfont x-icon-swap"></i>;
  }
  if (option.key === 'jumped') {
    return <i class="x-iconfont x-icon-backward"></i>;
  }
  if (option.key === 'addSigned') {
    return <i class="x-iconfont x-icon-user-add"></i>;
  }
  if (option.key === 'delSigned') {
    return <i class="x-iconfont x-icon-user-delete"></i>;
  }
  return '';
};
// 处理流程弹窗表单评论label
const handleModelCommentLabel = action => {
  switch (action) {
    case ACTION.APPROVED:
    case ACTION.REJECTED:
    case ACTION.ASSIGN:
    case ACTION.ADD_BEFORE_SIGN:
    case ACTION.ADD_AFTER_SIGN:
    case ACTION.ADD_SIGN:
    case ACTION.DEL_SIGN:
      return '审批意见';
    case ACTION.CANCELED:
      return '撤回理由';
    case ACTION.BACK:
      return '回退原因';
    case ACTION.COMMENT:
      return '评论';
    case ACTION.TRANSACT:
      return '办理意见';
  }
};
const formRef = ref();
const modalConfig = reactive({
  show: false,
  title: '',
  type: 0,
  formData: {
    instanceId: null, // 流程实例id
    taskId: '', // 任务id
    actionType: 0, // actionType
    assigneeId: null, // 指派人
    comment: null, // 备注
    attachments: [] // 附件
  }
});

const instanceForm = ref({
  formData: {},
  formItems: []
});

const rules = ref({
  comment: [
    {
      validator(rule: FormItemRule, value: string) {
        if (modalConfig.type === ACTION.COMMENT) {
          return Boolean(value);
        }
        return true;
      },
      message: () => `请输入${handleModelCommentLabel(modalConfig.type)}`,
      trigger: 'blur'
    }
  ]
});

const onHandleModelCancel = () => {
  modalConfig.show = false;
  modalConfig.title = '';
  modalConfig.formData = {
    instanceId: null, // 流程实例id
    taskId: '', // 任务id
    actionType: 0, // actionType
    assigneeId: null, // 指派人
    comment: null, // 备注
    attachments: [] // 附件
  };
};

const onHandleModelOK = () => {
  formRef.value?.validate(errors => {
    if (!errors) {
      let req: Promise<any> = Promise.reject('');
      const { actionType } = modalConfig.formData;
      switch (actionType) {
        case ACTION.CANCELED:
          req = revoke(modalConfig.formData);
          break;
        case ACTION.APPROVED:
          req = agree(modalConfig.formData);
          break;
        case ACTION.REJECTED:
          req = refuse(modalConfig.formData);
          break;
        case ACTION.COMMENT:
          req = comment(modalConfig.formData);
          break;
      }
      req.then(() => {
        if (modalConfig.formData.actionType == ACTION.CANCELED) {
          const data = { ...props.flowInstance };
          data.instanceState = 3;
          emits('update:flowInstance', data);
        }
        loadData();
        onHandleModelCancel();
        if (
          [
            ACTION.ASSIGN,
            ACTION.BACK,
            ACTION.ADD_BEFORE_SIGN,
            ACTION.ADD_AFTER_SIGN,
            ACTION.APPROVED,
            ACTION.REJECTED,
            ACTION.TRANSACT
          ].includes(actionType)
        ) {
          emits('update:flowInstance', {});
        }
        emits('refresh');
      });
    } else {
      console.log(errors);
    }
  });
};
const initModalFormData = action => {
  modalConfig.type = action;
  modalConfig.formData.instanceId = props.flowInstance.instanceId;
  modalConfig.formData.taskId = props.flowInstance.taskId;
  modalConfig.formData.actionType = action;
  modalConfig.formData.assigneeId = null;
  modalConfig.formData.comment = null;
  modalConfig.formData.attachments = [];
};

const loadData = () => {
  getProcessInstanceAction(props.flowInstance.instanceId).then(res => {
    console.log("getProcessInstanceAction.data:",res.data)
    flowActions.value = res.data;
  });
  getInstanceForm(props.flowInstance.instanceId).then(res => {
    instanceForm.value.formData = res.data.formData;
    instanceForm.value.formItems = JSON.parse(res.data.formItems);
  });
  console.log("props.flowInstance:",props.flowInstance)
  getNodeInfo(props.flowInstance.processId, props.flowInstance.currentNodeKey).then(res => {
    currentNodeInfo.value = res.data;
    moreOptions.value = [];
    // 允许转交
    if (res.data.allowTransfer) {
      moreOptions.value.push({
        label: '转交',
        key: 'assignable'
      });
    }
    // 允许回退
    if (res.data.allowRollback) {
      moreOptions.value.push({
        label: '回退',
        key: 'jumped'
      });
    }
    // 允许加签/减签
    if (res.data.allowAppendNode) {
      moreOptions.value.push({
        label: '加签',
        key: 'addSigned'
      });
      moreOptions.value.push({
        label: '减签',
        key: 'delSigned'
      });
    }
  });
};
watch(
  () => props.flowInstance,
  () => {
    if (props.flowInstance && props.flowInstance.instanceId && props.flowInstance.processId) {
      loadData();
    }
  },
  {
    deep: true
  }
);

const onComment = () => {
  initModalFormData(ACTION.COMMENT);
  modalConfig.title = '评论审批';
  modalConfig.show = true;
};

const onApproved = () => {
  initModalFormData(ACTION.APPROVED);
  modalConfig.title = '同意审批';
  modalConfig.show = true;
};

const onRejected = () => {
  initModalFormData(ACTION.REJECTED);
  modalConfig.title = '拒绝审批';
  modalConfig.show = true;
};

const onCanceled = () => {
  initModalFormData(ACTION.CANCELED);
  modalConfig.title = '撤销审批';
  modalConfig.show = true;
};

const showResubmitModal = ref(false);
const resubmitFormData = ref({});
const submitting = ref(false);

/**
 * 判断是否显示重新提交按钮
 */
const canResubmit = computed(() => {
  // 当前节点为发起人节点，当前用户为发起人，流程未结束
  return (
    !finished.value &&
    currentNodeInfo.value.type === 0 &&
    userAuth.userInfo.userId === props.flowInstance.startUser?.id
  );
});

const onResubmit = () => {
  // 复制当前表单数据
  resubmitFormData.value = JSON.parse(JSON.stringify(instanceForm.value.formData));
  showResubmitModal.value = true;
};

const onResubmitSubmit = () => {
  submitting.value = true;
  resubmit({
    instanceId: props.flowInstance.instanceId,
    formData: resubmitFormData.value
  })
    .then(() => {
      showResubmitModal.value = false;
      loadData();
      message.success('重新提交成功');
    })
    .finally(() => {
      submitting.value = false;
    });
};

const message = useMessage();
</script>

<template>
  <div class="flow-detail-container">
    <template v-if="!(flowInstance && flowInstance.instanceId)">
      <div class="flow-empty-detail-box">
        <n-empty />
      </div>
    </template>
    <template v-else>
      <div class="flow-status-stamp">
        <FlowStatusStamp :status="flowInstance.instanceState" :size="120" />
      </div>
      <!-- 基本信息 -->
      <div class="flow-header-box">
        <div class="flow-no">编号：{{ flowInstance.instanceId }}</div>
        <div class="action-area">
          <!--          <div class="action-item" @click="onPrintClicked()"><icon-printer :size="16" /></div>-->
          <!--          <FlowPrint-->
          <!--            v-model:visible="showPrintModal"-->
          <!--            :flow-inst="flowInst"-->
          <!--            :form-value="formValue"-->
          <!--            :flow-nodes="flowNodes"-->
          <!--            :form-widgets="formWidgets" />-->
        </div>
      </div>
      <!-- 流程详情 -->
      <div class="flow-detail-box">
        <div class="header-box">
          <div class="summary-info">
            <div class="title">{{ flowInstance.processName }}</div>
            <div class="status">
              <n-tag
                v-if="flowInstance.instanceState == STATUS_LIST[0].value"
                type="info"
                size="small"
                :bordered="false"
              >
                {{ STATUS_LIST[0].name }}
              </n-tag>
              <n-tag
                v-else-if="flowInstance.instanceState == STATUS_LIST[1].value"
                type="success"
                size="small"
                :bordered="false"
              >
                {{ STATUS_LIST[1].name }}
              </n-tag>
              <n-tag
                v-else-if="flowInstance.instanceState == STATUS_LIST[2].value"
                type="error"
                size="small"
                :bordered="false"
              >
                {{ STATUS_LIST[2].name }}
              </n-tag>
              <n-tag
                v-else-if="flowInstance.instanceState == STATUS_LIST[3].value"
                type="warning"
                size="small"
                :bordered="false"
              >
                {{ STATUS_LIST[3].name }}
              </n-tag>
              <n-tag
                v-else-if="flowInstance.instanceState == STATUS_LIST[4].value"
                type="warning"
                size="small"
                :bordered="false"
              >
                {{ STATUS_LIST[4].name }}
              </n-tag>
              <n-tag
                v-else-if="flowInstance.instanceState == STATUS_LIST[5].value"
                type="error"
                size="small"
                :bordered="false"
              >
                {{ STATUS_LIST[5].name }}
              </n-tag>
            </div>
          </div>
          <div class="initiator-info">
            <FlowNodeAvatar :size="24" :user-id="flowInstance.startUser.id" :set-type="flowInstance.setType || 1" />
            <div class="start-time">{{ moment(flowInstance.startTime).format('yyyy-MM-DD HH:mm:ss') }} 提交</div>
          </div>
        </div>
        <n-divider />

        <!-- 表单数据 -->
        <FlowFromDetail :form-data="instanceForm.formData" :form-items="instanceForm.formItems" />

        <n-divider />

        <!-- 审批流程时间线 -->
        <div class="flow-box">
          <n-timeline item-placement="left">
            <n-timeline-item v-for="action in flowActions" :key="action.id">
              <template #icon>
                <div class="assignee-container">
                  <div v-if="action.underway">
                    <n-avatar v-if="action.type == 1" size="medium" color="#1989fa" round>
                      <i class="x-iconfont x-icon-stamp" style="font-size: 20px"></i>
                    </n-avatar>
                    <n-avatar v-else size="medium" color="#926bd5" round>
                      <i class="x-iconfont x-icon-edit" style="font-size: 20px"></i>
                    </n-avatar>
                    <div class="badge x-iconfont x-icon-underway" style="color: #2a5eff"></div>
                  </div>
                  <div v-else-if="[ACTION.COPY].includes(action.actionType)">
                    <n-avatar size="medium" color="#1989fa" round>
                      <i class="x-iconfont x-icon-promotion" style="font-size: 20px"></i>
                    </n-avatar>
                    <div class="badge x-iconfont x-icon-success" style="color: #52c41a"></div>
                  </div>
                  <div v-else-if="[ACTION.APPROVED].includes(action.actionType)">
                    <FlowNodeAvatar :size="36" :user-id="action.auditorId" :show-name="false" :set-type="action.setType || 1" />
                    <div class="badge x-iconfont x-icon-success" style="color: #52c41a"></div>
                  </div>
                  <div v-else-if="[ACTION.REJECTED].includes(action.actionType)">
                    <FlowNodeAvatar :size="36" :user-id="action.auditorId" :show-name="false" :set-type="action.setType || 1" />
                    <div class="badge x-iconfont x-icon-error" style="color: #f56c6c"></div>
                  </div>
                  <div v-else-if="[ACTION.AUTO_APPROVED].includes(action.actionType)">
                    <n-avatar size="medium" color="#1989fa" round>
                      <i class="x-iconfont x-icon-robot" style="font-size: 20px"></i>
                    </n-avatar>
                    <div class="badge x-iconfont x-icon-success" style="color: #52c41a"></div>
                  </div>
                  <div v-else-if="[ACTION.AUTO_REJECTED].includes(action.actionType)">
                    <n-avatar size="medium" color="#1989fa" round>
                      <i class="x-iconfont x-icon-robot" style="font-size: 20px"></i>
                    </n-avatar>
                    <div class="badge x-iconfont x-icon-error" style="color: #f56c6c"></div>
                  </div>
                  <div v-else>
                    <FlowNodeAvatar :size="36" :user-id="action.auditorId" :show-name="false" :set-type="action.setType || 1" />
                    <div class="badge x-iconfont x-icon-success" style="color: #52c41a"></div>
                  </div>
                </div>
              </template>
              <template #footer>{{ action.createTime }}</template>
              <div class="audit-record">
                <div class="avatar sgement">
                  <div class="node-name">
                    <template v-if="action.actionType == ACTION.START">提交</template>
                    <template
                      v-else-if="
                        [ACTION.APPROVED, ACTION.REJECTED, ACTION.AUTO_APPROVED, ACTION.AUTO_REJECTED].includes(
                          action.actionType
                        )
                      "
                    >
                      审批
                    </template>
                    <template v-else-if="action.actionType == ACTION.CANCELED">撤销</template>
                    <template v-else-if="action.actionType == ACTION.ASSIGN">转交</template>
                    <template v-else-if="action.actionType == ACTION.BACK">回退</template>
                    <template v-else-if="action.actionType == ACTION.ADD_BEFORE_SIGN">前加签</template>
                    <template v-else-if="action.actionType == ACTION.ADD_AFTER_SIGN">后加签</template>
                    <template v-else-if="action.actionType == ACTION.ADD_SIGN">并加签</template>
                    <template v-else-if="action.actionType == ACTION.DEL_SIGN">减签</template>
                    <template v-else-if="action.actionType == ACTION.COPY">抄送</template>
                    <template v-else-if="action.actionType == ACTION.COMMENT">评论</template>
                    <template v-else-if="action.actionType == ACTION.TRANSACT">办理</template>
                    <template v-else-if="action.underway">
                      <div class="in-approval">
                        <template v-if="action.type == 1">审批中...</template>
                        <template v-else>办理中...</template>
                      </div>
                    </template>
                  </div>
                  <!-- 审批人姓名 -->
                  <div class="auditor-name">
                    <template v-if="action.underway">
                      <div class="node-sign-type">
                        <template v-if="action.examineMode == 3 || action.nodeAssigneeList.length == 1">
                          <span>只需一人审批同意</span>
                        </template>
                        <template v-else-if="action.examineMode == 2 || action.examineMode == 1">
                          <span>需所有人审批同意</span>
                        </template>
                        <template v-else-if="action.examineMode == 4">
                          <span>需总权重大于50%</span>
                        </template>
                      </div>
                      <div class="node-assignee">
                        <FlowNodeAvatar
                          v-for="userId in action.userIds"
                          :size="20"
                          :user-id="userId"
                          :set-type="action.setType || 1"
                          class="assignee-item"
                        />
                      </div>
                    </template>
                    <template v-else>
                      <template v-if="action.actionType == ACTION.COPY">
                        <!-- <div class="node-sign-assignee">抄送{{ node.userIds.length }}人</div> -->
                        <div v-if="action.actionType == ACTION.COPY" class="node-assignee">
                          <FlowNodeAvatar
                            v-for="userId in action.userIds"
                            :size="20"
                            :user-id="userId"
                            :set-type="action.setType || 1"
                            class="assignee-item"
                          />
                        </div>
                      </template>
                      <template v-else>
                        <div class="assignee-name">
                          <FlowUserName :user-id="action.auditorId" />
                        </div>
                        <div class="node-sign-assignee">
                          <template
                            v-if="
                              [ACTION.ADD_BEFORE_SIGN, ACTION.ADD_AFTER_SIGN, ACTION.ADD_SIGN].includes(
                                action.actionType
                              )
                            "
                          >
                            加签
                            <div class="node-sign-assignee-name">
                              <FlowUserName :user-id="action.assigneeId" />
                            </div>
                          </template>
                          <template v-else-if="[ACTION.DEL_SIGN].includes(action.actionType)">
                            减签
                            <div class="node-sign-assignee-name">
                              <FlowUserName :user-id="action.assigneeId" />
                            </div>
                          </template>
                          <template v-else-if="[ACTION.ASSIGN].includes(action.actionType)">
                            转交给
                            <div class="node-sign-assignee-name">
                              <FlowUserName :user-id="action.assigneeId" />
                            </div>
                          </template>
                        </div>
                      </template>
                    </template>
                  </div>
                  <div v-if="action.comment" class="comment">
                    <!-- <div class="commnet-title">审批意见</div> -->
                    <div class="comment-content">
                      {{ action.comment }}
                    </div>
                    <div class="comment-attachment">
                      <div
                        v-for="attachment in action.attachments"
                        :key="attachment.id"
                        class="comment-attachment-item"
                      >
                        <div class="name">
                          <i class="x-iconfont x-icon-file" style="font-size: 16px"></i>
                          {{ attachment ? attachment.originalFilename : '' }}
                        </div>
                        <div class="download-icon">
                          <div class="link" @click.prevent.stop="onAttachmentDownload(attachment, $event)">
                            <i class="x-iconfont x-icon-download" style="font-size: 16px"></i>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <!-- 审批结果 -->
                <!--                <div class="tag sgement">-->
                <!--                  <template v-if="action.underway"></template>-->
                <!--                  <template v-else-if="action.actionType == ACTION.START"></template>-->
                <!--                  <template v-else-if="action.actionType == ACTION.APPROVED">-->
                <!--                    <n-tag type="success" size="small" :bordered="false">通过</n-tag>-->
                <!--                  </template>-->
                <!--                  <template v-else-if="action.actionType == ACTION.REJECTED">-->
                <!--                    <n-tag type="error" size="small" :bordered="false">拒绝</n-tag>-->
                <!--                  </template>-->
                <!--                  <template v-else-if="action.actionType == ACTION.CANCELED">-->
                <!--                    <n-tag type="warning" size="small" :bordered="false">撤销</n-tag>-->
                <!--                  </template>-->
                <!--                  <template v-else-if="action.actionType == ACTION.COPY">-->
                <!--                    <n-tag type="info" size="small" :bordered="false">抄送</n-tag>-->
                <!--                  </template>-->
                <!--                  <template v-else>-->
                <!--                    <n-tag type="primary" size="small" :bordered="false">完成</n-tag>-->
                <!--                  </template>-->
                <!--                </div>-->
              </div>
            </n-timeline-item>
          </n-timeline>
        </div>
      </div>
      <!-- 底部操作栏 -->
      <div class="flow-actions">
        <template v-if="commentable">
          <n-button secondary size="small" @click="onComment()">
            <template #icon><i class="x-iconfont x-icon-message text-gray-600"></i></template>
            <span class="text-gray-600">评论</span>
          </n-button>
        </template>

        <template v-if="!finished && actionable">
          <template v-if="currentNodeInfo.type == 1">
            <n-button type="primary" size="small" @click="onApproved()">
              <template #icon><i class="x-iconfont x-icon-check"></i></template>
              同意
            </n-button>
            <n-button type="error" size="small" @click="onRejected()">
              <template #icon><i class="x-iconfont x-icon-close"></i></template>
              拒绝
            </n-button>
          </template>
        </template>

        <template v-if="!finished && cancelable">
          <n-button secondary size="small" @click="onCanceled()">
            <template #icon><i class="x-iconfont x-icon-undo text-gray-600"></i></template>
            <span class="text-gray-600">撤销</span>
          </n-button>
        </template>

        <template v-if="canResubmit">
          <n-button type="primary" size="small" @click="onResubmit">
            <template #icon><i class="x-iconfont x-icon-refresh"></i></template>
            重新提交
          </n-button>
        </template>

        <n-dropdown
          v-if="moreOptions.length > 0 && !finished && actionable"
          :show="showMoreOptions"
          :options="moreOptions"
          :render-icon="moreIcon"
          @select="onMoreOptionsSelect"
        >
          <n-button secondary size="small" @click="() => (showMoreOptions = !showMoreOptions)">
            <template #icon>
              <i
                class="x-iconfont text-gray-600"
                :class="showMoreOptions ? 'x-icon-arrow-up' : 'x-icon-arrow-down'"
              ></i>
            </template>
            <span class="text-gray-600">更多</span>
          </n-button>
        </n-dropdown>
      </div>

      <n-modal v-model:show="modalConfig.show">
        <n-card
          style="width: 600px"
          header-style="padding: 10px;text-align: center;font-size: 16px"
          content-style="padding: 10px 25px"
          footer-style="padding: 10px;"
          :title="modalConfig.title"
          :bordered="false"
          size="huge"
          role="dialog"
          aria-modal="true"
          :segmented="{
            content: true,
            footer: true
          }"
        >
          <template #header-extra>
            <i class="x-iconfont x-icon-close cursor-pointer" @click="onHandleModelCancel"></i>
          </template>

          <n-form ref="formRef" :model="modalConfig.formData" :rules="rules">
            <n-form-item
              path="comment"
              :label="handleModelCommentLabel(modalConfig.type)"
              :required="modalConfig.type === ACTION.COMMENT"
            >
              <n-input
                v-model:value="modalConfig.formData.comment"
                type="textarea"
                maxlength="64"
                show-count
                clearable
                :autosize="{ minRows: 2, maxRows: 4 }"
                :placeholder="`请输入${handleModelCommentLabel(modalConfig.type)}`"
              />
            </n-form-item>

            <n-form-item path="attachments" label="附件">
              <n-upload
                :action="fileUploadUrl"
                :headers="headers"
                :max="3"
                multiple
                :data="{}"
                @finish="uploadFinishHandle"
              >
                <n-button secondary>
                  <template #icon><i class="x-iconfont x-icon-attachment"></i></template>
                  上传
                </n-button>
              </n-upload>
            </n-form-item>
          </n-form>
          <template #footer>
            <div class="flex justify-end space-x-3">
              <n-button size="small" secondary @click="onHandleModelCancel">取消</n-button>
              <n-button type="primary" size="small" @click="onHandleModelOK">提交</n-button>
            </div>
          </template>
        </n-card>
      </n-modal>

      <!-- 重新提交弹窗 -->
      <n-modal v-model:show="showResubmitModal">
        <n-card
          style="width: 600px"
          header-style="padding: 10px;text-align: center;font-size: 16px"
          content-style="padding: 10px 25px"
          footer-style="padding: 10px;"
          title="重新提交"
          :bordered="false"
          size="huge"
          role="dialog"
          aria-modal="true"
          :segmented="{ content: true, footer: true }"
        >
          <template #header-extra>
            <i class="x-iconfont x-icon-close cursor-pointer" @click="() => (showResubmitModal = false)"></i>
          </template>
          <FlowFromDetail :form-data="resubmitFormData" :form-items="instanceForm.formItems" :editable="true" @update:formData="val => resubmitFormData = val" />
          <template #footer>
            <div class="flex justify-end space-x-3">
              <n-button size="small" secondary @click="() => (showResubmitModal = false)">取消</n-button>
              <n-button type="primary" size="small" :loading="submitting" @click="onResubmitSubmit">提交</n-button>
            </div>
          </template>
        </n-card>
      </n-modal>
    </template>
  </div>
</template>

<style lang="less" scoped>
@import '../variables.module.less';

@bottomActionHeight: 52px;
@DetailHeaderHeight: 40px;
@FormLabelWidth: 84px;

.flow-detail-container {
  height: 100%;
  overflow: hidden;
  position: relative;
}

.flow-empty-detail-box {
  margin-top: 20%;
}

.flow-status-stamp {
  position: absolute;
  right: 30px;
  top: 30px;
}

.area-divider {
  border-bottom: 1px solid var(--color-neutral-3);
  margin: 20px 0;
  position: relative;
}

.action-form-edit-btn {
  user-select: none;
  position: absolute;
  right: 0;
  top: 0;
  border: 1px solid var(--color-neutral-3);
  border-top: 0;
  border-radius: 0 0 4px 4px;
  cursor: pointer;
  padding: 4px;
  font-size: 12px;
  color: #86909c;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 2px;

  &:hover {
    background-color: #f2f3f5;
  }
}

.flow-header-box {
  font-weight: 400;
  font-size: 13px;
  border-bottom: 1px solid #e5e6ec;
  padding: 0 @GapLarge;
  height: calc(@DetailHeaderHeight - 1px);
  display: flex;
  align-items: center;
  justify-content: space-between;
  color: #86909c;

  .action-area {
    display: flex;
    gap: 4px;

    .action-item {
      cursor: pointer;
      padding: 4px;
      border-radius: @BorderRadius;
      width: fit-content;
      height: fit-content;

      &:hover {
        background-color: #f2f3f5;
      }
    }
  }
}

.flow-detail-box {
  height: calc(100% - @bottomActionHeight - @DetailHeaderHeight);
  overflow: hidden;
  overflow-y: auto;
  padding: 0 calc(@GapLarge + 10px);

  .header-box {
    display: flex;
    flex-direction: column;
    justify-content: center;
    padding-top: 20px;

    .summary-info {
      display: flex;
      align-items: center;

      .title {
        font-size: 24px;
        font-family:
          PingFangSC-Semibold,
          PingFang SC;
        color: #1d2129;
      }

      .status {
        margin-left: 20px;
      }
    }

    .initiator-info {
      display: flex;
      align-items: center;
      margin-top: 16px;

      .start-time {
        margin-left: 20px;
        font-weight: 350;
        color: #86909c;
        font-size: 13px;
        user-select: none;
      }
    }
  }

  // 流程时间线相关样式
  .flow-box {
    user-select: none;

    .n-timeline-item-timeline__line {
      height: 80px;
    }
    // 流程头像
    .assignee-container {
      position: relative;

      .badge {
        @BadgeSize: 14px;
        @BadgeOffset: -2px;
        position: absolute;
        width: @BadgeSize;
        height: @BadgeSize;
        display: flex;
        align-items: center;
        justify-content: center;
        bottom: @BadgeOffset;
        right: @BadgeOffset;
        z-index: 999;
        border: 2px solid #fff;
        background-color: #fff;
        border-radius: 50%;
        overflow: hidden;
      }
    }

    .audit-record {
      display: flex;
      flex-direction: row;
      justify-content: space-between;

      .sgement {
        margin-left: 8px;
        flex: 1;
      }

      .node-name {
        font-weight: 400;
        color: #86909c;

        .in-approval {
          color: #2a5eff;
        }
      }

      .auditor-name {
        font-size: 14px;

        .node-sign-type,
        .node-sign-assignee {
          font-weight: 400;
          color: #86909c;
          font-size: 12px;

          .node-sign-assignee-name {
            color: #2a5eff;
            display: inline-block;
          }
        }

        .node-assignee {
          margin-top: 4px;
          display: flex;
          flex-flow: row wrap;
          gap: 6px;
        }

        .assignee-name {
          color: #1d2129;
        }
      }

      .comment {
        user-select: none;
        margin: 4px 0 16px;
        padding: 8px 16px;
        border-radius: 4px;
        // background: #f2f4f5;
        background-color: #f8f8fa;

        .commnet-title {
          font-weight: 400;
          color: #a6aab1;
          font-size: 13px;
        }

        .comment-content {
          font-weight: 500;
          color: #1d2129;
        }

        .comment-attachment {
          gap: 10px;
          margin: 4px 0;
          display: flex;
          flex-wrap: wrap;

          .comment-attachment-item {
            border-radius: 4px;
            border: 1px solid #e1e1e1;
            padding: 4px 8px;
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 10px;

            .name {
              display: flex;
              align-items: center;
              gap: 4px;
            }

            .download-icon {
              display: flex;
              align-items: center;
              cursor: pointer;
              color: #165cfd;

              &:hover {
                opacity: 0.7;
              }
            }
          }
        }
      }

      .tag {
        text-align: right;
      }
    }
  }
}

.flow-actions {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  height: @bottomActionHeight;
  border-top: 1px solid var(--color-neutral-3);
  padding: 0 @GapLarge;

  button {
    + button {
      margin-left: 10px;
    }
  }
}

// 流程时间线相关样式
.flow-box {
  user-select: none;

  // 流程头像
  .assignee-container {
    position: relative;

    .badge {
      @BadgeSize: 18px;
      @BadgeOffset: -4px;
      position: absolute;
      width: @BadgeSize;
      height: @BadgeSize;
      display: flex;
      align-items: center;
      justify-content: center;
      bottom: @BadgeOffset;
      right: @BadgeOffset;
      z-index: 999;
      border: 2px solid #fff;
      background-color: #fff;
      border-radius: 50%;
      overflow: hidden;
    }
  }
}

.flow-actions {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  height: @bottomActionHeight;
  border-top: 1px solid rgb(229, 230, 235);
  padding: 0 @GapLarge;

  button {
    + button {
      margin-left: 10px;
    }
  }
}
</style>
