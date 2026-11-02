# MBA Learning OS · V1.7.0

面向 Fudan IMBA 的学生学习工作台：更少翻找、更清楚的安排、随时记录。

## 本版先看这里

一级导航只保留两条功能线：Schedule 集中课程、作业 Deadline 与考试时间；Map 集中课程、知识点、课件入口与私人笔记。首页优先回答“现在最需要关注什么”，Deadline 默认聚焦逾期及未来 7 天。
Map 按“课程—章节—概念—框架 / 案例”组织本地 IMBA 课件与笔记，支持课程切换、概念定位和全局搜索。课程与知识点继续保留中英双语，自由文本翻译降级为 Google 翻译辅助入口。
当前私人内容仍保存在本机；公开数据继续由审核后的本地课程资料生成。详见 [V1.7.0 版本说明](docs/V1.7.0-RELEASE.md) 与 [竞品分析](docs/PRODUCT-BENCHMARK-2026-09-28.md)。

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

## 会计自学二级页面与 Sitemap

会计学习室位于 `/MBA-Learning-OS/accounting/`，从首页、辅助导航、会计课程页和站点地图进入。独立会计网站继续保留。

- `accounting/learn/<知识点ID>/` 是可刷新、可分享的真实静态页面，预渲染中英讲解，不依赖 iframe。
- `/sitemap/` 提供可浏览的课程树；`/sitemap.xml` 列出真实页面 URL，包含70个会计知识点，不包含哈希路由或私人记录页面。
- 会计数据沿用原站的浏览器存储键。同一 HTTPS 域名、同一浏览器内可沿用原会计记录；不会自动并入 MBA 工作台的笔记，也没有新增数据库。
- `integrations/accounting/` 是经过核对的会计代码快照；`origin.json` 标明来源提交。更新独立会计网站后，执行 `npm run sync:accounting -- /absolute/path/to/accounting-learning`，再运行完整检查。
- `build:github` 先构建现有 Next 页面，再导出会计页面和 XML sitemap；使用现有 GitHub Actions 发布流程。
- GitHub 项目站点的 `robots.txt` 位于项目子路径，无法代替域名根目录的 robots.txt；可直接使用完整 `sitemap.xml` 地址提交给搜索引擎。是否收录取决于搜索引擎。

本地查看生产版：先执行 `GITHUB_REPOSITORY=ClarafDu/MBA-Learning-OS npm run build:github`，再以 `/MBA-Learning-OS/` 路径挂载静态 `out/` 目录。Next 开发服务器只服务其原生页面，会计独立导出页需使用生产静态预览。
