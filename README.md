# 芒音 · 好生意，好帮手

四款产品按指定顺序展示：**称重收银 → 门店收银 → 芒音记账 → 移动经营**。

纯 HTML / CSS / JavaScript，全部资源本地化，无框架、无构建步骤、无第三方 CDN。支持电脑、平板、手机；包含产品导航、扫码弹窗、应用切换、滚动动效和减少动态效果偏好。可直接双击 index.html 浏览。

## 视觉与响应式

橘色主视觉、蓝色收银与移动经营、红色记账。桌面采用大标题与双栏产品展示；平板和手机切换为纵向布局，导航自动折叠，下载区与二维码跟随屏幕宽度适配。

## 本地预览

在项目根目录运行：

    python3 -m http.server 4173 --directory html

访问 http://localhost:4173 。

## 发布到 GitHub Pages

### 方式一：在当前 Flutter 仓库发布

项目根目录已加入 .github/workflows/website-pages.yml，**只上传 html 目录**。

1. 将 html 目录和这个 workflow 文件一起提交并推送到 main 分支。
2. 打开 GitHub 仓库 **Settings → Pages → Build and deployment → Source**，选择 **GitHub Actions**。
3. 在 **Actions → Deploy Mangyin website to Pages → Run workflow** 手动运行一次；以后 main 分支的网站变更会自动部署。
4. 部署成功后，在 Pages 设置或 workflow 的 deployment 环境中查看网站地址。

如果默认分支不是 main，请修改 workflow 的 branches。

### 方式二：独立网站仓库

将 html 文件夹内的全部文件上传到新仓库的**根目录**（保留 .nojekyll）。在 **Settings → Pages** 选择 **Deploy from a branch → main → / (root)**，保存即可。此方式无需复制根项目的 workflow。

资源全部使用相对路径，同时支持 username.github.io 和 username.github.io/repository/，无需配置 base URL。

## Windows 称重版

称重产品区域与下载中心提供独立的 Windows 下载入口；切换到其他产品时，下载中心自动隐藏 Windows 区域，避免下载错版。设备版继续使用原蒲公英二维码与链接。

- 文件：Mangyin_Scale_Setup.exe
- 文件大小：72,889,146 字节（69.5 MiB）
- SHA-256：b8733688c6095ce7a76353ecb19d573a1a4809fde3f50632dc276c37e7a63ec3
- 安装包通过独立 GitHub Release 附件分发，无需存入网站源码目录。
- Windows 链接同时保留在 index.html 中，关闭 JavaScript 也可以下载；products.js 记录安装包元数据。

更新安装包时，发布新的 Release 附件，并同步更新 products.js 与 index.html 的链接、大小和校验值。

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
