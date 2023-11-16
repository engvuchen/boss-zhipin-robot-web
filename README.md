# boss-zhipin-robot-web

> 希望能在现在的大环境下帮助你找到一份满意的工作。

node.js 依赖：14.18+, 16+。

## 使用

1. 启动项目 `npm run init-dev`；
   - 初次安装依赖，因 server、client 安装依赖的所需时间不一致，server 可能较早启动，5173 打开白屏；后续等 client 启动完成，手动刷新 5173 网页即可。
   - 安装依赖成功后，仅需 `npm run dev` 启动服务；

2. 获取查询参数：在 [BOSS 岗位市场页面](https://www.zhipin.com/web/geek/job)进行筛选后，筛选参数会同步到地址栏，复制这个地址栏链接。

![查询参数](https://engvu.oss-cn-shenzhen.aliyuncs.com/e05a3a8b9f32aa0bec24b49431540e03.webp)

3. 获取个人 Cookie：
1. 先在 BOSS 直聘[登陆页](https://www.zhipin.com/web/user/?ka=header-login)登入个人账号；
   2. 使用 Chrome 控制台工具， 切换到 Application（应用），点击“存储- Cookie”，获取个人 cookie（wbg）；

![获取个人Cookie](https://engvu.oss-cn-shenzhen.aliyuncs.com/7a185a08a64782df63119eb61b0ab966.webp)

## 调试

项目包含服务端工程、网页端工程（web 目录），调试时需分别安装依赖、分别启动项目；

1. 先进入 web 目录，安装依赖 `npm i`，然后执行 `npm run dev`；
2. 根目录执行 `npm i`，然后执行 `node app.js`；
3. 以上流程简化成 `npm run init-dev`

以下是指令列表，启用格式都是：`npm run script-name`（bash 终端）

| 指令         | 服务端下载依赖 | 服务端启动 | 网页端下载依赖 | 网页端启动 |
| ------------ | -------------- | ---------- | -------------- | ---------- |
| `init-dev`   | 🟩             | 🟩         | 🟩             | 🟩         |
| `dev`        | ⬜️            | 🟩         | ⬜️            | 🟩         |
| `init-start` | 🟩             | 🟩         | ⬜️            | ⬜️        |
| `start`      | ⬜️            | 🟩         | ⬜️            | ⬜️        |

> 注意：`dev`、`start` 使用的端口不同（3000、5173），`localStorage` 保存的位置不同。从 `start` 切换 `dev`，需重新填写一次表单。

## 已知问题

1. `puppeteer` 安装失败。尝试使用 `cnpm` 安装或设置`npm`到本地的代理端口（ `npm config set proxy http://proxy_host:port`）；
2. BOSS 设置
 - 简历可见；
 - 禁用默认招呼语，否则只会发送默认招呼语给 HR。

下面的例子是在网页端右上角禁用招呼语：

![image-20231116030223834](https://engvu.oss-cn-shenzhen.aliyuncs.com/347d0cf1d9614701c0f2f18dd92796b7.webp)

![image-20231116030240089](https://engvu.oss-cn-shenzhen.aliyuncs.com/b0ec5a6078483d90285a5bd334390f8e.webp)

## 免责声名

本开源项目（以下简称“本项目”）为自由、开放、共享的非赢利性项目，由开发者（以下简称“我们”）所创建并维护。我们不对使用本项目产生的任何后果承担任何责任。

本项目的代码仅供参考学习，不保证其准确性、完整性或实用性。开发者不承担因使用本项目引发的任何直接或间接损失或损害的法律责任。

本项目中可能包含第三方组件或库，这些组件或库的使用可能受到其他许可证的限制。使用者应该自行了解并遵守相关许可证的规定，并对因使用这些组件或库而引发的任何法律责任自负。

本项目中可能包含链接到其他网站或资源的链接。这些链接仅供参考。 我们不对这些网站或资源的可用性、准确性、完整性、合法性或任何其他方面的信息负责。使用者应该自行决定是否信任这些链接，并对因使用这些链接而引发的任何法律责任自负。

我们保留随时更改本免责声明的权利。使用者应该定期查看本免责声明，以了解任何变更。如果使用者继续使用本项目，则视为同意遵守新的免责声明。
