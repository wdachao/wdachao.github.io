# 芒音 · 好生意，好帮手

四款产品按指定顺序展示：**称重收银 → 门店收银 → 芒音记账 → 移动经营**。

纯 HTML / CSS / JavaScript，全部资源本地化，无框架、无构建步骤、无第三方 CDN。支持电脑、平板、手机；包含产品导航、扫码弹窗、应用切换、滚动动效和减少动态效果偏好。本地预览使用下方 HTTP 服务；最新发布信息会从现有 OSS 读取。

## 视觉与响应式

橘色主视觉、蓝色收银与移动经营、红色记账。桌面采用大标题与双栏产品展示；平板和手机切换为纵向布局，导航自动折叠，下载区与二维码跟随屏幕宽度适配。

## 本地预览

在网站文件根目录运行：

    python3 -m http.server 4173

访问 http://localhost:4173 。

## 正式官网与发布

正式官网使用 `https://www.mydcep.top/`，网站及 Windows 安装包均由阿里云杭州 OSS Bucket `mangyin-cash-weighing-2026` 托管。首页备案号为 `浙ICP备2022006025号-12`，链接到工信部备案查询网站。

OSS 静态网站默认首页为 `index.html`。将本站的 `index.html`、`app.js`、`products.js`、`styles.css`、`device-previews.css` 与 `assets/` 按原目录上传至 Bucket 根目录；不要上传 `README.md`、GitHub 的 `CNAME` 或 Git 目录。网页文件使用正确的 MIME 类型，不设置 `Content-Disposition: attachment`；EXE 则保留附件下载行为。更新页面时保留 `download/Mangyin_Scale_Setup.exe`。

阿里云 DNS 中，`www` 与根域名 `@` 的 CNAME 均指向 `mangyin-cash-weighing-2026.oss-cn-hangzhou.aliyuncs.com`；OSS 同时绑定 `www.mydcep.top` 和 `mydcep.top`，因此不带 www 的地址也能访问。GitHub 域名所有权 TXT 记录可以保留。

HTTPS 使用免费的 Let's Encrypt RSA 证书，由阿里云数字证书管理服务托管并部署至 OSS 的两个域名。当前证书有效期至 **2027-02-10**，首次采用手动 HTTP 校验，**未配置自动续期**；请在到期前重新签发并更新阿里云及 OSS 证书。证书及私钥保存在本机 `/Users/zhoubing/.codex/mydcep-ssl/config/`，不得提交 Git 或上传至公开 Bucket。

## GitHub Pages 站点

`wdachao/wdachao.github.io` 仓库的 `main` 分支根目录发布到 `https://wdachao.github.io/`，使用 GitHub 默认域名，不添加 `CNAME` 文件。保留远端域名验证文件。GitHub 同时用于网站源码版本管理；OSS 发布与 GitHub Pages 发布是两次独立操作，更新公共页面时需同步发布。

资源使用相对路径，安装包由 OSS 提供，不放入 GitHub 仓库。

## Windows 称重版

称重产品区域与下载中心提供独立的 Windows 下载入口；切换到其他产品时，下载中心自动隐藏 Windows 区域，避免下载错版。设备版继续使用原蒲公英二维码与链接。

- 文件：Mangyin_Scale_Setup.exe
- 版本、更新日期、SHA-256：由 OSS 的 `releases/weighing-windows.js` 提供，禁止手填源码版本代替已发布版本。
- 安装包通过 OSS 的版本固定路径分发；`download/Mangyin_Scale_Setup.exe` 为兼容直链，不存入网站源码目录。
- 页面不展示安装包体积；Windows 下载按钮打开确认弹窗后跳转到 OSS。

更新安装包使用 `python apk.py windows`，详见 `../tool/PUBLISH_WINDOWS.md`。发布信息按产品/平台位于 `releases/*.js`，初次部署需把此目录一并上传 OSS。官网每次打开从 OSS 读取发布信息，新旧域名共用；Windows 只有发布信息校验成功才启用下载，版本、日期、SHA-256 和下载地址一同切换。四个 Android 选择按钮及下载卡片显示对应版本/日期；Android 与 Windows 分开显示。

## Android 版本自动同步

公开网站仓库使用 `.github/workflows/sync-android-releases.yml`，约每 10 分钟运行 `tool/sync_android_releases.py`，通过蒲公英官方 API 查询四款 Android 应用。校验包名、平台、版本和发布时间后，仅在内容变化时更新现有 OSS 的 `releases/*-android.js`；查询失败保留该应用上一次成功的发布信息。网页不内置 API Key 或写死的 Android 版本。

GitHub Actions 的 Repository Secrets 需要配置 `PGYER_API_KEY`、`OSS_ACCESS_KEY_ID`、`OSS_ACCESS_KEY_SECRET`。凭证使用现有专用 OSS 发布账号，不上传凭证文件或 `apk.py` 到公开仓库。公共仓库的标准托管运行器免费，OSS 仍按原有存储和请求计费，无需 FC。GitHub 定时调度可能延迟；公开仓库连续 60 天无活动时可能自动停用定时任务，可在 Actions 中重新启用并手动运行。

源码仓库也保留同一工作流，部署时只在公开网站仓库启用定时同步，避免重复执行。顶部四个产品按钮与下载区共用选中状态；点击只切换对应下载卡片、二维码和版本，不滚动页面。

## 下载地址

四个地址由用户提供的二维码解码取得，二维码原图保存在 assets 中。

| 对应项目 | 展示名称 | 蒲公英下载页 |
| --- | --- | --- |
| cash_weighing | 芒音称重收银 | https://www.pgyer.com/mangyincheng |
| cash_register | 芒音收银台 | https://www.pgyer.com/mangyinshouyintai |
| flutter_bookkeeping | 芒音记账 | https://www.pgyer.com/mangyinjizhang |
| flutter_senmang | 芒音收银（移动经营） | https://www.pgyer.com/sujietong |

下载区和弹窗数据集中在 products.js。修改链接时，同时更新 index.html 中对应产品的直接下载链接及默认下载卡片；更换二维码请替换 assets 下同名文件，保证二维码内容和链接一致。

## 维护

- index.html：产品介绍与界面示意；styles.css：响应式样式；device-previews.css：设备示意绘制；app.js：导航、弹窗与演示交互。
- assets：四款应用的实际图标、原始二维码、网站 favicon。
- 产品文案依据各项目 README 与页面功能编写。称重版名称添加“称重”用于区分应用形态，移动版沿用代码中的“芒音收银”。
- 设备界面为网页绘制的功能示意，金额、商品与报表均为示例，不表示真实交易数据；并非应用截图。
- 网站不收集信息，不包含登录、支付、API 凭证或后台接口。平台支持、安装方式和可用版本以各蒲公英下载页为准。
