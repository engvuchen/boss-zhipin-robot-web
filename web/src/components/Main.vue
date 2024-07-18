<template>
    <div>
        <!--  表单 -->
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
            <n-form-item>
                <div class="flex justify-end" style="width: 100%">
                    <n-select
                        v-model:value="activeConfIndex"
                        :options="confSelectOpts"
                        filterable
                        :disabled="false"
                        class="w-330 mr-4"
                        @update:value="onConfChange"
                    />
                    <n-button-group class="mr-20">
                        <n-button ghost @click="showManageModal = !showManageModal" style="width: 80px">管理</n-button>
                    </n-button-group>
                    <n-button-group>
                        <n-button ghost @click="onCreate('copy')" class="w-80" style="width: 80px">复制</n-button>
                        <n-button ghost @click="onCreate('new')" class="w-80" style="width: 80px">新建草稿</n-button>
                    </n-button-group>
                </div>
            </n-form-item>
            <!-- queryParams -->
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
            <!-- helloTxt -->
            <n-form-item path="helloTxt" label="招呼语">
                <n-input v-model:value="modelRef.helloTxt" type="textarea" style="height: 8rem" />
            </n-form-item>
            <!-- wt2Cookie -->
            <n-form-item path="wt2Cookie" label="Cookie（wt2）">
                <n-input
                    v-model:value="modelRef.wt2Cookie"
                    placeholder="登陆后手动获取 Cookie 中的 wt2 部分"
                    type="textarea"
                />
            </n-form-item>
            <!-- targetNum -->
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
            <!-- timeout -->
            <n-form-item
                path="timeout"
                label="超时（秒）"
                feedback="选择器、资源等待时间。出现资源、选择器问题，建议增大后重试"
            >
                <n-slider v-model:value="modelRef.timeout" :step="1" :min="5" :max="30" style="width: 280px" />
            </n-form-item>
            <!-- 精确筛选条件 -->
            <!-- salaryRange -->
            <n-form-item
                path="salaryRange"
                label="薪酬区间（K）"
                :feedback="`自定义薪酬，若岗位薪酬区间与此区间有交集，则匹配。岗位薪酬枚举：${salaryEnumStr}`"
            >
                <n-slider
                    v-model:value="modelRef.salaryRange"
                    :min="0"
                    :max="100"
                    range
                    :step="1"
                    style="width: 280px"
                />
            </n-form-item>
            <!-- bossActiveType -->
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
            <!-- keySkills -->
            <n-form-item path="keySkills" label="精确技能筛选" feedback="岗位详情需匹配此处的每一个技能">
                <n-select
                    v-model:value="modelRef.keySkills"
                    filterable
                    multiple
                    tag
                    :options="keySkills.map(curr => ({ label: curr, value: curr }))"
                />
            </n-form-item>
            <!-- excludeCompanies -->
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
            <!-- excludeJobs -->
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
            <!-- headless -->
            <n-form-item path="headless" label="观察打招呼过程">
                <n-switch v-model:value="modelRef.headless" :checked-value="false" unchecked-value="new" />
            </n-form-item>
            <!-- 按钮组 -->
            <n-form-item>
                <div class="flex flex-column align-end" style="width: 100%">
                    <div class="btn-group flex justify-end" style="width: 100%">
                        <n-button @click="saveListToStorage" class="mr-20" style="width: 80px">保存</n-button>
                        <n-button type="primary" :disabled="btnDisabled" @click="onSubmit">启动任务</n-button>
                    </div>
                    <!-- <div class="help mt-8">若配置有变动（名称、别名除外），“保存”、“启动任务”会尝试新建一个配置</div> -->
                </div>
            </n-form-item>
        </n-form>
        <!-- 服务日志 -->
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
        <!-- 模态框-配置管理 -->
        <n-modal :show="showManageModal" :auto-focus="false">
            <n-card style="width: 900px" title="管理" size="huge" :bordered="false" role="dialog" aria-modal="true">
                <n-data-table
                    :bordered="true"
                    :single-line="true"
                    :columns="columns"
                    :data="confList"
                    :pagination="{
                        pageSize: 10,
                    }"
                    :row-class-name="
                        row => {
                            if (row._active) return 'light';
                            return '';
                        }
                    "
                />
                <div class="flex justify-center">
                    <n-button @click="showManageModal = !showManageModal" class="mr-20">关闭</n-button>
                    <n-button type="primary" @click="saveListToStorage">保存</n-button>
                </div>
            </n-card>
        </n-modal>
    </div>
</template>
<script setup>
import { ref, watch, computed, onMounted, nextTick, h } from 'vue';
import { useMessage, NInput, NButton } from 'naive-ui';
import { isFake, deepClone, request, notifyMe } from '@/util';
const message = useMessage();
import {
    keySkills,
    excludeJobs,
    excludeCompanies,
    bossActiveOptions,
    defaultValues,
    SALARY_RANGE_MAP,
    EXPERIENCE_MAP,
    DEGREE_MAP,
    cityList,
} from './enums';

// 普通数据
const rules = {
    queryParams: [
        {
            required: true,
            trigger: ['blur', undefined], // trigger 包含 undefined，触发 formRef.value?.validate
            validator(rule, value) {
                let reg = new RegExp('https://www.zhipin.com/web/geek/job');
                if (!reg.test(value)) {
                    return new Error('应为 BOSS 网址');
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

// 配置数据
let activeConfIndex = ref(0);
let confList = ref([]);
let confSelectOpts = ref([{ label: '暂无配置', value: 0 }]);
watch(
    confList,
    (newConfList, oldConfList) => {
        confSelectOpts.value = newConfList.map((curr, index) => ({
            label: curr._alias || curr._name || '',
            value: index,
        }));
        if (!confSelectOpts.value.length) {
            confSelectOpts.value = [{ label: '暂无配置', value: 0 }];
        }

        let index = newConfList.findIndex(curr => curr._active);
        activeConfIndex.value = index > -1 ? index : 0;
    },
    { deep: true }
);
function onConfChange(currIndex) {
    confList.value.forEach((curr, index) => {
        if (index === currIndex) {
            curr._active = true;
        } else {
            delete curr._active;
        }
    });

    modelRef.value = confList.value[currIndex];
}

// 表单
const formRef = ref(null);
const modelRef = ref(getMod());

// 状态
const showManageModal = ref(false);
let waitAutoSendHello = ref(false);
const btnDisabled = computed(() => {
    return requiredNames.some(key => isFake(modelRef.value[key])) || waitAutoSendHello.value;
});
// 薪水
const salaryMin = ref(0);
const salaryMax = ref(100); // 10-20K，可以把 15-30K 筛选出来
let salaryEnumStr = computed(() => {
    if (salaryMin.value === 0 && salaryMax.value === 100) {
        return '无';
    } else {
        return `[${salaryMin.value}, ${salaryMax.value}]`;
    }
});
// 服务日志
const messageList = ref([]);
const messageListStr = computed(() => {
    return messageList.value.join('\n');
});

// 表格
const columns = [
    {
        title: '名称',
        key: '_name',
        className: 'long',
    },
    {
        title: '别名',
        key: '_alias',
        className: 'long',
        render(row, index) {
            return h(NInput, {
                value: row._alias || '',
                clearable: true,
                placeholder: '显示优先级高于名称',
                onUpdateValue(v) {
                    let list = confList.value;

                    let found = list.find(curr => curr._id === row._id);
                    if (found) found._alias = v;
                },
            });
        },
    },
    {
        title: '操作',
        key: 'opts',
        render(row, index) {
            return h(
                NButton,
                {
                    type: 'warning',
                    size: 'small',
                    quaternary: true,
                    onClick: () => {
                        let list = confList.value;
                        list.splice(
                            list.findIndex(curr => curr._id === row._id),
                            1
                        );
                        if (confList.value.length) {
                            if (!confList.value.find(curr => curr._active)) {
                                confList.value[0]._active = true;
                                modelRef.value = confList.value[0];
                            }
                        } else {
                            modelRef.value = deepClone(defaultValues);
                        }

                        // saveListToStorage();
                    },
                },
                { default: () => '删除' }
            );
        },
    },
];

// LifeCycle
onMounted(() => {
    initWs();
    onQueryParamsChange(modelRef.value.queryParams);
});

// Method
function initWs() {
    // 此处 new ，触发一次 wss connection
    const ip = import.meta.env.BOSS_IP || 'localhost';
    const port = import.meta.env.BOSS_PORT || '3000';
    let stopKeyWords = ['执行出错', '顺利完成'];

    let wss = new WebSocket(`ws://${ip}:${port}`);
    wss.onopen = function (event) {
        console.log('WebSocket is open now.');
    };
    wss.onmessage = async event => {
        messageList.value.push(event.data);

        let foundKey = stopKeyWords.find(key => event.data.includes(key));
        if (foundKey) {
            notifyMe(foundKey, {
                body: event.data,
            });
        }

        await nextTick();
        // textareaElRef 是组件内的 ref
        if (serverLogsNode.value?.textareaElRef.scrollHeight) {
            serverLogsNode.value.textareaElRef.scrollTop = serverLogsNode.value?.textareaElRef.scrollHeight;
        }
    };
}
function getMod() {
    let list = JSON.parse(localStorage.getItem('zhipin-robot') || '[]');

    if (!Array.isArray(list)) list = [list]; // 兼容之前只有一个配置

    if (!list.length) {
        let newConf = paddCustomData(deepClone(defaultValues));
        newConf._active = true;
        confList.value = [newConf];
        return newConf;
    }

    let activeIndex = 0;
    for (let i = 0; i < list.length; i++) {
        let obj = list[i];
        paddCustomData(obj);

        if (obj._active) activeIndex = i;

        list[i] = {
            ...defaultValues,
            ...obj,
        };
    }
    if (!list.find(curr => curr._active)) {
        list[0]._active = true;
    }

    confList.value = list;

    return confList.value[activeIndex];
}

function onCreate(type = 'new') {
    let data = type === 'new' ? deepClone(defaultValues) : deepClone(modelRef.value);
    delete data._alias;

    paddCustomData(data, {
        resetId: true,
        resetName: true,
    });

    confList.value.forEach(curr => delete curr._active);
    data._active = true;
    if (type === 'copy') {
        data._name = `${data._name}_1`;
    }

    confList.value.unshift(data);
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
        message.error('验证失败');
        return false;
    }

    let sendData = modelRef._value;
    paddCustomData(sendData, {
        resetId: false,
        resetName: true,
    });

    saveListToStorage();

    waitAutoSendHello.value = true;
    await request({
        url: '/api/send',
        method: 'POST',
        data: sendData,
    });
    waitAutoSendHello.value = false;

    // if (res?.code !== 0) return message.error(res?.msg || '');
}
function saveListToStorage() {
    localStorage.setItem('zhipin-robot', JSON.stringify(confList.value));
}

function onQueryParamsChange(data) {
    if (!data) return;

    let [min = 0, max = 100] = getSalary(data);
    salaryMin.value = min;
    salaryMax.value = max;

    let currConf = confList.value[activeConfIndex.value];

    let newName = getConfName(data);

    if (newName) currConf._name = newName;
}
function getSalary(queryParams = '') {
    let { salary } = getMsgFormLink(queryParams, ['salary']);
    return SALARY_RANGE_MAP[salary] || [];
}
/** 生成 _id; 若没有 _name，生成它们 */
function paddCustomData(target, { resetId = false, resetName = false } = {}) {
    let uid = Math.ceil(Math.random() * 1000);

    if (!target._id || resetId) target._id = uid;
    if (!target._name || resetName) {
        target._name = getConfName(target.queryParams) || `配置_${uid}`;
    }

    return target;
}
function getConfName(link = '') {
    if (!link) return '';

    // 从链接获取名称, 覆盖默认名称
    let {
        query = '未填',
        city = '城市不限',
        degree = '学历不限',
        experience = '经验不限',
        salary = '薪资不限',
    } = getMsgFormLink(link, ['query', 'city', 'degree', 'experience', 'salary']);

    city = cityList.find(curr => curr.code === +city)?.name || city;

    let experienceStr = experience
        .split(',')
        .map(val => EXPERIENCE_MAP[val])
        .join(',');
    let salaryStr = SALARY_RANGE_MAP[salary]?.map(str => `${str}K`)?.join('-'); // 薪水只能选一个

    let degreeStr = degree
        .split(',')
        .map(val => DEGREE_MAP[val])
        .join(',');

    let nameFormLink = [query, city, degreeStr, experienceStr, salaryStr].filter(str => str).join('_');

    return nameFormLink;
}
function getMsgFormLink(link, list = []) {
    let params = new URL(decodeURIComponent(link)); // 直接 UrlSearchParam 获取不到中文

    return list.reduce((obj, key) => {
        let result = params.searchParams.get(key);
        obj[key] = result === null ? '' : result;
        return obj;
    }, {});
}
</script>
<style scoped>
@import './Main.css';
</style>
