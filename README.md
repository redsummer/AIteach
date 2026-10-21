# 知行 PanoSim 教学配套网站 V1.1

不需要安装依赖。部署文件包括 index.html、style.css、model.js、app.js、platform.js 和 assets 中被页面引用的图片、视频。可直接上传工作区中的 cloudflare-upload.zip。

## 部署

1. 在 Cloudflare 控制台打开 Workers & Pages，创建 Pages 项目。
2. 选择直接上传，上传 `cloudflare-upload.zip`。压缩包根目录必须为 index.html。
3. 设置项目名称，例如 zhixing-driving-lab，并部署。
4. 访问实际分配的 pages.dev 地址，检查页面与实验。

不要将申报书原件、密码、学生个人数据或本说明文件作为公开资源上传。

## 功能

- 项目展示（约 2 分 05 秒）、教学引导（约 4 分 54 秒）两段完整视频。
- 视频切换、教学片段定位、项目实景封面。
- 五阶段 PanoSim 导学：场景、车辆与传感器、算法、人在环、数据评价。
- 网页参数与平台核对事项说明、可下载的 PanoSim 上机任务单。

- 两种纵向交通场景和五项参数设置。
- 可播放 AEB 示意动画、速度曲线和结果。
- 三组 TTC 阈值对照、本地 50 条记录、CSV 导出。
- 页面接管反应练习。
- 30 项指导任务与实现范围说明。
- 本地反思保存、实验报告草稿下载。

## 边界

网站展示项目提供的 PanoSim 实录并提供配套导学，但网页没有实时接入 PanoSim 引擎、AI 模型或实体设备。AEB 动画与结果仍由独立的一维简化模型生成。上机任务单供人工配置核对，不是 PanoSim 原生工程或直接导入文件。

网站没有云端账号、正式评分或国家共享平台接口，没有遥测和第三方前端资源。本页计算在浏览器执行，记录与反思不会上传。数据受当前浏览器本地存储条件限制。工具名称及通用能力以官方资料为依据，校内具体版本和授权范围仍需核对。

## 视频与资料

两段视频来源为用户提供的本地 MP4，网站副本只进行了 MP4 faststart 重封装，没有重新编码，原始文件未修改。图片为视频帧提取。播放器使用原生 controls、预载元信息，不自动播放。

视频单文件约 10.3 MiB 和 17.1 MiB，低于 Cloudflare Pages 目前的 25 MiB 单资源限制。部署时务必包含 assets；总压缩包大于 25 MiB 不等同于单文件超限。参考：https://developers.cloudflare.com/pages/platform/limits/

官方资料已在网页中提供链接：

- https://www.panosim.com/h-col-104.html
- https://www.panosim.com/en/h-nd-40.html
- https://www.panosim.com/h-col-181.html

截图与文字根据项目视频整理，未将视频中的教学助手、自动评价等介绍当作网页已实现功能。

## 校验

使用 Node.js 执行 `node test-model.cjs` 可验证碰撞、延迟、附着、控制变量等核心数值行为。

本次已使用独立无登录状态的 Edge 测试桌面及 390px 手机布局、视频选择和时间跳转、标签键盘操作、任务单下载与三组参数对照。未产生 JavaScript 运行错误。
