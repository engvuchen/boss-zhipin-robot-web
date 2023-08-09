// 默认：不投递大厂、屏蔽部分外包公司关键词
const defaultExcludeCompanies = [
  '阿里巴巴',
  '字节跳动',
  '今日头条',
  '网易',
  '腾讯',
  '百度',
  'Shopee',
  '快手',
  '深圳腾娱互动科技',
  '人才',
  '人力资源',
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

export { defaultExcludeCompanies, excludeCompanies, excludeJobs };
