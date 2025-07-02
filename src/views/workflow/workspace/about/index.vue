<script setup lang="tsx">
import { onMounted, ref } from 'vue';
import { ccList } from '@/service/api/workflow/workspace';
import { STATUS_LIST } from '@/views/workflow/common/flowConstant';
import { getGroupOptions } from '@/service/api/workflow/designer';
import FlowDetail from '@/views/workflow/workspace/component/flowDetail.vue';
import FlowCard from '../component/flowCard.vue';

const groupOptions = ref();

const query = ref({
  processName: '',
  instanceState: null,
  groupId: null,
  pageNum: 1,
  pageSize: 10
});
const flowInstances = ref([]);
const selectedFlow = ref({});
const haveMore = ref(true); // 无限加载, 是否存在更多的数据

const statusOptions = STATUS_LIST.map(item => {
  return {
    label: item.name,
    value: item.value
  };
});

const onSearchReset = () => {
  query.value.pageNum = 1;
  query.value.pageSize = 10;
  query.value.processName = '';
  query.value.instanceState = null;
  query.value.groupId = null;
  haveMore.value = true;
  loadData();
};

const onFlowInstClicked = instance => {
  selectedFlow.value = instance;
};
const loadFlowInsts = () => {
  query.value.pageNum++;
  loadData();
};

const onSearch = () => {
  query.value.pageNum = 1;
  loadData();
};
const loading = ref(false);
const loadData = () => {
  haveMore.value = true;
  loading.value = true;
  ccList(query.value).then(res => {
    if (res.data.pageNum == 1) {
      flowInstances.value = res.data.list;
    } else {
      flowInstances.value.push(...((res.data.list as []) || []));
    }
    if (flowInstances.value.length >= res.data.total) {
      haveMore.value = false;
    }
    loading.value = false;
  });
  getGroupOptions().then(res => {
    groupOptions.value = res.data;
  });
};
onMounted(() => {
  loadData();
});

const refresh = () => {
  loadData();
};
</script>

<template>
  <section class="flow-approve-box">
    <section class="flow-approve-box">
      <!-- 检索条件 -->
      <div class="flow-content">
        <div class="search-box">
          <div class="search-segment" style="flex: 1">
            <n-input
              v-model:value="query.processName"
              placeholder="流程名称"
              clearable
              :maxlength="16"
              size="small"
              @keydown.enter="onSearch"
            >
              <template #suffix>
                <i class="x-iconfont x-icon-search cursor-pointer" @click="onSearch"></i>
              </template>
            </n-input>
          </div>
          <div class="search-segment">
            <n-tooltip trigger="hover">
              <template #trigger>
                <n-button size="small" @click="onSearchReset()">
                  <template #icon>
                    <i class="x-iconfont x-icon-refresh-right"></i>
                  </template>
                </n-button>
              </template>
              重置
            </n-tooltip>
          </div>
          <div class="search-segment">
            <n-popover
              placement="right-start"
              trigger="click"
              class="flow-search-more-popover"
              animated
              style="padding: 0"
            >
              <template #trigger>
                <n-button size="small">
                  <i class="x-iconfont x-icon-filter"></i>
                </n-button>
              </template>
              <template #header></template>
              <div>
                <div class="search-more-title">高级筛选</div>
                <div class="search-more-box">
                  <n-select
                    v-model:value="query.groupId"
                    class="column"
                    clearable
                    placeholder="流程分组"
                    :options="groupOptions"
                    size="small"
                  />
                  <n-select
                    v-model:value="query.instanceState"
                    class="column"
                    clearable
                    placeholder="流程状态"
                    :options="statusOptions"
                    size="small"
                  />
                </div>
                <div class="search-more-action">
                  <n-button size="small" @click="onSearchReset()">重置</n-button>
                  <n-button type="primary" size="small" @click="onSearch()">检索</n-button>
                </div>
              </div>
            </n-popover>
          </div>
        </div>

        <!-- 流程列表 -->
        <div class="flow-list-box">
          <div v-if="flowInstances.length == 0" class="empty-box">
            <n-empty />
          </div>
          <n-infinite-scroll v-else style="height: 100%" :distance="10" @load="loadFlowInsts">
            <div
              v-for="(instance, index) in flowInstances"
              :key="index"
              class="item-box"
              :class="[
                selectedFlow.instanceId == instance.instanceId ? 'item-box-choosed' : '',
                index == flowInstances.length - 1 ? 'mb-0' : ''
              ]"
              @click="onFlowInstClicked(instance)"
            >
              <FlowCard :flow-instance="instance" />
            </div>
            <div v-if="loading" class="text-center">加载中...</div>
            <div v-if="!haveMore" class="text-center">没有更多了</div>
          </n-infinite-scroll>
        </div>
      </div>
      <!-- 流程详情 -->
      <div class="flow-detail-content">
        <FlowDetail v-model:flow-instance="selectedFlow" :cancelable="true" :actionable="false" @refresh="refresh" />
      </div>
    </section>
  </section>
</template>

<style scoped lang="less">
@import '../base.less';
</style>
