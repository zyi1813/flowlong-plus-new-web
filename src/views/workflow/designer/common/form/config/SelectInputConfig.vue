<script setup lang="ts">
import { ref, withDefaults } from 'vue';
import Draggable from 'vuedraggable';
interface Props {
  value?: object;
}
const dragOption = ref({ animation: 300, sort: true });
withDefaults(defineProps<Props>(), {
  value: () => {
    return {};
  }
});
</script>

<template>
  <div>
    <n-form-item label="提示文字">
      <n-input v-model:value="value.placeholder" size="small" placeholder="请设置提示语" />
    </n-form-item>
    <n-form labn-position="top" class="relative-container">
      <n-form-item label="选项设置" class="options">
        <div class="options-header">
          <n-button type="text" size="mini" class="blue-button" @click="value.options.push('新选项')">
            新增选项
          </n-button>
        </div>
        <Draggable class="drag" :list="value.options" :options="dragOption" item-key="id" group="option">
          <template #item="{ element, index }">
            <div option-item>
              <n-input
                v-model:value="value.options[index]"
                size="medium"
                placeholder="请设置选项值"
                clearable
                class="input2"
                style="width: 200px"
              />
              <n-button type="danger" size="medium" class="btn" @click="value.options.splice(index, 1)">x</n-button>
            </div>
          </template>
        </Draggable>
      </n-form-item>
    </n-form>
    <n-form-item label="选项展开">
      <n-switch v-model:value="value.expanding" />
    </n-form-item>
  </div>
</template>

<style scoped lang="less">
.options-header {
  position: absolute;
  top: -35px;
  right: 0;
  margin: 10px;
}

.blue-button {
  color: #1890ff; /* Blue color */
}
.option-item {
  margin-bottom: 5px;
}
.input2 {
  height: 37px;
  margin-right: 5px;
  margin-bottom: 5px;
}
</style>
