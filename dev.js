const process = require('process');
const { exec } = require('child_process');

/**
 * "init-dev": "(npm i && cd web && npm i) && ((cd web && npm run dev) & node app.js)",
 * "dev": "(cd web && npm run dev) & node app.js",
 * "init-start": "npm i && (cross-env NODE_ENV=production node app.js)"
 * "start": "cross-env NODE_ENV=production node app.js"
 */

// npm run dev [--init]
let clientCmd = 'npm run dev';
let severCmd = 'node app.js';

console.log('args', process.argv);

if (process.argv[3] === 'init') {
  clientCmd = `npm i && ${clientCmd}`;
  severCmd = `npm i && ${severCmd}`;
}

let clientLogs = [];
let serverLogs = [];

let client = exec('npm run dev', { cwd: './web' }, function (err, stdout, stderr) {
  if (err) console.log(err);
});
let server = exec('node app.js', { stdio: 'inherit' }, function (err, stdout, stderr) {
  if (err) console.log(err);
});

client.stdout.on('data', data => {
  clientLogs.push(data);
  showLogs(clientLogs, 'client');
});
server.stdout.on('data', data => {
  serverLogs.push(data);
  showLogs(serverLogs, 'server');
});

// 延迟打印 log。简单场景可以用
let showLogs = debounce((logs, type) => {
  let colorType = 'bgGreenTxtWhite';
  if (type === 'server') {
    colorType = 'bgBlueTxtWhite';
  }
  console.log(`${color[colorType](type)} ${logs.join('').replace(/\n+/g, '\n')}`);
});
// ANSI 颜色映射
const ansiColors = {
  bgBlue: '\x1b[44m', // 蓝色 #617e4e
  bgGreen: '\x1b[42m', // 绿色 #4d4d10
  // bgYellow: '\x1b[43m', // 黄色
  txtWhite: '\x1b[37m', // 文本颜色为白色。定死。
  bgBlueTxtWhite: '\x1b[44m\x1b[37m',
  bgGreenTxtWhite: '\x1b[42m\x1b[37m',
  reset: '\x1b[0m', // 重置样式
};
let color = Object.keys(ansiColors).reduce((obj, key) => {
  obj[key] = str => `${ansiColors[key]}${str}${ansiColors.reset}`;
  return obj;
}, {});

function debounce(fn, delay = 1000) {
  let timer;
  return function (...args) {
    if (timer) clearTimeout(timer);
    timer = setTimeout(fn.bind(null, ...args), delay);
  };
}
