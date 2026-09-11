# MBA Learning OS · V1.1
面向 Fudan IMBA 的个人学习工作台。优先减少寻找资料、切换页面、复习和整理的时间。

## 启动预览
需要 Node.js 22.13+。解压后进入包含 package.json 的 mba-learning-os 文件夹，再运行：

```bash
npm ci
npm run dev
```

打开终端显示的 Local 地址，通常是 http://localhost:3000 。保持终端开启；Control+C 停止预览。
不要在用户主目录直接运行 npm run dev。Mac 也可以运行包内的“启动本地预览.command”，脚本会自动进入项目文件夹。
如果系统不允许双击运行脚本，使用上述终端命令即可。

## 发布到 GitHub Pages
1. 新建仓库，把 mba-learning-os **里面的文件**放到仓库根目录。package.json 和 .github 必须在根目录。
2. 推送至 main 分支。
3. Settings → Pages → Build and deployment → Source 选择 GitHub Actions。
4. Actions 中的 Deploy public site to GitHub Pages 会执行测试、内容校验、构建和链接检查，然后发布。
5. 在 Pages 或 Actions 部署结果中打开站点地址。

项目仓库自动使用 /仓库名/ 路径；用户名.github.io 仓库使用根路径。部署在自定义域名根目录时，在 workflow 的 build job 中设置 PAGES_BASE_PATH: ""。
本次没有替你创建远程仓库或发布网站。

本地验收：
```bash
npm run check
```

模拟项目子路径：
```bash
GITHUB_REPOSITORY=example/mba-learning-os npm run build:github
GITHUB_REPOSITORY=example/mba-learning-os npm run check:export
```

build:github 输出 out/，由 GitHub Actions 上传，无需手工把 out/ 提交到源码仓库。
当前主栈沿用 React / Next-compatible Vinext；GitHub Pages 使用 Next 的静态导出。没有更换已有框架或新增数据库。

## 本次改动
- 全站顶部一键中文 / English 切换，刷新后记住选择，桌面与手机均可用。切换界面和学习流程提示；课程名称、概念正文、公式与用户笔记保留原文，概念页另有中文解释。
- 统一字体、字号、对比度与 8px 基础间距。正文 16px，常用标签 14px，次要信息 12–13px。
- 桌面常驻导航、可展开的九科课程树；手机底部导航和完整课程抽屉。
- 独立 /sitemap 页面，三个空间与所有课程、Lecture、概念都能直接跳转。
- 九门课程独立页面，均有 Lectures、概念、资料、考前复习和资源分区。
- 每个 Concept 有独立页面和返回关联 Lecture 的链接。
- 搜索支持课程、Lecture、概念、公式和中英文关键词；支持 Escape、键盘焦点与关闭按钮。
- 专注复习一次显示一题；支持课程和状态过滤、下一题、稍后、已理解、撤销。
- 复习进度以稳定题目 ID 保存，在首页、课程、Lecture 和复习页共用。
- 本机 Markdown 笔记可保存；备份包含笔记和复习状态，兼容原版经济学题目进度。
- 删除虚构的课表、百分比、笔记数量与无来源的战略复习题。学习示例明确标注。
- 提供 Mac 启动脚本与仓库根路径 / 子路径部署检查。

## 实际产品状态
这是**公开目录 + 示例学习内容 + 本机学习记录**版本。
- 九门课程结构齐全；Managerial Economics 的一个 Lecture 是流程示例，不是从教师课件提取的真实课堂记录。
- 未添加课程的页面明确显示空状态。
- 课表、真实教学内容、Assignment、Deadline 尚未配置。
- 受限课堂身份验证、白名单、教师课件下载尚未接入。没有模拟登录，也没有共享密码。
- Draft → Class-ready → Public-ready 的发布工作流尚未实现。笔记不会自动发布。
- JSON 是当前公开数据来源；Markdown 模板用于整理草稿，尚未自动编译进站点。
- 本机笔记和复习状态不跨设备同步，不受账号隔离保护。共用同一浏览器的人可能看到这些记录。
- “稍后复习”是手动队列，不声称已实现间隔重复调度。

## 内容与安全
公开数据：content/public/catalog.json。UI 与搜索只引用该目录的公开数据。
教师课件继续保存在项目外的本地课程文件夹，本压缩包没有携带 PDF、PPT 或私人笔记。
不要将真实课件放到 public/ 或公共仓库里。GitHub Pages 不提供本文要求的班级鉴权和受保护下载。

content/class、content/private、restricted-assets 的真实文件默认被 Git 忽略。公开安装包只包含这些目录的说明文件。
validate 是基础内容与边界校验，不是完整的权限审计。启用真实 Classroom 前需配置身份网关和受控文件存储，并单独测试未登录和越权访问。

新建草稿：
```bash
npm run new:lecture -- managerial-economics 2 quantitative
```
草稿进入 content/private，需人工审核后再接入公开数据。公开打包校验遇到真实私密文件会失败；不要为通过校验而公开这些内容。

## 常用命令
| 命令 | 用途 |
| --- | --- |
| npm run dev | 本地预览 |
| npm test | 进度迁移与备份、部署路径测试 |
| npm run validate | 内容引用、ID 与公开边界校验 |
| npm run lint | 代码检查 |
| npm run build:github | GitHub Pages 静态导出 |
| npm run check:export | 检查导出页面、站内链接、锚点和静态资源 |
| npm run check | 一次运行完整公开版检查 |
| npm run build | 现有 Vinext / Worker 兼容构建 |

设计依据与验收结果见 docs/V1.1-REVIEW.md。
