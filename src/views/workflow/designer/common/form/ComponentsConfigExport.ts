export const ValueType = {
  string: 'String',
  object: 'Object',
  array: 'Array',
  number: 'Number',
  date: 'Date',
  user: 'User',
  dept: 'Dept',
  dateRange: 'DateRange'
};

export const baseComponents = [
  // {
  //   name: '布局',
  //   components: [
  //     {
  //       title: '分栏布局',
  //       name: 'SpanLayout',
  //       icon: 'x-icon-column-vertical',
  //       value: [],
  //       valueType: ValueType.array,
  //       props: {
  //         items: []
  //       }
  //     }
  //   ]
  // },
  {
    name: '基础组件',
    components: [
      {
        title: '单行文本输入',
        name: 'TextInput',
        icon: 'x-icon-edit',
        value: '',
        valueType: ValueType.string,
        props: {
          required: false,
          enablePrint: true
        }
      },
      {
        title: '多行文本输入',
        name: 'TextareaInput',
        icon: 'x-icon-more-outline',
        value: '',
        valueType: ValueType.string,
        props: {
          required: false,
          enablePrint: true
        }
      },
      {
        title: '数字输入框',
        name: 'NumberInput',
        icon: 'x-icon-edit-outline',
        value: '',
        valueType: ValueType.number,
        props: {
          required: false,
          enablePrint: true
        }
      },
      {
        title: '金额输入框',
        name: 'AmountInput',
        icon: 'x-icon-amount',
        value: '',
        valueType: ValueType.number,
        props: {
          required: false,
          enablePrint: true,
          showChinese: true
        }
      },
      {
        title: '单选框',
        name: 'SelectInput',
        icon: 'x-icon-circle-check',
        value: '',
        valueType: ValueType.string,
        props: {
          required: false,
          enablePrint: true,
          expanding: false,
          options: ['选项1', '选项2']
        }
      },
      {
        title: '多选框',
        name: 'MultipleSelect',
        icon: 'x-icon-multi-check',
        value: [],
        valueType: ValueType.array,
        props: {
          required: false,
          enablePrint: true,
          expanding: false,
          options: ['选项1', '选项2']
        }
      },
      {
        title: '日期时间点',
        name: 'DateTime',
        icon: 'x-icon-date',
        value: '',
        valueType: ValueType.date,
        props: {
          required: false,
          enablePrint: true,
          format: 'yyyy-MM-dd HH:mm',
          options: [
            { label: '年', value: 'yyyy' },
            { label: '年-月', value: 'yyyy-MM' },
            { label: '年-月-日', value: 'yyyy-MM' },
            { label: '年-月-日 时:分', value: 'yyyy-MM-dd HH:mm' }
          ]
        }
      },
      {
        title: '日期时间区间',
        name: 'DateTimeRange',
        icon: 'x-icon-date',
        valueType: ValueType.dateRange,
        props: {
          required: false,
          enablePrint: true,
          placeholder: ['开始时间', '结束时间'],
          format: 'yyyy-MM-dd HH:mm',
          showLength: false,
          options: [
            { label: '年', value: 'yyyy' },
            { label: '年-月', value: 'yyyy-MM' },
            { label: '年-月-日', value: 'yyyy-MM' },
            { label: '年-月-日 时:分', value: 'yyyy-MM-dd HH:mm' }
          ]
        }
      },
      {
        title: '上传图片',
        name: 'ImageUpload',
        icon: 'x-icon-picture-outline',
        value: [],
        valueType: ValueType.array,
        props: {
          required: false,
          enablePrint: true,
          maxSize: 5, // 图片最大大小MB
          maxNumber: 3, // 最大上传数量
          enableZip: true // 图片压缩后再上传
        }
      },
      {
        title: '上传附件',
        name: 'FileUpload',
        icon: 'x-icon-folder-opened',
        value: [],
        valueType: ValueType.array,
        props: {
          required: false,
          enablePrint: true,
          onlyRead: false, // 是否只读，false只能在线预览，true可以下载
          maxSize: 50, // 文件最大大小MB
          maxNumber: 3, // 最大上传数量
          fileTypes: [] // 限制文件上传类型
        }
      },
      // {
      //   title: '人员选择',
      //   name: 'UserPicker',
      //   icon: 'x-icon-user-outline',
      //   value: [],
      //   valueType: ValueType.user,
      //   props: {
      //     required: false,
      //     enablePrint: true,
      //     multiple: false
      //   }
      // },
      // {
      //   title: '部门选择',
      //   name: 'DeptPicker',
      //   icon: 'iconfont x-icon-branch_1',
      //   value: [],
      //   valueType: ValueType.dept,
      //   props: {
      //     required: false,
      //     enablePrint: true,
      //     multiple: false
      //   }
      // },
      {
        title: '说明文字',
        name: 'Description',
        icon: 'x-icon-warning-outline',
        value: '',
        valueType: ValueType.string,
        props: {
          required: false,
          enablePrint: true
        }
      }
    ]
  },
  // {
  //   name: '扩展组件',
  //   components: [
  //     {
  //       title: '明细表',
  //       name: 'TableList',
  //       icon: 'x-icon-tickets',
  //       value: [],
  //       valueType: ValueType.array,
  //       props: {
  //         required: false,
  //         enablePrint: true,
  //         showBorder: true,
  //         rowLayout: true,
  //         showSummary: false,
  //         summaryColumns: [],
  //         maxSize: 0, // 最大条数，为0则不限制
  //         columns: [] // 列设置
  //       }
  //     }
  //   ]
  // }
];

export default {
  baseComponents
};
