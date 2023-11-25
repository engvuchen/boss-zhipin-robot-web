<template>
  <div>
    <n-form
      ref="formRef"
      :model="modelRef"
      :rules="rules"
      label-placement="left"
      label-width="120"
      :style="{
        minWidth: '400px',
      }"
    >
      <n-form-item
        path="queryParams"
        label="查询链接"
        feedback="以 `https://www.zhipin.com/web/geek/job` 开头。出处见 https://github.com/engvuchen/boss-zhipin-robot-web"
      >
        <n-input
          v-model:value="modelRef.queryParams"
          @change="onQueryParamsChange"
          type="textarea"
          placeholder="以 `https://www.zhipin.com/web/geek/job` 开头"
        />
      </n-form-item>

      <n-form-item v-if="showSalaryRange && salaryMin === 50" path="salaryRange" label="精确薪资范围（K）" feedback="">
        <n-input-number v-model:value="modelRef.salaryRange[0]" style="width: 280px" :min="50" :step="1" />
      </n-form-item>
      <n-form-item v-else-if="showSalaryRange" path="salaryRange" label="精确薪资范围（K）">
        <n-slider
          v-model:value="modelRef.salaryRange"
          :min="salaryMin"
          :max="salaryMax"
          range
          :step="1"
          style="width: 280px"
        />
      </n-form-item>

      <n-form-item path="keySkills" label="精确技能筛选">
        <n-select
          v-model:value="modelRef.keySkills"
          placeholder="岗位详情需包含此处的每一个技能"
          filterable
          multiple
          tag
          :options="keySkills.map(curr => ({ label: curr, value: curr }))"
        />
      </n-form-item>
      <n-form-item path="helloTxt" label="招呼语">
        <n-input v-model:value="modelRef.helloTxt" type="textarea" style="height: 8rem" />
      </n-form-item>
      <n-form-item path="wt2Cookie" label="Cookie（wt2）">
        <n-input v-model:value="modelRef.wt2Cookie" placeholder="登陆后手动获取 Cookie 中的 wt2 部分" type="textarea" />
      </n-form-item>
      <n-form-item path="targetNum" label="打招呼数量" feedback="数字越大，执行时间越长，请斟酌">
        <n-slider
          v-model:value="modelRef.targetNum"
          :min="1"
          :max="99"
          placeholder="数字越大，执行时间越长，请斟酌"
          style="width: 280px"
        />
      </n-form-item>
      <n-form-item
        path="timeout"
        label="超时（秒）"
        feedback="选择器、资源等待时间。出现资源、选择器问题，建议增大后重试"
      >
        <n-slider v-model:value="modelRef.timeout" :step="1" :min="3" :max="10" style="width: 280px" />
      </n-form-item>
      <n-form-item path="excludeCompanies" label="屏蔽公司关键词">
        <n-select v-model:value="modelRef.excludeCompanies" filterable multiple tag :options="excludeCompanies" />
      </n-form-item>
      <n-form-item path="excludeJobs" label="屏蔽工作关键词">
        <n-select
          v-model:value="modelRef.excludeJobs"
          filterable
          multiple
          tag
          :options="excludeJobs.map(curr => ({ label: curr, value: curr }))"
        />
      </n-form-item>

      <n-form-item path="headless" label="观察打招呼过程">
        <n-switch v-model:value="modelRef.headless" :checked-value="false" unchecked-value="new" />
      </n-form-item>

      <div style="display: flex; justify-content: flex-end">
        <n-button round type="primary" :disabled="btnDisabled" @click="handleValidateButtonClick">启动任务</n-button>
      </div>
    </n-form>

    <n-form
      v-if="messageList.length"
      label-width="120"
      :style="{
        minWidth: '400px',
      }"
    >
      <n-form-item label="服务日志">
        <n-input
          ref="serverLogsNode"
          v-model:value="messageListStr"
          type="textarea"
          class="code"
          @keydown.enter.prevent
        />
      </n-form-item>
    </n-form>
  </div>
</template>
<script setup>
import { ref, computed, onMounted, nextTick } from 'vue';
import { useMessage } from 'naive-ui';
import { isFake, request } from '@/util';
const message = useMessage();
import { defaultOptions, defaultValues, SALARY_RANGE_MAP } from './enums';
let [keySkills, excludeJobs, excludeCompanies] = defaultOptions; // tpl

const rules = {
  queryParams: [
    {
      required: true,
      trigger: ['blur', undefined], // trigger 包含 undefined，触发 formRef.value?.validate
      validator(rule, value) {
        let reg = new RegExp('https://www.zhipin.com/web/geek/job');
        // if (!value) {
        //   return new Error('请输入');
        // } else
        if (!reg.test(value)) {
          return new Error('应为网址');
        }
        // else if (isFake(getSalary(modelRef.value.queryParams)[0])) {
        //   return new Error('查询链接中的 salary 非法');
        // }
        return true;
      },
    },
  ],
  // salaryStart: [
  //   {
  //     required: false,
  //     type: 'number',
  //     trigger: ['blur', undefined],
  //     validator(rule, value) {
  //       if (!value) {
  //         return new Error('请输入');
  //       } else if (!/^[1-9][0-9]*$/.test(value)) {
  //         return new Error('应为正整数');
  //       } else if (value >= salaryMax) {
  //         return new Error('需小于岗位薪资最大值');
  //       }

  //       return true;
  //     },
  //   },
  // ],
  salaryRange: [
    {
      required: false,
      type: 'number',
      trigger: ['blur', undefined],
      validator(rule, value) {
        if (!/^[1-9][0-9]*$/.test(value)) {
          return new Error('应为正整数');
        }
        return true;
      },
    },
  ],
  keySkills: [{ required: true, type: 'array', trigger: ['blur', undefined] }],
  targetNum: [
    {
      required: true,
      type: 'number',
      trigger: ['blur', undefined],
      validator(rule, value) {
        // if (!value) {
        //   return new Error('请输入');
        // } else
        if (!/^[1-9][0-9]*$/.test(value)) {
          return new Error('应为正整数');
        }
        return true;
      },
    },
  ],
  timeout: [
    {
      required: true,
      type: 'number',
      trigger: ['blur', undefined],
    },
  ],
  helloTxt: [{ required: true, trigger: ['blur', undefined] }],
  wt2Cookie: [{ required: true, trigger: ['blur', undefined] }],
};
let requiredNames = Object.keys(rules).reduce((accu, key) => {
  let list = rules[key];
  if (list.some(item => item.required)) {
    accu.push(key);
  }
  return accu;
}, []);

// Dom
const serverLogsNode = ref(null);
// Data
// const [salaryMin, salaryMax] = [ref(salaryRange[0]), ref(salaryRange[1])];
const salaryMin = ref(undefined);
const salaryMax = ref(undefined);
const showSalaryRange = ref(false); // todo

const formRef = ref(null);
const modelRef = ref(getMod());
const messageList = ref([]);

console.log('modelRef._value.salaryRange[0]', modelRef._value.salaryRange[0]);

// Computed
let waitAutoSendHello = ref(false);
const btnDisabled = computed(() => {
  return requiredNames.some(key => isFake(modelRef.value[key])) || waitAutoSendHello.value;
});
// const salaryStartFeedback = computed(() => {
//   let { queryParams } = modelRef.value;
//   if (!queryParams) return '';
//   let [salaryMin, salaryMax] = getSalary(queryParams);
//   // return `正整数；需小于岗位薪资最大值（${salaryMax} K）；当前筛选薪资 ${salaryMin}-${salaryMax} K`;

//   if (!isFake(salaryMin)) {
//     return `正整数；当前筛选薪资 ${salaryMin}-${salaryMax} K`;
//   }
//   return `未选择薪资或薪资枚举值非法`;
// });
const messageListStr = computed(() => {
  return messageList.value.join('\n');
});

// LifeCycle
onMounted(() => {
  initWs();
  onQueryParamsChange();
});
// Method
function initWs() {
  // 此处 new ，触发一次 wss connection
  let wss = new WebSocket('ws://127.0.0.1:3000');
  wss.onopen = function (event) {
    console.log('WebSocket is open now.');
  };
  wss.onmessage = async event => {
    messageList.value.push(event.data);
    await nextTick();
    // textareaElRef 是组件内的 ref；通过父组件 ref 访问它，又不需要通过 .value 获取 DOM
    if (serverLogsNode.value?.textareaElRef.scrollHeight) {
      serverLogsNode.value.textareaElRef.scrollTop = serverLogsNode.value?.textareaElRef.scrollHeight;
    }
  };
}
async function handleValidateButtonClick(e) {
  e.preventDefault();
  let validErr = await formRef.value?.validate(async errors => {
    return new Promise(resolve => {
      if (errors) return resolve(errors);
      resolve(true);
    });
  });
  if (validErr) {
    console.error('errors', validErr);
    return message.error('验证失败');
  }

  let sendData = JSON.parse(JSON.stringify(modelRef._value));
  return console.log('🔎 ~ file: Main.vue:231 ~ handleValidateButtonClick ~ sendData:', sendData);
  localStorage.setItem('zhipin-robot', JSON.stringify(sendData));

  waitAutoSendHello.value = true;
  let res = await request({
    url: '/api/send',
    method: 'POST',
    data: sendData,
  });
  waitAutoSendHello.value = false;

  if (res?.code !== 0) {
    return message.error(res?.msg || '');
  }
}
// todo
function onQueryParamsChange(e) {
  let { queryParams = '' } = modelRef._value;
  if (!queryParams) return;

  let [min, max] = getSalary(queryParams);
  if (isFake(min)) {
    showSalaryRange.value = false;
    modelRef.value.salaryRange = [undefined];
    return;
  }

  showSalaryRange.value = true;
  [salaryMin.value, salaryMax.value] = [min, max];
  if (min === 50) {
    modelRef.value.salaryRange = [min];
  } else {
    modelRef.value.salaryRange = [min, max];
  }
}

function getMod() {
  let mod = Object.assign(defaultValues, JSON.parse(localStorage.getItem('zhipin-robot') || '{}'));
  if (!isFake(salaryMin.value)) mod.salaryRange = [salaryMin, salaryMax];
  return mod;
}
function getSalary(queryParams = '') {
  let params = new URLSearchParams(queryParams);
  let salary = params.get('salary');
  return SALARY_RANGE_MAP[salary] || [undefined];
}
</script>
<style scoped>
.code {
  box-sizing: border-box;
  padding: 10px;
  border-radius: 4px;
  min-width: 500px;
  min-height: 470px;

  line-height: 2;
  font-size: 14px;
  font-family: consolas, monaco, monospace;
  tab-size: 2;

  word-wrap: break-word;
  word-break: break-all;
}
</style>
