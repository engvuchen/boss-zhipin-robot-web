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
        label="查询参数"
        feedback="在市场页面（https://www.zhipin.com/web/geek/job）进行筛选后，筛选参数同步到地址栏，拷贝地址栏链接"
      >
        <n-input v-model:value="modelRef.queryParams" type="textarea" @keydown.enter.prevent />
      </n-form-item>
      <n-form-item path="targetNum" label="打招呼数量" class="">
        <n-input-number
          v-model:value="modelRef.targetNum"
          feedback="数字越大，执行时间越长，请斟酌数量"
          @keydown.enter.prevent
        />
      </n-form-item>
      <n-form-item path="helloTxt" label="招呼语">
        <n-input v-model:value="modelRef.helloTxt" type="textarea" @keydown.enter.prevent />
      </n-form-item>
      <n-form-item path="wt2Cookie" label="cookie（wt2）" feedback="登陆后手动获取 Cookie 中的 wt2 部分">
        <n-input v-model:value="modelRef.wt2Cookie" type="textarea" @keydown.enter.prevent />
      </n-form-item>
      <n-form-item path="excludeCompanies" label="屏蔽公司关键词">
        <n-select v-model:value="modelRef.excludeCompanies" filterable multiple tag :options="excludeCompanies" />
      </n-form-item>
      <n-form-item path="excludeJobs" label="屏蔽工作关键词">
        <n-select v-model:value="modelRef.excludeJobs" filterable multiple tag :options="excludeJobs" />
      </n-form-item>
      <div style="display: flex; justify-content: flex-end">
        <n-button round type="primary" :disabled="btnDisabled" @click="handleValidateButtonClick">启动任务</n-button>
        <!-- <n-input :disabled="btnDisabled" type="textarea" @keydown.enter.prevent /> -->
        <!-- <button :disabled="btnDisabled">{{ btnDisabled }}</button> -->
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
import { ref, reactive, computed } from 'vue';
import { useMessage } from 'naive-ui';
import { isFake, request } from '@/util';
const message = useMessage();
// 默认：不投递大厂、屏蔽部分外包公司关键词
const defaultExcludeCompanies = [
  '阿里巴巴',
  '字节跳动',
  '今日头条',
  '网易',
  '腾讯',
  '百度',
  'Shopee',
  '深圳腾娱互动科技',
  '人才',
  '信息技术',
];
const excludeCompanies = defaultExcludeCompanies.map(name => ({ label: name, value: name }));
// 工作名屏蔽
const excludeJobs = [
  {
    label: 'Flutter',
    value: 'Flutter',
  },
  {
    label: 'flutter',
    value: 'flutter',
  },
  {
    label: 'shopify',
    value: 'shopify',
  },
  {
    label: 'React',
    value: 'React',
  },
  {
    label: 'react',
    value: 'react',
  },
  {
    label: 'RN',
    value: 'RN',
  },
  {
    label: 'React Native',
    value: 'React Native',
  },
  {
    label: 'PHP',
    value: 'PHP',
  },
  {
    label: 'WordPress',
    value: 'WordPress',
  },
  {
    label: 'Front End',
    value: 'Front End',
  },
  {
    label: 'App',
    value: 'App',
  },
  {
    label: 'Angular',
    value: 'Angular',
  },
  {
    label: 'angular',
    value: 'angular',
  },
  {
    label: '混合',
    value: '混合',
  },
  {
    label: 'uniapp',
    value: 'uniapp',
  },
  {
    label: '游戏',
    value: '游戏',
  },
  {
    label: '派遣',
    value: '派遣',
  },
  {
    label: '外包',
    value: '外包',
  },
];
const rules = {
  queryParams: [
    {
      required: true,
      message: '请输入',
      validator(rule, value) {
        let reg = new RegExp('https://www.zhipin.com/web/geek/job');
        if (!value) {
          return new Error('请输入');
          // https://www.zhipin.com/web/geek/job
        } else if (!reg.test(value)) {
          return new Error('应为网址');
        }
        return true;
      },
      trigger: ['blur'],
    },
  ],
  targetNum: [
    {
      required: true,
      type: 'number',
      validator(rule, value) {
        if (!value) {
          return new Error('请输入');
        } else if (!/^[1-9][0-9]*$/.test(value)) {
          return new Error('应为正整数');
        }
        return true;
      },
      trigger: ['blur'],
    },
  ],
  helloTxt: [{ required: true, message: '请输入', trigger: ['blur'] }],
  wt2Cookie: [{ required: true, message: '请输入', trigger: ['blur'] }],
};
let requiredNames = Object.keys(rules).reduce((accu, key) => {
  let list = rules[key];
  if (list.some(item => item.required)) {
    accu.push(key);
  }
  return accu;
}, []);

const cacheMoRef = localStorage.getItem('zhipin-robot') || '';

const formRef = ref(null);
const modelRef = cacheMoRef
  ? ref(JSON.parse(cacheMoRef))
  : ref({
      queryParams: 'https://www.zhipin.com/web/geek/job?page=1',
      targetNum: 2,
      helloTxt:
        '面试官您好！看到贵司在前端工程师的岗位，而我过往经历中，有1年小程序开发经验，2年管理端开发经验，我的过往经历跟贵司的匹配度是非常高的。而我目前已经离职，最快到岗时间是一周以内，非常期待贵司能给我一个面试机会，展示一下自己。若您对我的微简历有什么疑问，我随时在线解答。',
      cookie: '',
      excludeCompanies: defaultExcludeCompanies,
      excludeJobs: ['外包', '派遣'],
    });
const btnDisabled = computed(() => {
  return requiredNames.some(key => isFake(modelRef.value[key]));
});
const messageList = ref([]);
const messageListStr = computed(() => {
  return messageList.join('\n');
});

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

  let wsRes = await request({
    url: '/open-ws',
  });
  console.log('🔎 ~ file: Main.vue:235 ~ handleValidateButtonClick ~ wsRes:', wsRes);
  if (wsRes.code !== 0) {
    return message.error(wsRes.msg);
  }

  let sendData = JSON.parse(JSON.stringify(modelRef._value));
  localStorage.setItem('zhipin-robot', JSON.stringify(sendData));

  let ws = new WebSocket('ws://127.0.0.1:3000/socket');

  let res = await request({
    url: '/send',
    method: 'POST',
    data: sendData,
  });
  ws.on('message', function (msg) {
    messageList.unshift(msg);
  });
  if (res.code !== 200) {
    return message.error(res.msg);
  }
}
</script>
<style scoped>
/* .mr-b-20 {
  padding-bottom: 40px;
} */
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
