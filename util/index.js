const fs = require('fs');
const fsPromise = require('fs/promises');
const path = require('path');
const { exec } = require('child_process');

const mimes = {
  css: 'text/css',
  less: 'text/css',
  gif: 'image/gif',
  html: 'text/html',
  ico: 'image/x-icon',
  jpeg: 'image/jpeg',
  jpg: 'image/jpeg',
  js: 'text/javascript',
  json: 'application/json',
  pdf: 'application/pdf',
  png: 'image/png',
  svg: 'image/svg+xml',
  swf: 'application/x-shockwave-flash',
  tiff: 'image/tiff',
  txt: 'text/plain',
  wav: 'audio/x-wav',
  wma: 'audio/x-ms-wma',
  wmv: 'video/x-ms-wmv',
  xml: 'text/xml',
};
// 解析资源类型
function parseMime(url = '') {
  let extName = path.extname(url);
  extName = extName ? extName.slice(1) : 'unknown';
  return mimes[extName] || '';
}
/**
 * 获取静态资源内容
 * @param  {object} ctx koa上下文
 * @param  {string} 静态资源目录在本地的绝对路径
 * @return  {string} 请求获取到的本地内容
 */
async function getContent(ctx, fullStaticPath) {
  let reqPath = path.join(fullStaticPath, ctx.url);
  // 判断请求路径是否为存在目录或者文件
  let content = '404 Not Found';
  let exist = fs.existsSync(reqPath);
  if (!exist) return content;

  //判断访问地址是文件夹还是文件
  let stat = await fsPromise.stat(reqPath).catch(e => e);
  if (stat.isDirectory()) {
    //如果为目录，则渲读取目录内容
    content = dir(ctx.url, reqPath);
  } else if (stat.isFile()) {
    // 如果请求为文件，则读取文件内容
    content = await fsPromise.readFile(reqPath);
  }
  return content;

  // if (!exist) {
  //   //如果请求路径不存在，返回404
  //   content = '404 Not Found';
  // } else {

  // }

  // if (!exist) {
  //   //如果请求路径不存在，返回404
  //   content = '404 Not Found';
  // } else {
  //   //判断访问地址是文件夹还是文件
  //   let stat = fs.statSync(reqPath);
  //   if (stat.isDirectory()) {
  //     //如果为目录，则渲读取目录内容
  //     content = dir(ctx.url, reqPath);
  //   } else {
  //     // 如果请求为文件，则读取文件内容
  //     content = await fs.readFile(reqPath);
  //   }
  // }
}
/**
 * 封装目录内容
 * @param  {string} url 当前请求的上下文中的url，即ctx.url
 * @param  {string} reqPath 请求静态资源的完整本地路径
 * @return {string} 返回目录内容，封装成HTML
 */
async function dir(url, reqPath) {
  // 遍历读取当前目录下的文件、子目录
  let contentList = await walk(reqPath);

  console.log('url', url);

  // let html = `<ul>`;
  // for (let [index, item] of contentList.entries()) {
  //   html = `${html}<li><a href="${url === '/' ? '' : url}/${item}">${item}</a>`;
  // }
  // html = `${html}</ul>`;

  const html = [
    '<ul>',
    ...contentList.map(item => {
      return `<li><a href="${url === '/' ? '' : url}/${item}">${item}</li>`;
    }),
    '</ul>',
  ].join('\n');

  return html;
}
/**
 * 遍历读取目录内容（子目录，文件名）
 * @param  {string} reqPath 请求资源的绝对路径
 * @return {array} 目录内容列表
 */
async function walk(reqPath) {
  let files = await fs.readdir(reqPath);

  let dirList = [];
  let fileList = [];
  for (let i = 0, len = files.length; i < len; i++) {
    let file = files[i];
    // let itemArr = item.split('.');
    // let itemMime = itemArr.length > 1 ? itemArr[itemArr.length - 1] : 'undefined';

    const filePath = path.join(reqPath, file);
    const fileStats = await fs.stat(filePath);

    if (fileStats.isDirectory()) {
      dirList.push(files[i]);
    } else {
      fileList.push(files[i]);
    }
  }

  let result = dirList.concat(fileList);

  return result;
}

function openUrl(url) {
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

module.exports = {
  parseMime,
  getContent,
  dir,
  walk,
  openUrl,
  handleQueryStr,
  parsePostData,
};
