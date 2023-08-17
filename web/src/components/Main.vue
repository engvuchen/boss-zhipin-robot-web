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
        feedback="默认参数为：前端开发工程师 / 1-3年经验 / 薪资待遇10-20K / 学历要求本科；链接出处见 https://github.com/engvuchen/boss-zhipin-robot-web"
      >
        <n-input v-model:value="modelRef.queryParams" @change="onQueryParamsChange" type="textarea" />
      </n-form-item>
      <n-form-item path="salaryStart" label="起薪（K）" :feedback="salaryStartFeedback">
        <n-input-number
          v-model:value="modelRef.salaryStart"
          placeholder="岗位薪资最大值需大于该值"
          style="width: 280px"
        />
      </n-form-item>
      <n-form-item path="keySkills" label="精确技能筛选">
        <n-select
          v-model:value="modelRef.keySkills"
          placeholder=" 岗位详情需包含此处的每一个技能"
          filterable
          multiple
          tag
          :options="keySkills.map(curr => ({ label: curr, value: curr }))"
        />
      </n-form-item>
      <n-form-item path="helloTxt" label="招呼语">
        <n-input v-model:value="modelRef.helloTxt" type="textarea" style="height: 8rem" />
      </n-form-item>
      <n-form-item path="wt2Cookie" label="Cookie（wt2）" feedback="登陆后手动获取 Cookie 中的 wt2 部分">
        <n-input v-model:value="modelRef.wt2Cookie" type="textarea" />
      </n-form-item>
      <n-form-item path="targetNum" label="打招呼数量">
        <n-input-number
          v-model:value="modelRef.targetNum"
          placeholder="数字越大，执行时间越长，请斟酌"
          style="width: 280px"
        />
      </n-form-item>
      <n-form-item path="timeout" label="超时（秒）" feedback="选择器等待时间，默认3s。出现超时问题，可以增大后重试">
        <n-slider v-model:value="modelRef.timeout" :step="1" :min="3" :max="10" style="width: 280px" />
      </n-form-item>
      <n-form-item path="excludeCompanies" label="屏蔽公司关键词" feedback="字母需小写">
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
        <n-input v-model:value="messageListStr" type="textarea" class="code" @keydown.enter.prevent />
      </n-form-item>
    </n-form>
  </div>
</template>
<script setup>
import { ref, computed, onMounted } from 'vue';
import { useMessage } from 'naive-ui';
import { isFake, request } from '@/util';
const message = useMessage();
import { keySkills, excludeCompanies, excludeJobs, defaultValues, salaryRangeMap } from './enums';

const cacheMod = JSON.parse(localStorage.getItem('zhipin-robot') || '{}');
const mod = Object.assign(defaultValues, cacheMod);
let [salaryMin, salaryMax] = getSalary(mod.queryParams);
mod.salaryStart = salaryMin;
const rules = {
  queryParams: [
    {
      required: true,
      // message: '请输入',
      trigger: ['blur', undefined], // trigger 包含 undefined，触发 formRef.value?.validate
      validator(rule, value) {
        let reg = new RegExp('https://www.zhipin.com/web/geek/job');
        if (!value) {
          return new Error('请输入');
        } else if (!reg.test(value)) {
          return new Error('应为网址');
        } else if (isFake(getSalary(modelRef.value.queryParams)[0])) {
          return new Error('查询链接中的 salary 非法');
        }
        return true;
      },
    },
  ],
  salaryStart: [
    {
      required: true,
      type: 'number',
      trigger: ['blur', undefined],
      validator(rule, value) {
        if (!value) {
          return new Error('请输入');
        } else if (!/^[1-9][0-9]*$/.test(value)) {
          return new Error('应为正整数');
        } else if (value >= salaryMax) {
          return new Error('需小于岗位薪资最大值');
        }

        return true;
      },
    },
  ],
  keySkills: [{ required: true, type: 'array', message: '请输入', trigger: ['blur', undefined] }],
  targetNum: [
    {
      required: true,
      type: 'number',
      trigger: ['blur', undefined],
      validator(rule, value) {
        if (!value) {
          return new Error('请输入');
        } else if (!/^[1-9][0-9]*$/.test(value)) {
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
  helloTxt: [{ required: true, message: '请输入', trigger: ['blur', undefined] }],
  wt2Cookie: [{ required: true, message: '请输入', trigger: ['blur', undefined] }],
};
let requiredNames = Object.keys(rules).reduce((accu, key) => {
  let list = rules[key];
  if (list.some(item => item.required)) {
    accu.push(key);
  }
  return accu;
}, []);

// Data
const formRef = ref(null);
const modelRef = ref(mod);
const messageList = ref([]);
// Computed
let waitAutoSendHello = ref(false);
const btnDisabled = computed(() => {
  return requiredNames.some(key => isFake(modelRef.value[key])) || waitAutoSendHello.value;
});
const salaryStartFeedback = computed(() => {
  let { queryParams } = modelRef.value;
  if (!queryParams) return '';
  let [salaryMin, salaryMax] = getSalary(queryParams);
  return `正整数；需小于岗位薪资最大值（${salaryMax} K）；当前筛选薪资 ${salaryMin}-${salaryMax} K`;
});
const messageListStr = computed(() => {
  return messageList.value.join('\n');
});

// LifeCycle
onMounted(() => {
  initWs();
});

// Method
function initWs() {
  // 此处 new ，触发一次 wss connection
  let wss = new WebSocket('ws://127.0.0.1:3000');
  wss.onopen = function (event) {
    console.log('WebSocket is open now.');
  };
  wss.onmessage = event => {
    messageList.value.push(event.data);
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
  localStorage.setItem('zhipin-robot', JSON.stringify(sendData)); // todo { formData }

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
function onQueryParamsChange(e) {
  let { queryParams = '' } = modelRef._value;
  if (!queryParams) return;
  let [min, max] = getSalary(queryParams);
  if (isFake(min)) return message.error('查询链接中的 salary 非法');

  salaryMax = max;
  modelRef.value.salaryStart = min;
}

function getSalary(queryParams = '') {
  let params = new URLSearchParams(queryParams);
  let salary = params.get('salary');
  return salaryRangeMap[salary] || [undefined, Infinity];
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
