// 默认：不投递大厂、屏蔽部分外包公司关键词
const keySkills = ['vue', 'react', 'react native', 'webpack', 'vite', 'fluter', 'uniapp', '小程序', 'h5', 'ts'];

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

export { keySkills, defaultExcludeCompanies, excludeCompanies, excludeJobs };
