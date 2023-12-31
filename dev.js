const process = require('process');
const { exec } = require('child_process');
const { color, debounce, sleep, checkNodeVersion } = require('./util');

main();

async function main() {
  /**
   * "init-dev": "(npm i && cd web && npm i) && ((cd web && npm run dev) & node app.js)",
   * "dev": "(cd web && npm run dev) & node app.js",
   * "init-start": "npm i && (cross-env NODE_ENV=production node app.js)"
   * "start": "cross-env NODE_ENV=production node app.js"
   */

  if (!checkNodeVersion()) {
    return console.log(color['bgRedTxtWhite']('ERROR') + ' Requires Node.js version 16.3+');
  }

  // npm run dev [--init]
  let tools = {};
  let taskList = [
    {
      id: 'client',
      cmd: 'npm run dev',
      options: { cwd: './web' },
      colorType: 'bgGreenTxtWhite',
    },
    {
      id: 'server',
      cmd: 'node app.js',
      colorType: 'bgBlueTxtWhite',
    },
  ];

  for (let i = 0; i < taskList.length; i++) {
    let { id, cmd, options = {}, colorType } = taskList[i];
    if (process.argv[2] === '--init') {
      cmd = `npm i && ${cmd}`;
    }
    tools[id] = { logs: [] };
    let colorPrefix = color[colorType](id);
    tools[id].showLogs = debounce(conf => {
      console.log(`${colorPrefix}\n${conf.logs.join('')}`.replace(/\n+/g, '\n'));
      conf.logs = []; // 打印后清空记录
    }, 2000);
    let event = exec(cmd, options, function (err, stdout, stderr) {
      if (err) {
        console.log(color['bgRedTxtWhite']('ERROR') + '\n' + err);
        process.exit();
      }
    });
    event.stdout.on('data', data => {
      tools[id].logs.push(data);
      tools[id].showLogs(tools[id]);
    });
    event.stderr.on('data', data => {
      tools[id].logs.push(data);
      tools[id].showLogs(tools[id]);
    });
  }
}
