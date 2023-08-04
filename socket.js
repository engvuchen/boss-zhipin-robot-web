/**
 * 打开一个 WebSocket，然后 send 数据
 */

function main(wss) {
  wss.on('connection', function connection(ws) {
    // ws.on('message', function incoming(message) {
    //   console.log('received: %s', message);
    // });
    ws.send('something');
  });
}

module.exports = main;

// const WebSocket = require('ws');

// function main() {
//   const wss = new WebSocket('ws://localhost:3000/socket');
//   wss.on('open', function () {
//     console.log('[CLIENT] socket open');
//   });
//   // messageHandler
//   wss.on('message', function (message) {
//     // console.log(`[SERVER] Received: ${message}`);
//     wss.send(`[SERVER]: ${message}`, err => {
//       if (err) console.log('🔎 ~ file: socket.js:16 ~ err:', err);
//     });
//   });
//   wss.on('connection', function (ws) {
//     console.log(`[SERVER] connection()`);
//   });
// }
