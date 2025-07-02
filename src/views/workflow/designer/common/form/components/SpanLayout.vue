<script setup lang="ts">
import { computed, defineEmits, reactive, withDefaults } from 'vue';
import Draggable from 'vuedraggable';
import { useDialog, useMessage } from 'naive-ui';
import { useWorkflowStore } from '@/store/modules/workflow';
import FormDesignRender from '@/views/workflow/designer/common/form/FormDesignRender.vue';
const message = useMessage();
const dialog = useDialog();

const workflowStore = useWorkflowStore();

interface Props {
  mode?: string;
  value?: any;
  items?: any[];
}

const emit = defineEmits(['update:value']);

const _value = computed({
  get: () => {
    return props.value;
  },
  set: val => {
    emit('update:value', val);
  }
});

const props = withDefaults(defineProps<Props>(), {
  mode: 'DESIGN',
  value: null,
  items: () => {
    return [];
  }
});

const __items = computed(() => {
  const result: any[] = [];
  for (let i = 0; i < props.items.length; i++) {
    if (i > 0 && i % 2 > 0) {
      result.push([props.items[i - 1], props.items[i]]);
    }
  }
  if (result.length * 2 < props.items.length) {
    result.push([props.items[props.items.length - 1]]);
  }
  return result;
});

const selectFormItem = computed({
  get() {
    return workflowStore.selectFormItem;
  },
  set(value) {
    workflowStore.updateSelectFormItem(value);
  }
});

const data = reactive({
  select: null,
  drag: false
});

const selectItem = (item: any) => {
  selectFormItem.value = item;
};

const getSelectedClass = (item: any) => {
  return selectFormItem.value && selectFormItem.value.id === item.id ? 'border-left: 4px solid #f56c6c' : '';
};

const _items = computed({
  get() {
    return props.items;
  },
  set(value) {
    props.items = value;
  }
});
const delItem = (index: number) => {
  dialog.warning({
    title: '警告',
    content: '删除组件将会连带删除包含该组件的条件以及相关设置，是否继续?',
    positiveText: '确定',
    negativeText: '取消',
    onPositiveClick: () => {
      removeCondition(_items.value[index]);
      _items.value.splice(index, 1);
      message.success('成功');
    },
    onNegativeClick: () => {}
  });
};
const nodeMap = workflowStore.nodeMap;

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
</script>

<template>
  <div>
    <div v-if="mode === 'DESIGN'">
      <Draggable
        class="l-drag-from"
        :list="props.items"
        item-key="id"
        :options="{ animation: 300, chosenClass: 'choose', sort: true }"
        group="form"
        @start="
          data.drag = true;
          selectFormItem = null;
        "
        @end="data.drag = false"
      >
        <template #item="{ element, index }">
          <div class="l-form-item" :style="getSelectedClass(element)" @click.stop="selectItem(element)">
            <div class="l-form-header">
              <p>
                <span v-if="element.props.required">*</span>
                {{ element.title }}
              </p>
              <div class="l-option">
                <!--<i class="el-icon-copy-document" @click="copy"></i>-->
                <i class="x-icon-close x-iconfont" @click="delItem(index)"></i>
              </div>
              <FormDesignRender :config="element" />
            </div>
          </div>
        </template>
      </Draggable>
      <div style="color: #c0bebe; text-align: center; width: 90%; padding: 5px">拖拽控件到布局容器内部</div>
    </div>
    <div v-else>
      <NRow v-for="(rows, rsi) in __items" :key="rsi + '_rows'" :gutter="20">
        <NCol v-for="(item, ri) in rows" :key="ri + '_row'" :span="24 / rows.length">
          <NFormItem
            v-if="item.name !== 'SpanLayout' && item.name !== 'Description'"
            :key="item.id"
            :path="item.id"
            :label="item.title"
          >
            <FormDesignRender v-model:value="_value[item.id]" :mode="mode" :config="item" />
          </NFormItem>
          <FormDesignRender v-else v-model="_value" :mode="mode" :config="item" />
        </NCol>
      </NRow>
    </div>
  </div>
</template>

<style scoped lang="less">
.choose {
  border: 1px dashed @primaryColor !important;
}

.l-drag-from {
  min-height: 50px;
  background-color: rgb(245, 246, 246);

  .l-form-item,
  li {
    cursor: grab;
    background: #ffffff;
    padding: 10px;
    border: 1px solid #ebecee;
    margin: 5px 0;
  }
}

.l-form-header {
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

  .l-option {
    position: absolute;
    top: -10px;
    right: -10px;

    i {
      font-size: large;
      cursor: pointer;
      color: #8c8c8c;
      padding: 5px;

      &:hover {
        color: @primaryColor;
      }
    }
  }
}
</style>
