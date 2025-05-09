const STORE_KEY = 'zihpin-robot';

// 默认：不投递大厂、屏蔽部分外包公司关键词
const keySkills = [
    'vue',
    'react',
    'react native',
    'webpack',
    'vite',
    'fluter',
    'uniapp',
    '小程序',
    'h5',
    'ts',
    'java',
    'mysql',
    'redis',
    'docker',
    'spring',
    'mybatis',
];

const defaultExcludeCompanies = [
    '阿里巴巴',
    '蚂蚁金服',
    '字节跳动',
    '今日头条',
    '网易',
    '腾讯',
    '百度',
    'shopee',
    '快手',
    '深圳腾娱互动科技',
    '人才',
    '人力资源',
    '信息技术',
];
const excludeCompanies = defaultExcludeCompanies.map((name) => ({
    label: name,
    value: name,
}));
// 工作名屏蔽
const excludeJobs = [
    'flutter',
    'shopify',
    'react',
    'RN',
    'react native',
    'php',
    'WordPress',
    'Front End',
    'App',
    'angular',
    'java',
    '混合',
    'uniapp',
    '游戏',
    '派遣',
    '外包',
];
const excludeJobNames = JSON.parse(JSON.stringify(excludeJobs));
const bossActiveOptions = [
    '1个月内活跃',
    '3个月内活跃',
    '半年内活跃',
    '无限制',
];

let defaultValues = {
    queryParams: 'https://www.zhipin.com/web/geek/job',
    helloTxt:
        '面试官您好！看到贵司在前端工程师的岗位，而我过往经历中，有1年小程序开发经验，2年管理端开发经验，我的过往经历跟贵司的匹配度是非常高的。而我目前已经离职，最快到岗时间是一周以内，非常期待贵司能给我一个面试机会，展示一下自己。若您对我的微简历有什么疑问，我随时在线解答。',
    wt2Cookie: '',
    targetNum: 2,
    timeout: 5,
    keySkills: [],
    salaryRange: [0, 100],
    bossActiveType: '3个月内活跃',
    excludeCompanies: defaultExcludeCompanies,
    excludeJobs: ['外包', '派遣'],
    excludeJobNames: ['外包', '派遣'],
    headless: false,
};

const SALARY_RANGE_MAP = {
    402: [0, 3],
    403: [3, 5],
    404: [5, 10],
    405: [10, 20],
    406: [20, 50],
    407: [50, 100], // slider 不支持 [50, Infinity]，写死 100
};
// experience=108,102,101,103,104,105,106,107
const EXPERIENCE_MAP = {
    108: '在校生',
    102: '应届生',
    101: '经验不限',
    103: '一年以内',
    104: '1-3年',
    105: '3-5年',
    106: '5-10年',
    107: '10年以上',
};
// degree=209,208,206,202,203,204,205
const DEGREE_MAP = {
    209: '初中及以下',
    208: '中专/中技',
    206: '高中',
    202: '大专',
    203: '本科',
    204: '硕士',
    205: '博士',
};

// 只包括热门的几个城市
const cityList = [
    {
        code: 100010000,
        name: '全国',
    },
    {
        code: 101010100,
        name: '北京',
    },
    {
        code: 101020100,
        name: '上海',
    },
    {
        code: 101280100,
        name: '广州',
    },
    {
        code: 101280600,
        name: '深圳',
    },
    {
        code: 101210100,
        name: '杭州',
    },
    {
        code: 101030100,
        name: '天津',
    },
    {
        code: 101110100,
        name: '西安',
    },
    {
        code: 101190400,
        name: '苏州',
    },
    {
        code: 101200100,
        name: '武汉',
    },
    {
        code: 101230200,
        name: '厦门',
    },
    {
        code: 101250100,
        name: '长沙',
    },
    {
        code: 101270100,
        name: '成都',
    },
    {
        code: 101180100,
        name: '郑州',
    },
    {
        code: 101040100,
        name: '重庆',
    },
    {
        code: 101280300,
        name: '惠州',
    },
    {
        code: 101281700,
        name: '中山',
    },
];
const syncConf = [
    {
        label: '招呼语',
        value: 'helloTxt',
    },
    {
        label: 'Cookie（wt2）',
        value: 'wt2Cookie',
    },
    {
        label: '打招呼数量',
        value: 'targetNum',
    },
    {
        label: '超时（秒）',
        value: 'timeout',
    },
    {
        label: '薪酬区间（K）',
        value: 'salaryRange',
    },
    {
        label: ' BOSS 活跃时间筛选',
        value: 'bossActiveType',
    },
    {
        label: '精确技能筛选',
        value: 'keySkills',
    },
    {
        label: '屏蔽公司关键词',
        value: 'excludeCompanies',
    },
    {
        label: '屏蔽岗位名关键词',
        value: 'excludeJobNames',
    },
    {
        label: '屏蔽岗位详情关键词',
        value: 'excludeJobs',
    },
    {
        label: '观察打招呼过程',
        value: 'headless',
    },
];

export {
    STORE_KEY,
    keySkills,
    excludeCompanies,
    excludeJobs,
    excludeJobNames,
    bossActiveOptions,
    defaultValues,
    SALARY_RANGE_MAP,
    EXPERIENCE_MAP,
    DEGREE_MAP,
    cityList,
    syncConf,
};
