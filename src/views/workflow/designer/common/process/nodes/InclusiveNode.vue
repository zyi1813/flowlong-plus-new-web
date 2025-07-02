<script setup lang="ts">
import { computed, ref } from 'vue';
import { useWorkflowStore } from '@/store/modules/workflow';
import InsertButton from '@/views/workflow/designer/common/InsertButton.vue';
import { ValueType } from '../../form/ComponentsConfigExport';

const groupNames = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];

defineOptions({
  name: 'InclusiveNode'
});
const workflowStore = useWorkflowStore();

const props = withDefaults(defineProps<{ config: any; level: number; size: number }>(), {
  config: () => {
    return {};
  },
  // 索引位置
  level: 0,
  // 条件数
  size: 0
});

const placeholder = ref<string>('请设置条件');
const errorInfo = ref<string>('');
const showError = ref<boolean>(false);

const content = computed(() => {
  const groups = props.config.props.groups;
  const conditions: string[] = [];
  groups.forEach((group: any) => {
    const subConditions: string[] = [];
    group.conditions.forEach((subCondition: any) => {
      let subConditionStr = '';
      switch (subCondition.valueType) {
        case ValueType.dept:
        case ValueType.user:
          subConditionStr = `${subCondition.title}属于[${String(subCondition.value.map((u: any) => u.name)).replaceAll(
            ',',
            '. '
          )}]之一`;
          break;
        case ValueType.number:
        case ValueType.string:
          subConditionStr = getOrdinaryConditionContent(subCondition);
          break;
      }
      subConditions.push(subConditionStr);
    });
    // 根据子条件关系构建描述
    const subConditionsStr = String(subConditions).replaceAll(
      ',',
      subConditions.length > 1
        ? group.groupType === 'AND'
          ? ') 且 ('
          : ') 或 ('
        : group.groupType === 'AND'
          ? ' 且 '
          : ' 或 '
    );
    conditions.push(subConditions.length > 1 ? `(${subConditionsStr})` : subConditionsStr);
  });
  // 构建最终描述
  return String(conditions).replaceAll(',', props.config.props.groupsType === 'AND' ? ' 且 ' : ' 或 ');
});

const getDefault = (value: string, df: string) => (value && value !== '' ? value : df);
const getOrdinaryConditionContent = (subCondition: any) => {
  switch (subCondition.compare) {
    case 'IN':
      return `${subCondition.title}为[${String(subCondition.value).replaceAll(',', '、')}]中之一`;
    case 'B':
      return `${subCondition.value[0]} < ${subCondition.title} < ${subCondition.value[1]}`;
    case 'AB':
      return `${subCondition.value[0]} ≤ ${subCondition.title} < ${subCondition.value[1]}`;
    case 'BA':
      return `${subCondition.value[0]} < ${subCondition.title} ≤ ${subCondition.value[1]}`;
    case 'ABA':
      return `${subCondition.value[0]} ≤ ${subCondition.title} ≤ ${subCondition.value[1]}`;
    case '<=':
      return `${subCondition.title} ≤ ${getDefault(subCondition.value[0], ' ?')}`;
    case '>=':
      return `${subCondition.title} ≥ ${getDefault(subCondition.value[0], ' ?')}`;
    default:
      return `${subCondition.title}${subCondition.compare}${getDefault(subCondition.value[0], ' ?')}`;
  }
};
const validate = err => {
  console.log('inclusive childNode', props.config.childNode);
  if (!(props.level == props.size && props.size != 0) && !props.config.childNode?.id) {
    showError.value = true;
    errorInfo.value = '条件分支后不能为空';
    err.push(`条件分支后不能为空`);
    return !showError.value;
  }

  const p = props.config.props;
  if (p.groups.length <= 0) {
    showError.value = true;
    errorInfo.value = '请设置分支条件';
    err.push(`${p.config.name} 未设置条件`);
  } else if (!(p.level == p.size && p.size != 0)) {
    for (let i = 0; i < p.groups.length; i++) {
      if (p.groups[i].cids.length === 0) {
        showError.value = true;
        errorInfo.value = `请设置条件组${groupNames[i]}内的条件`;
        err.push(`条件 ${p.config.name} 条件组${groupNames[i]}内未设置条件`);
        break;
      } else {
        const conditions = p.groups[i].conditions;
        for (let ci = 0; ci < conditions.length; ci++) {
          const subc = conditions[ci];
          showError.value = subc.value.length === 0;
          if (showError.value) {
            errorInfo.value = `请完善条件组${groupNames[i]}内的${subc.title}条件`;
            err.push(`条件 ${p.config.name} 条件组${groupNames[i]}内${subc.title}条件未完善`);
            return false;
          }
        }
      }
    }
  }
  return !showError.value;
};

defineExpose({
  validate
});
</script>

<template>
  <div class="node" :class="{ 'node-error-state': showError }">
    <div class="node-body" :class="{ error: showError }">
      <div v-if="level > 1 && workflowStore.diagramMode !== 'viewer'" class="node-body-left" @click="$emit('leftMove')">
        <i class="x-icon-arrow-left x-iconfont"></i>
      </div>
      <div class="node-body-main" @click="$emit('selected')">
        <div class="node-body-main-header">
          <i class="x-icon-inclusive x-iconfont"></i>
          <n-ellipsis class="title" tooltip>{{ config.name ? config.name : '条件' + level }}</n-ellipsis>
          <span class="level">优先级{{ level }}</span>
          <span v-if="workflowStore.diagramMode !== 'viewer'" class="option">
            <n-tooltip placement="top">
              <template #trigger>
                <i class="x-icon-copy-document x-iconfont" @click.stop="$emit('copy')"></i>
              </template>
              复制条件
            </n-tooltip>
            <i class="x-icon-close x-iconfont" @click.stop="$emit('delNode')"></i>
          </span>
        </div>
        <div class="node-body-main-content">
          <span v-if="(content || '').trim() === ''" class="placeholder">
            {{ level == size && size != 0 ? '其他条件进入此流程' : placeholder }}
          </span>
          <n-ellipsis v-else :line-clamp="4" tooltip>{{ content }}</n-ellipsis>
        </div>
      </div>
      <div
        v-if="level < size && workflowStore.diagramMode !== 'viewer'"
        class="node-body-right"
        @click="$emit('rightMove')"
      >
        <i class="x-icon-arrow-right x-iconfont"></i>
      </div>
      <div v-if="showError" class="node-error">
        <n-tooltip placement="top-start">
          <template #trigger>
            <i class="x-icon-warning-outline x-iconfont" @click.stop="$emit('copy')"></i>
          </template>
          {{ errorInfo }}
        </n-tooltip>
      </div>
    </div>
    <div class="node-footer">
      <div v-if="workflowStore.diagramMode !== 'viewer'" class="btn">
        <InsertButton @insert-node="type => $emit('insertNode', type)" />
      </div>
    </div>
  </div>
</template>

<style lang="less" scoped>
.node-error-state {
  .node-body {
    box-shadow: 0 0 5px 0 #f56c6c !important;
  }
}

.node {
  padding: 30px 55px 0;
  width: 220px;

  .node-body {
    cursor: pointer;
    min-height: 80px;
    max-height: 120px;
    position: relative;
    border-radius: 5px;
    background-color: white;
    box-shadow: 0 0 5px 0 #d8d8d8;

    &:hover {
      .node-body-left,
      .node-body-right {
        i {
          display: block !important;
        }
      }

      .node-body-main {
        .level {
          display: none !important;
        }

        .option {
          display: inline-block !important;
        }
      }

      box-shadow: 0 0 3px 0 @primaryColor;
    }

    .node-body-left,
    .node-body-right {
      display: flex;
      align-items: center;
      position: absolute;
      height: 100%;

      i {
        display: none;
      }

      &:hover {
        background-color: #ececec;
      }
    }

    .node-body-left {
      left: 0;
    }

    .node-body-right {
      right: 0;
      top: 0;
    }

    .node-body-main {
      //position: absolute;
      width: 188px;
      margin-left: 17px;
      display: inline-block;

      .node-body-main-header {
        padding: 10px 0 5px;
        font-size: xx-small;
        position: relative;

        .title {
          color: #425c9d;
          display: inline-block;
          height: 14px;
          width: 125px;
        }

        .level {
          position: absolute;
          right: 15px;
          color: #888888;
        }

        .option {
          position: absolute;
          right: 0;
          display: none;
          font-size: medium;

          i {
            color: #888888;
            padding: 0 3px;
          }
        }
      }

      .node-body-main-content {
        padding: 6px;
        color: #656363;
        font-size: 14px;

        i {
          position: absolute;
          top: 55%;
          right: 10px;
          font-size: medium;
        }

        .placeholder {
          color: #8c8c8c;
        }
      }
    }

    .node-error {
      position: absolute;
      right: -40px;
      top: 20px;
      font-size: 25px;
      color: #f56c6c;
    }
  }

  .node-footer {
    position: relative;

    .btn {
      width: 100%;
      display: flex;
      height: 70px;
      padding: 20px 0 32px;
      justify-content: center;
    }

    &::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      z-index: -1;
      margin: auto;
      width: 2px;
      height: 100%;
      background-color: #cacaca;
    }
  }
}
</style>
