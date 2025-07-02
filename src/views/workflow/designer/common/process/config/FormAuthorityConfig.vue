<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue';
import { useWorkflowStore } from '@/store/modules/workflow';

const workflowStore = useWorkflowStore();
const permSelect = ref('');

function allSelect(type) {
  permSelect.value = type;
  formPerms.value.forEach(f => (f.perm = type));
}

const nowNode = computed(() => workflowStore.selectedNode);
const formData = computed(() => workflowStore.design.formItems);
const formPerms = computed(() => workflowStore.selectedNode.props.formPerms);

watch(
  formPerms,
  () => {
    const set = new Set(formPerms.value.map(f => f.perm));
    permSelect.value = set.size === 1 ? set.values().next().value : '';
  },
  { deep: true }
);

onMounted(() => {
  // Backup
  const oldPermMap = ref(new Map(formPerms.value.map(f => [f.id, f])));
  console.log(oldPermMap.value);

  // Clear and load permissions in order
  formPerms.value.length = 0;
  formPermsLoad(oldPermMap.value, formData.value);
});

function formPermsLoad(oldPermMap, forms) {
  forms.forEach(form => {
    if (form.name === 'SpanLayout') {
      formPermsLoad(oldPermMap, form.props.items);
    } else {
      // Refresh name
      const old = oldPermMap.get(form.id);
      if (old) {
        old.title = form.title;
        old.required = form.props.required;
        formPerms.value.push(old);
      } else {
        formPerms.value.push({
          id: form.id,
          title: form.title,
          required: form.props.required,
          perm: nowNode.value.type === 'ROOT' ? 'E' : 'R'
        });
      }
    }
  });
}
</script>

<template>
  <div>
    <n-table :bordered="false" :single-line="false">
      <thead>
        <tr>
          <th>表单字段</th>
          <th><n-radio :checked="permSelect === 'R'" @change="allSelect('R')">只读</n-radio></th>
          <th><n-radio :checked="permSelect === 'E'" @change="allSelect('E')">可编辑</n-radio></th>
          <th><n-radio :checked="permSelect === 'H'" @change="allSelect('H')">隐藏</n-radio></th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="item in formPerms" :key="item.id">
          <td>{{ item.title }}</td>
          <td>
            <n-radio
              :checked="item.perm === 'R'"
              @change="
                () => {
                  item.perm = 'R';
                }
              "
            >
              只读
            </n-radio>
          </td>
          <td>
            <n-radio
              :checked="item.perm === 'E'"
              @change="
                () => {
                  item.perm = 'E';
                }
              "
            >
              可编辑
            </n-radio>
          </td>
          <td>
            <n-radio
              :checked="item.perm === 'H'"
              @change="
                () => {
                  item.perm = 'H';
                }
              "
            >
              隐藏
            </n-radio>
          </td>
        </tr>
      </tbody>
    </n-table>
  </div>
</template>

<style lang="less" scoped></style>
