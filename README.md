# MBA Learning OS · V1.1
面向 Fudan IMBA 的个人学习工作台。优先减少寻找资料、切换页面、复习和整理的时间。

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
