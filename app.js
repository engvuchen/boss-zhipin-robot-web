const fs = require('fs/promises');
const path = require('path');
const http = require('http');
const Koa = require('koa');
const logger = require('koa-logger');
// const koaBody = require('koa-body');
const router = require('@koa/router')();
const { WebSocket } = require('ws');
const { main: autoSayHello, logs } = require('boss-zhipin-robot-core');
const { parseMime, getContent, openUrlOnce, handleQueryStr, parsePostData } = require('./util');

const isDev = process.env.NODE_ENV !== 'production';
const staticPath = 'dist';

const app = new Koa();
app.use(logger());
// todo 改为中间件
// 处理跨域
app.use(async (ctx, next) => {
    ctx.set('Access-Control-Allow-Origin', '*');
    ctx.set('Access-Control-Allow-Headers', 'Content-Type, Content-Length, Authorization, Accept');
    ctx.set('Access-Control-Allow-Methods', 'PUT, POST, GET, DELETE, OPTIONS');
    if (ctx.method == 'OPTIONS') {
        ctx.body = 0;
    }
    await next();
});

// 返回静态资源
router.get('/', async ctx => {
    ctx.set('content-type', 'text/html');
    if (isDev) {
        ctx.redirect('http://127.0.0.1:5173');
    } else {
        ctx.body = await fs.readFile(`${__dirname}/dist/index.html`);
    }
});
router.post('/api/send', async (ctx, next) => {
    let postData = await parsePostData(ctx);
    postData.queryParams = handleQueryStr(postData.queryParams); // string => obj
    postData.timeout = postData.timeout * 1000;

    await autoSayHello(postData);
    ctx.body = { code: 0, msg: 'ok' };
});
app.use(router.routes());

// 处理静态资源
app.use(async (ctx, next) => {
    if (ctx.path.startsWith('/api')) return await next();

    if (!['HEAD', 'GET'].includes(ctx.method)) {
        return await next();
    }
    let fullStaticPath = path.join(__dirname, staticPath);

    // 获取静态资源内容，文件内容，目录，或404
    let content = await getContent(ctx, fullStaticPath); // 请求到了这里没有走路由. getContent 又拼接 /dist + ctx.url，相当于所有请求都尝试找资源
    let mime = parseMime(ctx.url);
    if (mime) ctx.type = mime;
    // 输出静态资源内容
    if (mime.indexOf('image/') >= 0) {
        // 如果是图片，则用node原生res，输出二进制数据
        ctx.res.writeHead(200);
        ctx.res.write(content, 'binary');
        ctx.res.end();
    } else {
        // 其他则输出文本
        ctx.body = content;
    }

    await next();
});

let wss = new WebSocket.Server({ clientTracking: false, noServer: true });
const server = http.createServer(app.callback());
// const server = http.createServer(app);
server.on('upgrade', function (request, socket, head) {
    wss.handleUpgrade(request, socket, head, function (ws) {
        wss.emit('connection', ws, request);
    });
});

let subscribeLogs;
wss.on('connection', function (ws, request) {
    console.log('wss 成功连接'); // 不及时关闭页面，会有 2 个 websocket 连接，日志显示会失败
    subscribeLogs = txt => {
        if (ws.readyState === WebSocket.OPEN) {
            ws.send(txt);
        }
    };
});
logs.push = function monitor(txt) {
    if (typeof subscribeLogs !== 'function') {
        return console.error('客户端未连接，请刷新页面');
    }
    subscribeLogs(txt); // 利用闭包实现手动发消息
    // [].push.apply(this, [txt]);
};

let { BOSS_IP: ip = 'localhost', BOSS_PORT: port = 3000 } = process.env;

server.listen(port);
if (ip === 'localhost') {
    openUrlOnce(`http://${ip}:${isDev ? 5173 : port}`);
}
