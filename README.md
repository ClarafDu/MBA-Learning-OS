# MBA Learning OS · V1.4.0

面向 Fudan IMBA 的学生学习工作台：更少翻找、更清楚的安排、随时记录。

## 本版先看这里

一级导航只保留两条功能线：Schedule 集中课程、作业 Deadline 与考试时间；Map 集中课程、知识点、课件入口与私人笔记。
Map 按“课程—章节—概念—框架 / 案例”组织本地 IMBA 课件与笔记，支持课程切换、概念定位和全局搜索。课程与知识点继续保留中英双语，自由文本翻译降级为 Google 翻译辅助入口。
Schedule 已提供班级 Deadline 发布入口和 Realtime 代码，但账号、数据库与班级成员名单尚未在远端开通；当前私人内容仍保存在本机。详见 [版本验收与缺口](docs/V1.4.0-RELEASE.md)。

## 本地预览

需要 Node.js 22.13+。在本目录（包含 package.json）运行：

```bash
npm ci
npm run dev
```

或在 Mac 双击「启动本地预览.command」。打开终端给出的地址；保持终端开启。不要在用户主目录运行 npm run dev。

## 更新 GitHub Pages

保持你现有的发布方式：Settings → Pages → Source = GitHub Actions。
把包内 mba-learning-os **里面的文件**更新到仓库根目录，package.json 和 .github/workflows/deploy-pages.yml 必须在根目录，不能多嵌套一层。
Finder 的 Command+Shift+. 可以显示 .github 隐藏目录；网页上传容易漏掉它。保留已创建的 deploy-pages.yml。
你确认发布后再提交到 main；该提交会触发 Actions。不要把完整 IMBA 文件夹、课程 PDF/PPT 或个人备份上传。

本版已修复 vite.config.ts 对 .openai/hosting.json 的硬依赖。该文件可以不存在；不需为 GitHub Pages 手工补一个环境配置。
Next 静态导出由 build:github 完成，自动按仓库名设置 basePath。你的仓库 ClarafDu/MBA-Learning-OS 对应 /MBA-Learning-OS/。

```bash
GITHUB_REPOSITORY=ClarafDu/MBA-Learning-OS npm run check
```

产物为 out/，由 GitHub Actions 上传。不需要手工提交 out/；也不要把 Pages Source 改成 branch 来直接部署未构建的源代码。

## 云端与权限

请先确认云端项目，再按 [backend/README.md](backend/README.md) 配置。前端只能配置 publishable key。服务端密钥绝不能进 GitHub。
公开：通用知识地图和审核后的基础课程/考试时间。班级：核验成员可看的课件、课堂记录与要求。个人：随想、个人总结、错题和私人提醒。
没有老师后台、多人协同编辑或自动公开功能。原始课件不随包发布。

## 日历导入

在日历页可添加真实日程，也可下载 JSON 格式模板。模板日期只是演示，须替换为真实课表。
导入 .ics 到系统日历是快照，后续日期变更需重新导出；系统可能提示更新或产生重复，建议导入独立 IMBA 日历并检查提醒。
不承诺手机浏览器绕过系统确认或直接写入原生日历。

## 数据保留

未登录：新版数据在本浏览器存储；旧版课程笔记/复习数据原样保留。更换浏览器、清除存储前先备份。
「账号与同步」可导出新版工作台；My OS 的旧版备份用于早期本机笔记和复习数据。
连接云端登录后可主动迁移本机与旧版记录，不会自动把共用电脑上的笔记并入账号。
备份含个人内容，不应上传公共仓库；文件备份只保存受保护路径，不转移文件权限。

## 开发与验收

- npm test：单元测试。
- npm run lint：代码检查。
- npm run validate：公开内容/知识关系与受限文件校验。
- npm run build:github：Next GitHub Pages 静态构建。
- npm run check:export：所有静态站内链接、锚点、资源和子路径检查。
- npm run check：完整公开版检查。
- npm run build：保留的 Vinext/Worker 兼容构建。

本项目保留现有 React / Next / Vinext 架构。不要同时在同一目录运行 Vinext dev 和 Next build，它们会重写同一个 .next/types；执行生产验收时先停止本地预览。
产品旧稿与早期脑图保留在 docs/，其中 V1.2 草案不是当前功能完成证明。
