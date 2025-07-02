<script setup lang="ts">
import { reactive, ref } from 'vue';
import { EditOutlined, MinusOutlined, PlusOutlined } from '@vicons/antd';
import { useWorkflowStore } from '@/store/modules/workflow';
import NodeConfig from '@/views/workflow/designer/common/process/config/NodeConfig.vue';
import ProcessTree from '@/views/workflow/designer/components/process/ProcessTree.vue';
const workflowStore = useWorkflowStore();

const data = reactive({
  scale: 100,
  selected: {},
  inputShow: false,
  configShow: false
});

const nodeSelected = node => {
  console.log('配置节点', node);
  data.configShow = true;
};

const processTreeRef = ref();
const validate = () => {
  return processTreeRef.value.validateProcess();
};

defineExpose({
  validate
});
</script>

<template>
  <div class="process-design">
    <div class="scale">
      <n-button circle size="small" :disabled="data.scale >= 150" @click="data.scale += 10">
        <template #icon>
          <n-icon>
            <PlusOutlined />
          </n-icon>
        </template>
      </n-button>
      <span>{{ data.scale }}%</span>
      <n-button circle size="small" :disabled="data.scale <= 30" @click="data.scale -= 10">
        <template #icon>
          <n-icon>
            <MinusOutlined />
          </n-icon>
        </template>
      </n-button>
    </div>
    <div class="design">
      <ProcessTree
        ref="processTreeRef"
        :style="'transform: scale(' + data.scale / 100 + ');'"
        @selected-node="nodeSelected"
      />
    </div>
    <n-drawer v-model:show="data.configShow" width="500px">
      <n-drawer-content :title="workflowStore.selectedNode.nodeName" closable>
        <template #header>
          <div v-show="data.inputShow">
            <n-input
              v-model:value="workflowStore.selectedNode.nodeName"
              style="width: 300px"
              size="medium"
              @blur="data.inputShow = false"
            />
          </div>
          <div v-show="!data.inputShow" @click="data.inputShow = true">
            <n-icon style="margin-right: 10px">
              <EditOutlined />
            </n-icon>
            {{ workflowStore.selectedNode.nodeName }}
          </div>
        </template>
        <div class="node_config_content">
          <NodeConfig />
        </div>
      </n-drawer-content>
    </n-drawer>
  </div>
</template>

<style scoped lang="less">
.process-design {
  width: 100%;
  height: calc(100vh - 220px);
  .design {
    box-sizing: content-box;
    height: calc(100vh - 320px);
    padding-top: 100px;
    overflow: hidden;
    overflow-y: auto;
    background-color: #f5f6f6;
  }

  .scale {
    z-index: 999;
    position: fixed;
    top: 205px;
    right: 85px;

    span {
      margin: 0 10px;
      font-size: 15px;
      color: #7a7a7a;
      width: 50px;
      vertical-align: top;
    }
  }
}
</style>
