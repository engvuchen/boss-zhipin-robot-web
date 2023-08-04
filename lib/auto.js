/**
 * 🟩 每天固定时间执行任务，在 BOSS 上自动打招呼指定数量的岗位；
 * ⬜️ cookie 过期，发邮件通知修改 cookie;
 *
 * 细节：
 * 1. 公司下存在多个职位，名字可能是一样的，但岗位要求不一样；
 * 1.1 区分是否投递过，简单方法就是详情页的“继续沟通”文案；
 * 2. 选择器拿不到，可能是出现“安全问题”弹窗；$$、$、$eval、page.click、
 * 3. arms-retcode.aliyuncs.com/r.png 这个请求 window 本地也会失败
 */

const fs = require('fs/promises');
const util = require('node:util');
const exec = util.promisify(require('node:child_process').exec);

const puppeteer = require('puppeteer-extra');
const stealthPlugin = require('puppeteer-extra-plugin-stealth');
puppeteer.use(stealthPlugin());

const sendMail = require('./mail');

let browser;
let marketPage;
let targetNum = 2; // 30个需大概4m30s
let hasPost = [];
let hasScreenShot = false;
// 前端开发工程师 / 工作经验 1-3年 / 薪资待遇 10-20K / 学历要求 本科
let queryParams = {
  query: '前端开发工程师',
  city: 101280600,
  experience: 104,
  degree: 203,
  salary: 405,
  page: 1,
};
// 2023.07.18 登陆，2023.07.29过期
const cookies = [
  {
    name: 'wt2',
    value: 'Dr9ZfrlaPSVCjDQLcBfVFhX_4ZILXavPzqlfIUbIq4PwFC5RZByquDerB8TnH9CbiDGaITX7dSvyL80KcDReFvg~~',
    domain: '.zhipin.com',
    httpOnly: true,
    secure: true,
  },
  {
    name: 'wbg',
    value: '0',
    domain: '.zhipin.com',
    httpOnly: true,
    secure: true,
  },
];
let excludesCompanies = [
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
let excludesJobs = [
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
];
const helloTxt = `您好，我叫陈志强，19 年惠州学院本科毕业，有 3 年管理端开发经验，主要负责微信游戏内部管理系统的开发、维护。
除了日常业务开发外，我对制作提效工具比较感兴趣，产出 vscode 代码片、vscode 自动补全插件、生成页面模板的一些 npm 命令包等。
详情可以查看我的简历，如果合适希望进一步沟通。`;

start();
// 读取已投递公司存储，执行 main；
async function start() {
  let originHasPostContent = await fs.readFile('./hahPostCompany.txt', 'utf-8');

  try {
    console.log('自动打招呼进行中, 本次目标:', targetNum, '; 请耐心等待');

    await main(queryParams.page);

    console.log('✨任务顺利完成！');
  } catch (error) {
    console.log('🚀 ~ file: index.js:51 ~ error:', error);

    if (marketPage?.screenshot) {
      console.log('监测到任务执行失败，开始截图');
      await marketPage?.screenshot({
        path: 'mail-error.png',
        // fullPage: true,
        clip: {
          x: 0,
          y: 0,
          width: 1980,
          height: 1080,
        },
      });
      await sendMail('mail-error.png', 'Node.js截图-任务失败');
      console.log('✨截图成功');
    }
  }
  if (hasPost.length) {
    let hasPostCompanyStr = [originHasPostContent, '-------', hasPost.join('\n')].join('\n');
    await fs.writeFile('./hahPostCompany.txt', hasPostCompanyStr);
  }
  await autoCommit(); // 可能有异常，提交截图
  process.exit();
}
async function main(pageNum = 1) {
  console.log('页数:', pageNum, '; 剩余目标:', targetNum);

  if (!marketPage) await initBrowserAndSetCookie();
  let marketUrl = getNewMarketUrl(pageNum); // 出现验证页，说明 puppeteer 被检测了(403)
  // marketPage.on('console', msg => console.log('PAGE LOG:', msg.text()));
  await marketPage.setRequestInterception(true);
  marketPage.on('request', async request => {
    if (request.isInterceptResolutionHandled()) return;

    let url = await request.url();
    // 无头模式才能启用
    if (url === 'https://apm-fe.zhipin.com/wapi/zpApm/actionLog/fe/common.json') {
      return request.continue({
        postData:
          '{"identity":1,"clientInfo":{"model":"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36","screen":"{"width":2560,"height":1440}"},"items":[{"action":"action_js_monitor","p":"{"appKey":"MeT5lsyaHisySUCH","time":1690855697875,"type":"responseError","pv":"/web/geek/job","uv":"rR64dJRRmJ1690855697876","from":"apmsdk","errorSig":"d41d8cd98f00b204e9800998ecf8427e"}","p2":"{"url":"https://www.zhipin.com/web/geek/job?query=%E5%89%8D%E7%AB%AF%E5%BC%80%E5%8F%91%E5%B7%A5%E7%A8%8B%E5%B8%88&city=101280600&experience=104&degree=203&salary=405&page=1"}","p3":"[]","p4":"","p5":"[{"name":"https://logapi.zhipin.com/dap/api/json","method":"GET","type":"xmlhttprequest","duration":"282.00","decodedBodySize":0,"nextHopProtocol":""},{"name":"https://logapi.zhipin.com/dap/api/json","method":"GET","type":"xmlhttprequest","duration":"104.70","decodedBodySize":0,"nextHopProtocol":""},{"name":"https://www.zhipin.com/wapi/zpgeek/businessDistrict.json?cityCode=101280600","method":"GET","type":"xmlhttprequest","duration":"95.10","decodedBodySize":12087,"nextHopProtocol":"h2"},{"name":"https://www.zhipin.com/wapi/zpCommon/data/getSubwayByCity?cityCode=101280600","method":"GET","type":"xmlhttprequest","duration":"89.50","decodedBodySize":90462,"nextHopProtocol":"h2"},{"name":"https://www.zhipin.com/wapi/zpCommon/data/industry.json","method":"GET","type":"xmlhttprequest","duration":"91.20","decodedBodySize":27147,"nextHopProtocol":"h2"},{"name":"https://www.zhipin.com/wapi/zpgeek/resume/restrict/list.json","method":"GET","type":"xmlhttprequest","duration":"83.10","decodedBodySize":60,"nextHopProtocol":"h2"},{"name":"https://img.bosszhipin.com/static/file/2022/a01kqbjd7l1655973421679.png","method":"GET","type":"img","duration":"23.10","decodedBodySize":7568,"nextHopProtocol":"h2"}]","p6":"{"os":"Mac","browser":"Chrome","ua":"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36"}","p7":"{}"}]}',
      });
    }

    request.continue();
  });

  marketPage.on('requestfailed', async request => {
    let url = await request.url();
    let headers = await request.headers();
    // let isNavigation = await request.isNavigationRequest();
    let postData = await request.postData();
    let response = await request.response();
    console.log('url', url);
    // console.log('isNavigation', isNavigation);
    console.log('postData', postData);
    console.log('headers', headers);
    console.log('response', response);
  });

  console.log('marketUrl', marketUrl);

  await marketPage.goto(marketUrl, {
    waitUntil: 'networkidle2', // 与 waitForTimeout 冲突貌似只能存在一个
    // timeout: 60000,
  });
  marketPage.waitForNavigation();
  const href = await getCurrHref(marketPage);
  console.log('🚀 ~ file: index.js:167 ~ main ~ href:', href);

  // await marketPage.waitForTimeout(3000); // taptap 没问题；但 boss 返回资源很慢-有校验
  await autoSayHello(marketPage);

  if (targetNum > 0) {
    queryParams.page = pageNum + 1;
    await main(queryParams.page);
  }
}
/** 启动浏览器，写入 cookie */
async function initBrowserAndSetCookie() {
  browser = await puppeteer.launch({
    headless: 'new', // 是否以浏览器视图调试
    // slowMo: 500, // 逻辑执行速度
    devtools: false,
    defaultViewport: null, // null 则页面和窗口大小一致
  });
  marketPage = await getNewPage();
  await marketPage.setCookie(...cookies);
}
async function autoSayHello(marketPage) {
  // 1. 获取卡片列表卡片右侧可点击区域，不投大厂、已投递
  // let cards = await marketPage.$$('li.job-card-wrapper'); // 卡片选择器
  // h3 > a，h3.innerText 可以拿到
  let jobCards = Array.from(await marketPage.$$('li.job-card-wrapper'));
  console.log('🚀 ~ file: index.js:122 ~ autoSayHello ~ jobCards:', jobCards?.length);

  let notPostJobs = await asyncFilter(jobCards, async node => {
    let jobName = await node.$eval('.job-name', node => node.innerText);
    let companyName = await node.$eval('.company-name', node => node.innerText);

    if (
      !excludesJobs.some(name => jobName.includes(name)) &&
      !excludesCompanies.some(name => companyName.includes(name))
    ) {
      node._jobName = jobName;
      node._companyName = companyName;
      return true;
    }
  });
  console.log('🚀 ~ file: index.js:132 ~ notPostJobs ~ notPostJobs:', notPostJobs?.length);

  if (hasScreenShot === false && jobCards?.length === 0) {
    // 用于 Github Action 测试
    console.log('监测到岗位列表为空，开始截图');
    await marketPage.screenshot({
      path: './mail.png',
      fullPage: true,
    });
    await sendMail();
    console.log('✨截图成功');
    hasScreenShot = true;
  }

  while (notPostJobs.length && targetNum > 0) {
    let node = notPostJobs.shift();
    if (!node) return console.error('节点捕获失败');
    await sendHello(node, marketPage);
  }
}
async function sendHello(node, marketPage) {
  await marketPage.evaluate(node => node.click(), node); // 点击公司卡片的右侧区域，打开公司详情页
  await sleep(1000); // 等待资源加载

  // 一般只会有一个详情页。打开一页，执行一个任务，然后关闭页面
  let [detailPage] = (await browser.pages()).filter(page => page.url().startsWith('https://www.zhipin.com/job_detail'));

  let communityBtn = await detailPage.$('.btn.btn-startchat');
  let communityBtnInnerText = await detailPage.evaluate(communityBtn => communityBtn.innerText, communityBtn);
  if (communityBtnInnerText.includes('继续沟通')) {
    return await detailPage.close();
  }
  communityBtn.click(); // 点击后，详情页被替换为沟通列表页
  await sleep(1500);

  // textarea 输入必须用以下方式触发，解除“发送”按钮禁用
  // 1. 找到打招呼输入框，输入内容，并触发 input 事件
  // todo 可能出现“安全问题”验证，导致选择器失效
  await detailPage.$eval(
    // 'div.edit-area > textarea', // 详情页，原弹窗的输入框
    'div.chat-conversation > div.message-controls > div > div.chat-input', // 沟通列表-输入框；出错计数：1
    (element, helloTxt) => {
      // element.value = helloTxt;
      element.innerText = helloTxt;
      element.dispatchEvent(new Event('input')); // 触发输入事件
    },
    helloTxt
  );

  // 2. 点击发送按钮
  // await detailPage.click('div.send-message');
  await detailPage.click('div.message-controls > div > div.chat-op > button');
  await sleep(2000); // 等待接口响应
  targetNum--;

  // 打印已投递公司名
  let { _companyName: companyName, _jobName: jobName } = node;
  console.log(`✅：${companyName} ${jobName}`);
  hasPost.push(`${getCurrDate()}: ${companyName} ${jobName}`);

  await detailPage.close();

  await sleep(1000); // 无意义，缓一缓
}

async function getNewPage() {
  const page = await browser.newPage();
  // await page.setViewport({ width: 1980, height: 1080 });
  return page;
}
async function getCurrHref(page) {
  let href = await page.evaluate(() => document.location.href);
  console.log('🚀 getCurrHref ~ href:', href);
  return href;
}

async function autoCommit() {
  await exec('git add --all'); // mail-error.png mail.png hahPostCompany.txt
  const { stdout, stderr } = await exec('git status');
  console.log('🚀 ~ file: index.js:286 ~ autoCommit ~ stdout, stderr :', stdout, stderr);

  if (stdout.includes('nothing to commit')) return console.log('❗无内容提交');
  await exec('git config --global user.email "1742284391@qq.com"');
  await exec('git config --global user.name "engvuchen"');
  // await exec('git add hahPostCompany.txt');
  await exec('git commit -m "U hahPostCompany"');
  await exec('git push');
  console.log('✨自动提交已投递公司记录成功！');
}
function getNewMarketUrl(pageNum) {
  if (pageNum) queryParams.page = pageNum;
  return `https://www.zhipin.com/web/geek/job?${Object.keys(queryParams)
    .map(key => `${key}=${encodeURIComponent(queryParams[key])}`)
    .join('&')}`;
}
function sleep(time = 1000) {
  return new Promise((resolve, reject) => {
    setTimeout(resolve, time);
  });
}
function getCurrDate() {
  let stamp = new Date();
  let year = stamp.getFullYear();
  let month = ('0' + (stamp.getMonth() + 1)).slice(-2);
  let date = ('0' + stamp.getDate()).slice(-2);
  let hours = ('0' + stamp.getHours()).slice(-2);
  let mins = ('0' + stamp.getMinutes()).slice(-2);
  let seconds = ('0' + stamp.getSeconds()).slice(-2);
  return `${year}年${month}月${date}日 ${hours}时${mins}分${seconds}秒`;
}
async function asyncFilter(list = [], fn) {
  const results = await Promise.all(list.map(fn)); // 并发完成
  return list.filter((_v, index) => results[index]);
}

function isError(res) {
  if (res.stack && res.message) {
    return true;
  }
  return false;
}
async function randomSleep(second = 5) {
  return await sleep(Math.ceil(Math.random() * second) * 1000);
}
function promiseQueue(list) {
  let result = [];
  return list
    .reduce((accu, curr) => {
      return accu.then(curr).then(data => {
        result.push(data);
        return result;
      });
    }, Promise.resolve())
    .catch(err => `promiseQueue err: ${err}`);
}

module.exports = main;
