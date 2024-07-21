const fs = require('fs');
const fsPromise = require('fs/promises');
const path = require('path');

const staticPath = 'dist';

async function handleStaticResource(ctx, next) {
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
        // 如果是图片，则用 node 原生 res，输出二进制数据
        ctx.res.writeHead(200);
        ctx.res.write(content, 'binary');
        ctx.res.end();
    } else {
        // 其他则输出文本
        ctx.body = content;
    }

    await next();
}
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

    // 判断访问地址是文件夹还是文件
    let stat = await fsPromise.stat(reqPath).catch(e => e);
    if (stat.isDirectory()) {
        //如果为目录，则渲读取目录内容
        content = dir(ctx.url, reqPath);
    } else if (stat.isFile()) {
        // 如果请求为文件，则读取文件内容
        content = await fsPromise.readFile(reqPath);
    }
    return content;
}
/**
 * 若访问的是目录，返回一个自定义的 html（目录视图）
 * @param  {string} url 当前请求的上下文中的url，即ctx.url
 * @param  {string} reqPath 请求静态资源的完整本地路径
 * @return {string} 返回目录内容，封装成HTML
 */
async function dir(url, reqPath) {
    // 遍历读取当前目录下的文件、子目录
    let contentList = await walk(reqPath);

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

module.exports = handleStaticResource;
