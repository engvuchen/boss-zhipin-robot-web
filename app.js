const fs = require('fs/promises');
const http = require('http');
const Koa = require('koa');
const logger = require('koa-logger');
const router = require('@koa/router')();
const { WebSocket } = require('ws');
const { main: autoSayHello, logs } = require('boss-zhipin-robot-core');

const { cross, handleStaticResource } = require('./middleware');
const { openUrlOnce, handleQueryStr, parsePostData } = require('./util');

const isDev = process.env.NODE_ENV !== 'production';

const app = new Koa();

app.use(logger());
// 处理跨域
app.use(cross);

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

// 保底处理静态资源
app.use(handleStaticResource);

// ws 发消息
let wss = new WebSocket.Server({ clientTracking: false, noServer: true });
const server = http.createServer(app.callback());
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
};

let { BOSS_IP: ip = 'localhost', BOSS_PORT: port = 3000 } = process.env;
server.listen(port);
if (ip === 'localhost') {
    openUrlOnce(`http://localhost:${isDev ? 5173 : port}`);
}
