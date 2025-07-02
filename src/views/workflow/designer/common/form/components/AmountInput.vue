<script setup lang="ts">
import { computed, withDefaults } from 'vue';

interface Props {
  mode?: string;
  precision?: number;
  placeholder?: string;
  readerMode?: boolean;
  value?: string | number;
  showChinese?: boolean;
}
const convertCurrency = money => {
  // 汉字的数字
  const cnNums = ['零', '壹', '贰', '叁', '肆', '伍', '陆', '柒', '捌', '玖'];
  // 基本单位
  const cnIntRadice = ['', '拾', '佰', '仟'];
  // 对应整数部分扩展单位
  const cnIntUnits = ['', '万', '亿', '兆'];
  // 对应小数部分单位
  const cnDecUnits = ['角', '分', '毫', '厘'];
  // 整数金额时后面跟的字符
  const cnInteger = '整';
  // 整型完以后的单位
  const cnIntLast = '元';
  // 最大处理的数字
  const maxNum = 999999999.99;
  // 金额整数部分
  let integerNum;
  // 金额小数部分
  let decimalNum;
  // 输出的中文金额字符串
  let chineseStr = '';
  // 分离金额后用的数组，预定义
  let parts;
  if (money === '') {
    money = '0';
  }
  money = Number.parseFloat(money);
  if (money >= maxNum) {
    // 超出最大处理数字
    return '';
  }
  if (money === 0) {
    chineseStr = cnNums[0] + cnIntLast + cnInteger;
    return chineseStr;
  }
  // 转换为字符串
  money = money.toString();
  if (!money.includes('.')) {
    integerNum = money;
    decimalNum = '';
  } else {
    parts = money.split('.');
    integerNum = parts[0];
    decimalNum = parts[1].substr(0, 4);
  }
  // 获取整型部分转换
  if (Number.parseInt(integerNum, 10) > 0) {
    let zeroCount = 0;
    const IntLen = integerNum.length;
    for (let i = 0; i < IntLen; i++) {
      const n = integerNum.substr(i, 1);
      const p = IntLen - i - 1;
      const q = p / 4;
      const m = p % 4;
      if (n == '0') {
        zeroCount++;
      } else {
        if (zeroCount > 0) {
          chineseStr += cnNums[0];
        }
        // 归零
        zeroCount = 0;
        chineseStr += cnNums[Number.parseInt(n)] + cnIntRadice[m];
      }
      if (m == 0 && zeroCount < 4) {
        chineseStr += cnIntUnits[q];
      }
    }
    chineseStr += cnIntLast;
  }
  // 小数部分
  if (decimalNum !== '') {
    const decLen = decimalNum.length;
    for (let i = 0; i < decLen; i++) {
      const n = decimalNum.substr(i, 1);
      if (n !== '0') {
        chineseStr += cnNums[Number(n)] + cnDecUnits[i];
      }
    }
  }
  if (chineseStr === '') {
    chineseStr += cnNums[0] + cnIntLast + cnInteger;
  } else if (decimalNum === '') {
    chineseStr += cnInteger;
  }
  return chineseStr;
};
const emit = defineEmits(['update:value']);
const props = withDefaults(defineProps<Props>(), {
  mode: 'DESIGN',
  placeholder: '请输入金额',
  readerMode: false,
  precision: 0,
  value: ''
});
const _value = computed({
  get() {
    return props.value ? Number.parseFloat(props.value) : 0;
  },
  set(value) {
    emit('update:value', value);
  }
});
const chinese = computed(() => convertCurrency(props.value));
</script>

<template>
  <div>
    <div v-if="mode === 'DESIGN'">
      <n-input size="medium" disabled :placeholder="placeholder" />
      <div v-show="showChinese" style="margin-top: 15px">
        <span>大写：</span>
        <span class="chinese">{{ chinese }}</span>
      </div>
    </div>
    <div v-else>
      <n-input-number
        v-if="!readerMode"
        v-model:value="_value"
        style="width: 100%"
        :min="0"
        size="medium"
        clearable
        :precision="precision"
        :placeholder="placeholder"
      />
      <div v-else v-text="_value"></div>
      <div v-show="showChinese">
        <span>大写：</span>
        <span class="chinese">{{ chinese }}</span>
      </div>
    </div>
  </div>
</template>

.
<style scoped lang="less">
.chinese {
  color: #afadad;
  font-size: smaller;
}
</style>
