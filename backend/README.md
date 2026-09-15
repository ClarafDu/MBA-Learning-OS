# V1.2.1 云端接入（尚未在远端执行）

本包公开页面与本机保存可独立使用。账号、跨设备同步、班级文件和自由文本 AI 翻译，必须完成以下配置并验收后才算上线。

1. 明确授权使用哪个 Supabase 项目；不要把已有业务项目当作默认空白环境。
2. 在获准项目中执行 schema.sql，启用邮箱验证。所有 mba_* 表都启用 RLS；未登录不能读取个人或班级记录。这里只建立一个 IMBA 班级，没有教师角色或协作编辑。schema 同时把 `mba_os_records` 加入 Realtime publication；同学发布班级 Deadline 后，已登录成员的页面会自动刷新。
3. 在 content/public/cloud.json 写入项目 HTTPS URL 与 publishable key（允许公开）；绝不能写 service_role 或 AI 密钥。仅此文件会进入前端包。
4. 配置 Auth 的站点地址及重定向白名单，包括最终 GitHub Pages URL；让学生验证邮箱后登录。同一账号的笔记、日程、收集箱及复习标记应可跨设备同步。
5. 管理员核验真实班级成员后，把其 auth.users ID 加入 mba_os_members。禁止按用户可自行填写的 metadata 或邮箱域名自动放行。普通个人账号只能操作自己的数据。
6. mba-materials 是非公开存储桶。私有文件只能由本人读取；班级文件需要同时通过班级身份和对应记录权限检查，下载签名链接 60 秒过期，不放进公开 HTML。分享出去的签名链接在有效期内仍可能被他人使用。
7. 可选 AI：将 backend/mba-translate/index.ts 部署为 mba-translate Edge Function。服务端配置 OPENAI_API_KEY、MBA_AI_MODEL 和 MBA_ALLOWED_ORIGINS（逗号分隔的精确 origin，不含路径）。SUPABASE_URL、SUPABASE_ANON_KEY、SUPABASE_SERVICE_ROLE_KEY 使用服务端环境。服务端独立校验 JWT；需已核验班级成员，每人每天最多 50 次。不要把这些密钥放到前端或 GitHub 仓库。
8. 只有完成真实调用验收后，才把 content/public/cloud.json 的 aiEnabled 改成 true。没有开启时，27 个双语概念与案例仍可使用，自由文本翻译会明确显示待开通。

## 上线必验（目前未执行云端验收）

- 未登录访问 records、members、files：拒绝。
- 用户 A 私有日程/笔记，用户 B 查询和下载：拒绝。
- 普通新注册用户读取班级内容：拒绝；已核验成员：可以；所有人不能编辑他人的记录。
- A 与 B 不能更改 owner 或为别人的文件伪造一条共享记录。
- A 在手机修改、电脑刷新：最新版本一致；旧 revision 保存被拒绝，不覆盖新内容。
- A 发布班级 Deadline，B 的已登录页面无需手动刷新即可看到；未登录访客和非成员仍看不到记录与提交链接。
- 撤销成员资格后再次查询，班级数据与新签名下载权限被拒绝。
- 私有文件不出现在静态 out、公开网站、GitHub 包中。
- AI 无 JWT / 无成员权限 / 超额：拒绝；供应商异常：保留原文，不生成假成功。

## 公开审核与部署

AI 生成内容不是自动公开。课件、原始 Case 和含私人信息笔记保持非公开。公开知识资料需取得用户明确审核确认后才可写入 content/public。
用户已要求“发现变更先通知确认发布”。此包和工作流不会主动监视本地目录或主动 push。确认后的一次 main 提交才触发现有 GitHub Actions。

## AI 数据与限制

自由文本翻译把用户主动粘贴的文本发送到配置的 OpenAI API。请求 store:false，不等同于承诺供应商零留存；遵循供应商适用数据政策。
参考 [Responses API](https://platform.openai.com/docs/api-reference/responses/create) 和 [API data controls](https://platform.openai.com/docs/guides/your-data)。
本版本没有自动登录学校门户、解析全部 PDF/PPT 并生成完整逐课内容的后台任务。真实课表和教师考试范围仍需学生提供；公开通用知识地图不冒充教师课件。
