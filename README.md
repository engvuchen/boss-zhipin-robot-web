# boss-zhipin-robot-web

> 希望能在现在的大环境下帮助你找到一份满意的工作。

Node.js 依赖：16.3+

1. `vite`：14.18+, 16+
2. `rollup@3.27.0`
   1. warn - `required: { node: '>=14.18.0', npm: '>=8.0.0' }`
3. `@puppeteer/browsers@1.4.6`
   1. warn - `required: { node: '>=16.3.0' }`
   2. `??=`：16+。[参考](https://node.green/#ES2021-features-Logical-Assignment-----basic-support)

## 使用

1. 启动项目 `npm run init-dev`；
   - 初次安装依赖，因 server、client 安装依赖的所需时间不一致，server 可能较早启动，5173 打开白屏；后续等 client 启动完成，手动刷新 5173 网页即可。
   - 安装依赖成功后，仅需 `npm run dev` 启动服务；

2. 获取查询参数：在 [BOSS 岗位市场页面](https://www.zhipin.com/web/geek/job)进行筛选后，筛选参数会同步到地址栏，复制这个地址栏链接。

![查询参数](https://engvu.oss-cn-shenzhen.aliyuncs.com/e05a3a8b9f32aa0bec24b49431540e03.webp)

3. 获取个人 Cookie：
1. 先在 BOSS 直聘[登陆页](https://www.zhipin.com/web/user/?ka=header-login)登入个人账号； 2. 使用 Chrome 控制台工具， 切换到 Application（应用），点击“存储- Cookie”，获取个人 cookie（wt2）；

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

3. 初次大量打招呼，日志提示“X 秒内未获取到小窗输入框”

原因：BOSS 打招呼的方式有 2 种，一种是小窗沟通，另一个种是沟通列表。在投递数量比较少时，打招呼方式是第一种。当初次大量打招呼，打招呼方式从“小窗”过渡到“沟通列表”，但此时程序选择器还是“小窗”，无法获取到“小窗”中的输入框。此时重启项目即可，输入框选择器会被重置。

# 运行效果

1. 丰富的筛选条件：打招呼数量、薪酬区间、BOSS 活跃时间、精确技能筛选、屏蔽公司关键词、屏蔽岗位关键词；

2. 支持定制部分无头浏览器表现：超时时间、是否观察打招呼过程；

3. 支持管理切换打招呼配置，不同城市、学历等无需自行管理

4. 支持静默运行任务：任务出错提供系统通知，方便及时重启任务

![运行效果](https://engvu.oss-cn-shenzhen.aliyuncs.com/bcda4b51813d18fac909da0484f823b8.webp)

# 开启错误通知

不观察浏览器运行（防止被同事窥屏），通过系统通知及时发现、解决报错问题，提高打招呼效率；

1. chrome 允许网页通知；

![允许通知](https://engvu.oss-cn-shenzhen.aliyuncs.com/77c2dc68ceb0692329914fd111cdf9f8.webp)

2. 需在系统设置中开启 chrome 通知，以下是 window11 开启的例子：

![window开启通知](https://engvu.oss-cn-shenzhen.aliyuncs.com/bc8ea785614f4f1e574e491eecc9403b.webp)

## 免责声名

本开源项目（以下简称“本项目”）为自由、开放、共享的非赢利性项目，由开发者（以下简称“我们”）所创建并维护。我们不对使用本项目产生的任何后果承担任何责任。

本项目的代码仅供参考学习，不保证其准确性、完整性或实用性。开发者不承担因使用本项目引发的任何直接或间接损失或损害的法律责任。

本项目中可能包含第三方组件或库，这些组件或库的使用可能受到其他许可证的限制。使用者应该自行了解并遵守相关许可证的规定，并对因使用这些组件或库而引发的任何法律责任自负。

本项目中可能包含链接到其他网站或资源的链接。这些链接仅供参考。 我们不对这些网站或资源的可用性、准确性、完整性、合法性或任何其他方面的信息负责。使用者应该自行决定是否信任这些链接，并对因使用这些链接而引发的任何法律责任自负。

我们保留随时更改本免责声明的权利。使用者应该定期查看本免责声明，以了解任何变更。如果使用者继续使用本项目，则视为同意遵守新的免责声明。
