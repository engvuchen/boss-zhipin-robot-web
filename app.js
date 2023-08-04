const Koa = require('koa');
const logger = require('koa-logger');
// const koaBody = require('koa-body');
const fs = require('fs');
const router = require('@koa/router')();
const isDev = (process.env.NODE_ENV = 'dev');

const app = new Koa();
app.use(logger());

router.get('/', ctx => {
  ctx.set('content-type', 'text/html');
  if (iDev) {
    ctx.redirect('http://127.0.0.1:5173');
  }
  // ctx.body = fs.readFileSync('index.html');
});
router.post('/sent', ctx => {
  // ctx.set('content-type', 'text/html');
  // ctx.body = fs.readFileSync('index.html');
  ctx.body = { status: 200, msg: 'ok' };
});

app.use(router.routes());
app.listen(3000);
