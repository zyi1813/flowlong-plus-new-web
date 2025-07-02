import { defineStore } from 'pinia';

export const useWorkflowStore = defineStore('workflow', {
  state: () => ({
    nodeMap: new Map(),
    isEdit: null,
    selectedNode: {},
    selectFormItem: null,
    design: {
      templateId: null,
      templateKey: '',
      templateVersion: 1,
      templateName: '',
      groupId: null,
      formItems: [],
      process: {},
      settings: {
        sign: false
      },
      remark: ''
    },
    runningTask: [],
    noTakeList: [],
    endList: [],
    diagramMode: 'design'
  }),
  getters: {},
  actions: {
    loadForm(value) {
      this.design = value;
    },
    updateSelectFormItem(item) {
      this.selectFormItem = item;
    }
  }
});
