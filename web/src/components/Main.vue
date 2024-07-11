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
            class="form"
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
            <n-form-item path="helloTxt" label="招呼语">
                <n-input v-model:value="modelRef.helloTxt" type="textarea" style="height: 8rem" />
            </n-form-item>
            <n-form-item path="wt2Cookie" label="Cookie（wt2）">
                <n-input
                    v-model:value="modelRef.wt2Cookie"
                    placeholder="登陆后手动获取 Cookie 中的 wt2 部分"
                    type="textarea"
                />
            </n-form-item>
            <n-form-item
                path="targetNum"
                label="打招呼数量"
                feedback="数量越多，执行时间越长。BOSS 每日限制 100 次打招呼"
            >
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
                <n-slider v-model:value="modelRef.timeout" :step="1" :min="5" :max="30" style="width: 280px" />
            </n-form-item>
            <!-- 精确筛选条件 -->
            <n-form-item
                path="salaryRange"
                label="薪酬区间（K）"
                :feedback="`可在 [${salaryMin}, 100] 自定义薪酬，若岗位薪酬区间与此区间有交集，则匹配。当前薪酬枚举 [${salaryMin}, ${salaryMax}]`"
            >
                <n-slider
                    v-model:value="modelRef.salaryRange"
                    :min="salaryMin"
                    :max="100"
                    range
                    :step="1"
                    style="width: 280px"
                />
            </n-form-item>
            <n-form-item path="bossActiveType" label="BOSS 活跃时间筛选">
                <div class="flex flex-column">
                    <n-select
                        v-model:value="modelRef.bossActiveType"
                        :options="
                            bossActiveOptions.map(curr => ({
                                label: curr,
                                value: curr,
                            }))
                        "
                    />
                    <div class="help">仅投递 BOSS 在指定时间内有活跃的岗位，活跃时间不存在也不投递</div>
                </div>
            </n-form-item>
            <n-form-item path="keySkills" label="精确技能筛选" feedback="岗位详情需匹配此处的每一个技能">
                <n-select
                    v-model:value="modelRef.keySkills"
                    filterable
                    multiple
                    tag
                    :options="keySkills.map(curr => ({ label: curr, value: curr }))"
                />
            </n-form-item>
            <n-form-item path="excludeCompanies" label="屏蔽公司关键词">
                <div class="flex flex-column">
                    <n-select
                        v-model:value="modelRef.excludeCompanies"
                        filterable
                        multiple
                        tag
                        :options="excludeCompanies"
                        class="mb-4"
                    />
                    <div class="help">若公司名包含此处的任意一个关键词，则被过滤；忽略大小写</div>
                </div>
            </n-form-item>
            <n-form-item path="excludeJobs" label="屏蔽岗位关键词">
                <div class="flex flex-column">
                    <n-select
                        v-model:value="modelRef.excludeJobs"
                        filterable
                        multiple
                        tag
                        :options="excludeJobs.map(curr => ({ label: curr, value: curr }))"
                    />
                    <div class="help">
                        若岗位名、岗位详情包含此处的任意一个关键词，则被过滤；比“精确技能筛选”优先，忽略大小写
                    </div>
                </div>
            </n-form-item>

            <n-form-item path="headless" label="观察打招呼过程">
                <n-switch v-model:value="modelRef.headless" :checked-value="false" unchecked-value="new" />
            </n-form-item>

            <div class="flex justify-end" style="width: 100%">
                <n-button round type="primary" :disabled="btnDisabled" @click="onSubmit">启动任务</n-button>
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
                    :value="messageListStr"
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
import { keySkills, excludeJobs, excludeCompanies, bossActiveOptions, defaultValues, SALARY_RANGE_MAP } from './enums';

const rules = {
    queryParams: [
        {
            required: true,
            trigger: ['blur', undefined], // trigger 包含 undefined，触发 formRef.value?.validate
            validator(rule, value) {
                let reg = new RegExp('https://www.zhipin.com/web/geek/job');
                if (!reg.test(value)) {
                    return new Error('应为网址');
                }
                return true;
            },
        },
    ],
    targetNum: [
        {
            required: true,
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
    timeout: [
        {
            required: true,
            type: 'number',
            trigger: ['blur', undefined],
        },
    ],
    helloTxt: [{ required: true, trigger: ['blur', undefined] }],
    wt2Cookie: [{ required: true, trigger: ['blur', undefined] }],
    keySkills: [{ type: 'array', trigger: ['blur', undefined] }],
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
const salaryMin = ref(undefined);
const salaryMax = ref(Infinity); // 10-20K，可以把 15-30K 筛选出来，薪酬终点限制感觉没必要

const formRef = ref(null);
const modelRef = ref(getMod());
const messageList = ref([]);

// Computed
let waitAutoSendHello = ref(false);
const btnDisabled = computed(() => {
    return requiredNames.some(key => isFake(modelRef.value[key])) || waitAutoSendHello.value;
});
const messageListStr = computed(() => {
    return messageList.value.join('\n');
});

// LifeCycle
onMounted(() => {
    initWs();
    onQueryParamsChange(null, true);
});
// Method
function initWs() {
    // 此处 new ，触发一次 wss connection
    const ip = import.meta.env.BOSS_IP || 'localhost';
    const port = import.meta.env.BOSS_PORT || '3000';

    let wss = new WebSocket(`ws://${ip}:${port}`);
    wss.onopen = function (event) {
        console.log('WebSocket is open now.');
    };
    wss.onmessage = async event => {
        messageList.value.push(event.data);
        await nextTick();
        // textareaElRef 是组件内的 ref
        if (serverLogsNode.value?.textareaElRef.scrollHeight) {
            serverLogsNode.value.textareaElRef.scrollTop = serverLogsNode.value?.textareaElRef.scrollHeight;
        }
    };
}
async function onSubmit(e) {
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
function onQueryParamsChange(e, init = false) {
    let { queryParams = '' } = modelRef._value;
    if (!queryParams) return;

    let [min = 0, max = Infinity] = getSalary(queryParams);
    salaryMin.value = min;
    salaryMax.value = max;

    if (!init) {
        modelRef.value.salaryRange = [min, 100];
    }
}

function getMod() {
    let mod = Object.assign(defaultValues, JSON.parse(localStorage.getItem('zhipin-robot') || '{}'));
    return mod;
}
function getSalary(queryParams = '') {
    let params = new URLSearchParams(queryParams);
    let salary = params.get('salary');
    return SALARY_RANGE_MAP[salary] || [];
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
.form >>> .n-form-item-feedback__line {
    margin-bottom: 20px;
}

.flex {
    display: flex;
}
.flex-column {
    flex-direction: column;
}
.justify-center {
    justify-content: center;
}
.justify-end {
    justify-content: flex-end;
}
.align-top {
    align-items: flex-start;
}
.mb-4 {
    margin-bottom: 4px;
}
.mr-12 {
    margin-right: 12px;
}
.mr-top-2 {
    margin-top: 2px;
}
.help {
    color: var(--n-feedback-text-color);
}
</style>
