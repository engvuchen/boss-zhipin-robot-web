const fs = require('fs');
const http = require('http');
const Koa = require('koa');
const logger = require('koa-logger');
// const koaBody = require('koa-body');
const router = require('@koa/router')();
const { WebSocket } = require('ws');

const { main: autoSayHello, logs } = require('boss-zhipin-robot-core');

const isDev = process.env.NODE_ENV !== 'production';

const app = new Koa();
app.use(logger());
// todo 可以搞一个中间件
app.use(async (ctx, next) => {
  ctx.set('Access-Control-Allow-Origin', '*');
  ctx.set(
    'Access-Control-Allow-Headers',
    'Content-Type, Content-Length, Authorization, Accept, X-Requested-With , yourHeaderFeild'
  );
  ctx.set('Access-Control-Allow-Methods', 'PUT, POST, GET, DELETE, OPTIONS');
  if (ctx.method == 'OPTIONS') {
    ctx.body = 0;
  }
  await next();
});

router.get('/', ctx => {
  ctx.set('content-type', 'text/html');
  if (isDev) {
    console.log('return html');
    ctx.redirect('http://127.0.0.1:5173');
  } else {
    // ctx.body = fs.readFileSync('index.html');
  }
});
router.post('/send', async ctx => {
  let postData = await parsePostData(ctx);
  postData.queryParams = handleQueryStr(postData.queryParams); // string => obj

  await autoSayHello(postData);

  ctx.body = { code: 0, msg: 'ok' };
});
app.use(router.routes());

let wss = new WebSocket.Server({ clientTracking: false, noServer: true });
const server = http.createServer(app.callback());
// const server = http.createServer(app);
// 服务器触发了 upgrade 事件，才触发 socket；upgrade 是由客户端请求触发的吗？
server.on('upgrade', function (request, socket, head) {
  wss.handleUpgrade(request, socket, head, function (ws) {
    wss.emit('connection', ws, request);
  });
});
server.listen(3000);
// wss.once('connection', function (ws) { });
let subscribeLogs;
wss.on('connection', function (ws, request) {
  console.log('成功连接');
  subscribeLogs = txt => {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(txt);
    }
  };
});
logs.push = function mutator(txt) {
  if (typeof subscribeLogs !== 'function') {
    return console.error('客户端未连接，请刷新页面');
  }

  subscribeLogs(txt); // 利用闭包实现手动发消息
  // [].push.apply(this, [txt]);
};

function handleQueryStr(url) {
  let [, queryStr] = url.split('?');
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
        // let parseData = parseQueryStr(postData);

        // console.log('🔎 ~ file: app.js:82 ~ postData:', postData, typeof postData);

        let parseData = JSON.parse(postData);
        resolve(parseData);
      });
    } catch (err) {
      reject(err);
    }
  });
}
// 将POST请求参数字符串解析成JSON
// 表单数据和 application/json 不一样？
function parseQueryStr(queryStr) {
  let queryData = {};
  let queryStrList = queryStr.split('&');
  console.log(queryStrList);

  for (let [index, queryStr] of queryStrList.entries()) {
    let itemList = queryStr.split('=');
    queryData[itemList[0]] = decodeURIComponent(itemList[1]);
  }
  return queryData;
}
function sleep(time = 1000) {
  return new Promise((resolve, reject) => {
    setTimeout(resolve, time);
  });
}
