const fs = require('fs');
const Koa = require('koa');
const logger = require('koa-logger');
// const koaBody = require('koa-body');
const router = require('@koa/router')();
const WebSocket = require('ws');

const { main: autoSayHello, logs } = require('boss-zhipin-robot-core');
// const WebSocketApi = require('./socket');

const isDev = process.env.NODE_ENV !== 'production';

const app = new Koa();
let wss;
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
router.get('/open-ws', ctx => {
  // wss = new WebSocket.Server({ port: 3000, path: '/socket' });
  wss = new WebSocket.Server({ server });
  // wss = new WebSocket('ws://127.0.0.1:3000/socket');
  ctx.body = { code: 0, msg: 'ok' };
});
router.post('/send', async ctx => {
  let postData = await parsePostData(ctx);
  postData.queryParams = handleQueryStr(postData.queryParams); // string => obj

  console.log('🔎 ~ file: app.js:48 ~ postData:', postData);

  await autoSayHello(postData);

  logs.push = function mutator(...args) {
    console.log('logs', args);
    wss.send(`${args}`, err => {
      if (err) console.log('🔎 ~ file: socket.js:16 ~ err:', err);
    });
    [].push.apply(this, args);
  };

  ctx.body = { code: 0, msg: 'ok' };
});

app.use(router.routes());
const server = app.listen(3000); // todo

function handleQueryStr(url) {
  let [, queryStr] = url.split('?');
  // xx=11&b=222
  let queryObj = {};
  queryStr.split('&').map(currStr => {
    let [key, val] = currStr.split('=');
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
