const ip = import.meta.env.BOSS_IP || 'localhost';
const port = import.meta.env.BOSS_PORT || '3000';
const host = `http://${ip}:${port}`;

function isFake(target) {
    return [undefined, null, ''].includes(target);
}

function deepClone(target) {
    return JSON.parse(JSON.stringify(target));
}

function debounce(fn, delay = 300) {
    let timeout;

    return function (...args) {
        clearTimeout(timeout);

        timeout = setTimeout(() => {
            fn.apply(this, args);
        }, delay);
    };
}

/**
 * 显示浏览器通知
 * @param {String} title 通知标题
 * @param {*} param1 { dir(文字方向), body(消息主题), icon(通知图标) requireInteraction(不自动关闭通知) }
 */
async function notifyMe(
    title = '通知标题',
    { dir = 'auto', body = '消息体', icon = '', requireInteraction = false } = {}
) {
    // 检查浏览器是否支持
    if (!window.Notification) return console.log('浏览器不支持通知');

    // 请求用户权限来显示通知; 用户同意授权，则显示通知
    let permission = await Notification.requestPermission();
    if (permission === 'granted') {
        new Notification(title, {
            dir,
            body,
            icon,
            requireInteraction,
        });
    }
}

// post 用 formData 不恰当，formData 是用来传送文件的；
function request({
    url = '',
    method = 'GET',
    headers = {},
    data = {},
    onprogress = () => {},
    timeout = 0,
    ontimeout = () => {},
}) {
    return new Promise((resolve, reject) => {
        let xhr = new XMLHttpRequest();
        Object.keys(headers).forEach(key => {
            xhr.setRequestHeader(key, headers[key]);
        });
        xhr.upload.onprogress = onprogress;
        xhr.timeout = timeout;
        xhr.ontimeout = ontimeout;

        let sendData = null;
        let dataKeys = Object.keys(data);
        if (method === 'GET') {
            sendData = `${url}?`;
            let list = [];
            dataKeys.forEach(key => {
                list.push(`${key}=${data[key]}`);
            });
            sendData += `${list.join('&')}`;
        } else {
            // sendData = new FormData();
            // dataKeys.forEach(key => {
            //   sendData.append(key, data[key]);
            // });
            sendData = JSON.stringify(data);
        }

        if (!url.startsWith('http')) {
            url = `${host}${url}`;
        }

        xhr.open(method, url);
        xhr.send(sendData);
        xhr.onload = () => {
            let res = JSON.parse(xhr?.response || '{}');
            if ((xhr.status >= 200 && xhr.status < 300) || xhr.status === 304) {
                return resolve(res);
            } else {
                return resolve(res);
            }
        };
    });
}

export { isFake, deepClone, debounce, request, notifyMe };
