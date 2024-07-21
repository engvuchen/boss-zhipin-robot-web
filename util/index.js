const { exec } = require('child_process');

let opened = false;
function openUrlOnce(url) {
    if (!opened) {
        opened = true;

        switch (process.platform) {
            case 'darwin':
                exec(`open ${url}`);
                break;
            case 'win32':
                exec(`start ${url}`);
                break;
            default:
                exec(`xdg-open ${url}`);
                break;
        }
    }
}
function handleQueryStr(url) {
    let [, queryStr = ''] = url.split('?');
    // a=11&b=222
    let queryObj = {};
    queryStr.split('&').map(currStr => {
        let [key, val] = currStr.split('=');

        switch (key) {
            case 'page':
                val = Number(val);
                break;
            case 'query':
                val = decodeURIComponent(val);
                break;
            default:
                break;
        }
        queryObj[key] = val;
    });
    return queryObj;
}
// 获取 post body 数据；预设是 formData 传送过来的
function parsePostData(ctx) {
    return new Promise((resolve, reject) => {
        try {
            let postData = '';
            ctx.req.addListener('data', data => {
                postData += data;
            });
            ctx.req.addListener('end', function () {
                let parseData = JSON.parse(postData);
                resolve(parseData);
            });
        } catch (err) {
            reject(err);
        }
    });
}

function sleep(time = 1000) {
    return new Promise((resolve, reject) => {
        setTimeout(resolve, time);
    });
}

// ANSI 颜色映射。一般底色正确，文字颜色受具体终端影响
const ansiColors = {
    bgBlue: '\x1b[44m', // 蓝色
    bgGreen: '\x1b[42m', // 绿色
    bgRed: '\x1b[41m', // 红色
    // bgYellow: '\x1b[43m', // 黄色
    txtWhite: '\x1b[37m', // 文本颜色为白色。定死。
    bgBlueTxtWhite: '\x1b[44m\x1b[37m',
    bgGreenTxtWhite: '\x1b[42m\x1b[37m',
    bgRedTxtWhite: '\x1b[41m\x1b[37m',
    reset: '\x1b[0m', // 重置样式
};
let color = Object.keys(ansiColors).reduce((obj, key) => {
    if (key === 'reset') return obj;
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
/** 最低以 node.js 16.3+ 运行 */
function checkNodeVersion() {
    let version = process.versions.node;
    let [major, minor] = version.split('.').map(str => +str);
    return major > 16 || (major === 16 && minor >= 3);
}

module.exports = {
    openUrlOnce,
    handleQueryStr,
    parsePostData,
    sleep,
    color,
    debounce,
    checkNodeVersion,
};
