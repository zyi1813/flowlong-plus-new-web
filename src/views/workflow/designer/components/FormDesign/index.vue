<script setup lang="ts">
import { computed, ref } from 'vue';
import Draggable from 'vuedraggable';
import { useDialog, useMessage } from 'naive-ui';
import FormDesignRender from '@/views/workflow/designer/common/form/FormDesignRender.vue';
import { baseComponents } from '@/views/workflow/designer/common/form/ComponentsConfigExport';
import { useWorkflowStore } from '@/store/modules/workflow';
import FormComponentConfig from '@/views/workflow/designer/common/form/FormComponentConfig.vue';
import FormRender from '@/views/workflow/designer/common/form/FormRender.vue';
const message = useMessage();
const dialog = useDialog();

const workflowStore = useWorkflowStore();
const isStart = ref<boolean>(false);

const showMobile = ref<boolean>(false);
const viewFormVisible = ref<boolean>(false);
const drag = ref<boolean>(false);
const formData = ref({});
const selectFormItem = computed({
  get() {
    return workflowStore.selectFormItem;
  },
  set(val) {
    workflowStore.selectFormItem = val;
  }
});
const forms = computed(() => {
  return workflowStore.design.formItems;
});

const nodeMap = workflowStore.nodeMap;

const selectItem = (cp: any) => {
  selectFormItem.value = cp;
};
const getId = () => {
  return `field${(
    Math.floor(Math.random() * (99999 - 10000)) + 10000
  ).toString()}${new Date().getTime().toString().substring(5)}`;
};
const getSelectedClass = cp => {
  return selectFormItem.value && selectFormItem.value.id === cp.id ? 'border-left: 4px solid #409eff' : '';
};
const clone = (obj: any) => {
  obj.id = getId();
  return JSON.parse(JSON.stringify(obj));
};

const viewForms = () => {
  viewFormVisible.value = true;
};
const del = index => {
  dialog.warning({
    title: '警告',
    content: '删除组件将会连带删除包含该组件的条件以及相关设置，是否继续?',
    positiveText: '确定',
    negativeText: '取消',
    onPositiveClick: () => {
      removeCondition(forms.value[index]);
      forms.value.splice(index, 1);
      message.success('成功');
    },
    onNegativeClick: () => {}
  });
};
// 移除关联的分支条件
const removeCondition = (formItem: any) => {
  if (formItem.name === 'SpanLayout') {
    // 删除的是分栏则遍历删除分栏内所有子组件
    formItem.props.items.forEach(item => {
      // 递归调用
      removeCondition(item);
    });
    formItem.props.items.length = 0;
  } else {
    // 搜索条件分支
    nodeMap.forEach(node => {
      if (node.type == 4) {
        node.conditionNodes.forEach(conditionNode => {
          conditionNode.conditionList.forEach(conditionGroup => {
            const idx = conditionGroup.findIndex(condition => condition.field === formItem.id);
            if (idx != -1) {
              // 删除子条件
              conditionGroup.splice(idx, 1);
            }
          });
        });
      }
    });
  }
};

const validateItem = (err: string[], idSet: Set<string>, item) => {
  if (idSet.has(item.id) && item.name !== 'SpanLayout') {
    err.push(`表单 ${item.id} 标识重复`);
  }
  idSet.add(item.id);
  if (item.name === 'SelectInput' || item.name === 'MultipleSelect') {
    if (item.props.options.length === 0) {
      err.push(`${item.title} 未设置选项`);
    }
  } else if (item.name === 'TableList') {
    if (item.props.columns.length === 0) {
      err.push(`明细表 ${item.title} 内未添加组件`);
    }
  } else if (item.name === 'SpanLayout') {
    if (item.props.items.length === 0) {
      err.push('分栏内未添加组件');
    } else {
      item.props.items.forEach((sub: any) => validateItem(err, idSet, sub));
    }
  }
};
const validate = () => {
  const err: string[] = [];
  if (forms.value.length > 0) {
    const idSet: Set<string> = new Set();
    forms.value.forEach(item => {
      // 主要校验表格及分栏/选择器/表单名称/是否设置
      validateItem(err, idSet, item);
    });
  } else {
    err.push('表单为空，请添加组件');
  }
  return err;
};

defineExpose({
  validate
});
</script>

<template>
  <div class="form-design flex">
    <div class="w-[300px] form-design-component-list">
      <div class="components-nav">
        <span>组件库</span>
      </div>
      <div>
        <div v-for="(group, i) in baseComponents" :key="i" class="components">
          <p class="my-1">{{ group.name }}</p>
          <ul>
            <Draggable
              class="drag"
              :list="group.components"
              :options="{ sort: false }"
              item-key="name"
              :group="{ name: 'form', pull: 'clone', put: false }"
              :clone="clone"
              @start="isStart = true"
              @end="isStart = false"
            >
              <template #item="{ element }">
                <li>
                  <i :class="element.icon" class="x-iconfont"></i>
                  <span>{{ element.title }}</span>
                </li>
              </template>
            </Draggable>
          </ul>
        </div>
      </div>
    </div>
    <div style="flex: 1" class="form-design-component-render">
      <div class="tool-nav">
        <div>
          <n-tooltip class="item" placement="bottom-start">
            <template #trigger>
              <i class="x-icon-refresh-left x-iconfont"></i>
            </template>
            撤销
          </n-tooltip>
          <n-tooltip class="item" placement="bottom-start">
            <template #trigger>
              <i class="x-icon-refresh-right x-iconfont"></i>
            </template>
            恢复
          </n-tooltip>
        </div>
        <div>
          <n-tooltip class="item" placement="bottom-start">
            <template #trigger>
              <i class="x-icon-view x-iconfont" @click="viewForms"></i>
            </template>
            预览表单
          </n-tooltip>
          <n-tooltip class="item" placement="bottom-start">
            <template #trigger>
              <i :class="{ select: showMobile }" class="x-iconfont x-icon-mobile" @click="showMobile = true"></i>
            </template>
            移动端
          </n-tooltip>
          <n-tooltip class="item" placement="bottom-start">
            <template #trigger>
              <i :class="{ select: !showMobile }" class="x-iconfont x-icon-monitor" @click="showMobile = false"></i>
            </template>
            PC端
          </n-tooltip>
        </div>
      </div>
      <div class="work-form">
        <div :class="{ mobile: showMobile, pc: !showMobile }">
          <div :class="{ bd: showMobile }">
            <div :class="{ 'form-content': showMobile }">
              <div class="form">
                <div v-show="forms.length === 0 && !isStart" class="tip">请在左侧选择控件并拖至此处</div>
                <Draggable
                  class="drag-from"
                  :list="forms"
                  item-key="id"
                  group="form"
                  :options="{ animation: 300, chosenClass: 'choose', sort: true }"
                  @start="
                    drag = true;
                    selectFormItem = null;
                  "
                  @end="drag = false"
                >
                  <template #item="{ element, index }">
                    <div class="form-item" :style="getSelectedClass(element)" @click="selectItem(element)">
                      <div class="form-header">
                        <p>
                          <span v-if="element.props.required">*</span>
                          {{ element.title }}
                        </p>
                        <div class="option">
                          <!--<i class="x-icon-copy-document" @click="copy"></i>-->
                          <i class="x-icon-close x-iconfont" @click="del(index)"></i>
                        </div>
                        <FormDesignRender :config="element" />
                      </div>
                    </div>
                  </template>
                </Draggable>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="w-[300px] form-design-component-config">
      <div v-if="selectFormItem" class="tool-nav-r">
        <i :class="selectFormItem.icon" class="x-iconfont" style="margin-right: 5px; font-size: medium"></i>
        <span>{{ selectFormItem.title }}</span>
      </div>
      <div v-if="!selectFormItem || forms.length === 0" class="tip">选中控件后在这里进行编辑</div>
      <div v-else style="text-align: left; padding: 10px">
        <FormComponentConfig />
      </div>
      <n-modal
        v-model:show="viewFormVisible"
        style="width: 45%; top: 25%; left: 0; right: 0; position: absolute"
        preset="card"
        title="表单预览"
        size="huge"
        :bordered="false"
      >
        <FormRender ref="form" v-model:value="formData" :forms="forms" />
      </n-modal>
    </div>
  </div>
</template>

<style scoped lang="less">
.form-design {
  width: 100%;
  height: calc(100vh - 220px);
  background-color: #f5f6f6;
}

.form-design-component-list {
  .components-nav {
    display: flex;
    align-items: center;
    margin: 12px 12px 0;
    height: 28px;
    box-shadow: 0 2px 4px 0 rgba(17, 31, 44, 0.04);
    border: 1px solid #ecedef;
    border-radius: 16px;
    background-color: #fff;
    span {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      height: 100%;
      font-size: 12px;
      color: rgba(17, 31, 44, 0.72);
      cursor: pointer;
      &:hover {
        color: @primaryColor;
      }
    }
  }

  .components {
    overflow-x: hidden;
    overflow-y: scroll;
    //margin-top: 20px;
    //padding: 0 20px;
    font-size: 12px;
    width: 100%;
    color: rgba(17, 31, 44, 0.85);
    & > p {
      padding: 0 20px;
    }
  }

  .drag {
    margin-left: 20px;
    display: flex;
    flex-wrap: wrap;
    align-items: center;

    :deep(li) {
      text-align: center;
      display: flex;
      align-items: center;
      width: 124px;
      height: 38px;
      margin-bottom: 12px;
      border-radius: 8px;
      cursor: grab;
      background-color: #fff;
      border: 1px solid transparent;

      &:hover {
        border: 1px solid @primaryColor;
        color: @primaryColor;
      }

      i {
        margin: 0 12px;
      }
    }

    li:nth-child(odd) {
      margin-right: 8px;
    }
  }
}

.form-design-component-render {
  .tool-nav {
    font-size: medium;
    padding: 8px 20px;
    background: #fafafb;
    border-bottom: 1px solid #ebecee;

    div:first-child {
      display: inline-block;
      text-align: left;

      i {
        margin-right: 10px;
      }
    }

    div:last-child {
      float: right;

      i {
        margin-left: 10px;
      }
    }

    i {
      color: #7a7a7a;
      cursor: pointer;

      &:hover {
        color: #4b4b4b;
      }
    }
  }
}

.work-form {
  margin: 0 auto;
  height: calc(100% - 38px);
  overflow-y: auto;
  background: rgb(245, 246, 246);
  border-left: 1px solid rgb(235, 236, 238);
  border-right: 1px solid rgb(235, 236, 238);

  .pc {
    margin-top: 4%;

    .drag-from {
      height: calc(100vh - 190px);
      background-color: rgb(245, 246, 246);

      .form-item,
      li {
        cursor: grab;
        background: #ffffff;
        padding: 10px;
        border: 1px solid #ebecee;
        margin: 5px 0;
      }
    }
  }

  .mobile {
    margin-left: auto;
    margin-right: auto;
    width: 360px;
    max-height: 640px;
    margin-top: 4%;
    border-radius: 24px;
    box-shadow: 0 8px 40px 0 rgba(17, 31, 44, 0.12);

    .bd {
      border: 1px solid rgba(17, 31, 44, 0.08);
      border-radius: 24px;
      padding: 10px 10px;
      background-color: #ffffff;

      .form-content {
        padding: 3px 2px;
        border-radius: 14px;
        background-color: #f2f4f5;

        .drag-from {
          width: 100%;
          height: calc(100vh - 190px);
          min-height: 200px;
          max-height: 600px;
        }

        .form {
          overflow-y: auto;
          width: 100%;
          display: inline-block;
          max-height: 640px;

          .form-item,
          li {
            border: 1px solid #ffffff;
            list-style: none;
            background: #ffffff;
            padding: 10px;
            margin: 5px 0;
            cursor: grab;
          }
        }
      }
    }
  }
}

.form-header {
  font-size: small;
  color: #818181;
  text-align: left;
  position: relative;
  background-color: #fff;

  p {
    position: relative;
    margin: 0 0 10px 0;

    span {
      position: absolute;
      left: -8px;
      top: 3px;
      color: rgb(217, 0, 19);
    }
  }

  .option {
    position: absolute;
    top: -10px;
    right: -10px;
    i {
      font-size: large;
      cursor: pointer;
      color: #8c8c8c;
      padding: 5px;
      &:hover {
        color: #f56c6c;
      }
    }
  }
}

.form-design-component-config {
  text-align: center;
  font-size: 14px;
  color: rgb(122, 122, 122);

  .tool-nav-r {
    text-align: left;
    font-size: small;
    border-left: 1px solid #ebecee;
    padding: 8px 20px;
    background: #fafafb;
    border-bottom: 1px solid #ebecee;
  }

  .tip {
    margin-top: 150px;
  }
}
</style>
