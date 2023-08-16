// 默认：不投递大厂、屏蔽部分外包公司关键词
const keySkills = ['vue', 'react', 'react native', 'webpack', 'vite', 'fluter', 'uniapp', '小程序', 'h5', 'ts'];

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
const excludeCompanies = defaultExcludeCompanies.map(name => ({ label: name, value: name }));
// 工作名屏蔽
const excludeJobs = [
  'Flutter',
  'flutter',
  'shopify',
  'React',
  'react',
  'RN',
  'React Native',
  'PHP',
  'WordPress',
  'Front End',
  'App',
  'Angular',
  'angular',
  '混合',
  'uniapp',
  '游戏',
  '派遣',
  '外包',
];

const defaultValues = {
  queryParams:
    'https://www.zhipin.com/web/geek/job?query=%E5%89%8D%E7%AB%AF%E5%BC%80%E5%8F%91%E5%B7%A5%E7%A8%8B%E5%B8%88&city=101280600&experience=104&degree=203&salary=405&page=1',
  // salaryMin: 10,
  // salaryRange: [
  //   {
  //     min: 10,
  //     max: 20,
  //   },
  // ],
  keySkills: [],
  targetNum: 2,
  helloTxt:
    '面试官您好！看到贵司在前端工程师的岗位，而我过往经历中，有1年小程序开发经验，2年管理端开发经验，我的过往经历跟贵司的匹配度是非常高的。而我目前已经离职，最快到岗时间是一周以内，非常期待贵司能给我一个面试机会，展示一下自己。若您对我的微简历有什么疑问，我随时在线解答。',
  wt2Cookie: '',
  excludeCompanies: defaultExcludeCompanies,
  excludeJobs: ['外包', '派遣'],
  headless: false,
};

const salaryRangeMap = {
  402: [0, 3],
  403: [3, 5],
  404: [5, 10],
  405: [10, 20],
  406: [20, 50],
  407: [50, Infinity],
};

export { keySkills, defaultExcludeCompanies, excludeCompanies, excludeJobs, defaultValues, salaryRangeMap };
