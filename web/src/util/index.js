function isFake(target) {
  return [undefined, null, ''].includes(target);
}
function request({
  url = '',
  method = 'GET',
  headers = {},
  data = {},
  onprogress = () => {},
  timeout = 1000,
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
      sendData = new FormData();
      dataKeys.forEach(key => {
        sendData.append(key, data[key]);
      });
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
export { isFake, request };
