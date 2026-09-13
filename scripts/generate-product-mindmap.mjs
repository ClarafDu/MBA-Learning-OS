import { mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';

const I='[已实现]';
const P='[部分实现]';
const T='[待规划]';
const X='[不进入公开版]';
const Q='[请补充/决策]';
const branch=(title,children=[])=>({title,children});

const tree=branch('MBA Learning OS｜全功能产品脑图 V1.2 草案',[
 branch('0. 阅读说明',[
  branch('状态图例',[branch(`${I} 当前网站已有`),branch(`${P} 已有基础但不完整`),branch(`${T} 建议纳入后续版本`),branch(`${Q} 需要产品决策或补充`),branch(`${X} 涉及隐私/版权，不进入公开 GitHub Pages`)]),
  branch('使用方式',[branch('在 XMind 中直接增删改节点'),branch('新增需求尽量写明：用户、场景、输入、输出、优先级、验收标准'),branch('补充后将 .xmind 发回 Codex，作为下一版 PRD 基线')]),
 ]),
 branch('1. 产品目标与边界',[
  branch('北极星目标',[branch('让用户用更少时间完成：预习、理解、复习、资料整理'),branch('减少找资料、切页面和重复整理'),branch('提升知识留存与课堂准备质量')]),
  branch('核心学习闭环',[branch('收集资料 → 结构化'),branch('课前预习 → 带问题进课堂'),branch('课堂记录 → 捕捉关键信号'),branch('课后整理 → 形成理解'),branch('主动回忆 → 检查掌握'),branch('间隔复习 → 长期记忆'),branch('考试/作业 → 输出应用')]),
  branch('产品边界',[branch(`${I} 公开课程目录与示例内容`),branch(`${I} 当前浏览器本机笔记与进度`),branch(`${X} 未授权教师课件不得公开`),branch(`${X} 私人笔记、录音、同学信息不得进入公共仓库`),branch(`${Q} 个人工具 / 班级协作平台 / 两者并存？`)]),
 ]),
 branch('2. 用户与核心场景',[
  branch('主要用户',[branch('IMBA 学生本人'),branch(`${T} 同班同学`),branch(`${T} 课程资料管理员`),branch(`${T} 教师/助教（只读或审核）`)]),
  branch('高频场景',[branch('上课前 20–60 分钟快速预习'),branch('课堂中快速定位与记录'),branch('课后 10–30 分钟整理'),branch('通勤中用手机复习'),branch('作业前查概念、案例和公式'),branch('考试周按课程集中复习'),branch('换设备或清理浏览器前备份')]),
  branch('用户任务成功标准',[branch('3 次点击内进入目标 Lecture'),branch('1 个页面完成一堂课闭环'),branch('5–10 分钟完成一轮回忆'),branch('能追溯知识来源与课程'),branch('资料不会误公开或丢失')]),
 ]),
 branch('3. 全站信息架构 Sitemap',[
  branch(`${I} 学习首页 Dashboard`,[branch('继续学习'),branch('待复习数量'),branch('九门课程入口'),branch('课程安排'),branch('整理与备份')]),
  branch(`${I} 2026 Fall 课程空间`,[
   branch('Managerial Economics (ME)'),branch('Strategic Management (SM)'),branch('Financial Accounting (FA)'),branch('ESG'),branch('Data, Models & Decisions (DMD)'),branch('Organizational Processes & Behavior (OB)'),branch('Business English (BE)'),branch('Career Development (CD)'),branch('中国式现代化的理论与实践 (CM)'),
  ]),
  branch(`${I} Lecture 空间`,[branch('Before Class'),branch('Core Concepts'),branch('In Class'),branch('After Class'),branch('Quick Review')]),
  branch(`${I} Public Knowledge 知识库`),branch(`${I} Review Queue 复习队列`),branch(`${I} My OS 本机笔记`),branch(`${P} IMBA Classroom 班级空间`),branch(`${I} Sitemap 学习地图`),
  branch(`${T} Assignments 作业中心`),branch(`${T} Calendar 课表与截止日期`),branch(`${T} Exam Hub 考试中心`),branch(`${T} Resource Inbox 资料收件箱`),branch(`${T} Account & Settings 账号与设置`),
 ]),
 branch('4. 首页 Dashboard',[
  branch(`${I} 今日继续学习`,[branch('展示下一堂示例 Lecture'),branch('课件浏览 / 概念理解 / 带问题上课'),branch('进入 Lecture')]),
  branch(`${I} 快速复习`,[branch('待复习题数'),branch('进入专注复习')]),
  branch(`${I} 课程卡片`,[branch('九门课程'),branch('真实理解题数量'),branch('空状态')]),
  branch(`${P} 日程与截止日期`,[branch('当前只有待补充提示'),branch(`${T} 下一堂课`),branch(`${T} 作业 Deadline`),branch(`${T} 考试倒计时`),branch(`${T} 今日学习清单`)]),
  branch(`${T} 个性化概览`,[branch('本周学习时间'),branch('待处理资料'),branch('薄弱概念'),branch('连续学习天数'),branch('最近笔记')]),
 ]),
 branch('5. 课程空间 Course',[
  branch(`${I} 课程总览`,[branch('课程名称/代码/类型'),branch('Lecture 列表'),branch('学习进度'),branch('空课程提示')]),
  branch(`${P} 课程资料`,[branch('当前仅访问状态提示'),branch(`${T} Syllabus`),branch(`${T} Slides`),branch(`${T} Reading`),branch(`${T} Cases`),branch(`${T} Homework`),branch(`${T} Recording/Transcript`),branch(`${T} 按周/类型/关键词筛选`)]),
  branch(`${P} 概念与公式`,[branch('已关联概念入口'),branch(`${T} 课程知识图谱`),branch(`${T} 公式清单`),branch(`${T} 案例/模型清单`)]),
  branch(`${P} 考前复习`,[branch('回忆题入口'),branch('笔记与易错点入口'),branch(`${T} 考试范围`),branch(`${T} 高频考点`),branch(`${T} 模拟题`),branch(`${T} 错题本`)]),
  branch(`${T} 课程管理`,[branch('教师/助教信息'),branch('时间地点'),branch('评分构成'),branch('作业清单'),branch('课程目标'),branch('参考书目')]),
 ]),
 branch('6. Lecture 单堂课学习闭环',[
  branch(`${I} Before Class 课前`,[branch('60 分钟 Timebox'),branch('20 分钟浏览结构'),branch('20 分钟理解概念'),branch('20 分钟形成 3 Ideas + 1 Question'),branch(`${T} 预习完成勾选`),branch(`${T} 预计/实际用时`)]),
  branch(`${I} Core Concepts 核心概念`,[branch('英文定义'),branch('中文辅助解释'),branch('公式/规则'),branch('管理含义'),branch('独立概念页'),branch(`${T} 例题与反例`),branch(`${T} 前置知识`)]),
  branch(`${I} In Class 课堂`,[branch('教授案例'),branch('重点'),branch('问题'),branch('卡点'),branch('Markdown 本机笔记'),branch(`${T} 快捷标签/时间戳`),branch(`${T} 录音转写关联（授权前提）`)]),
  branch(`${I} After Class 课后`,[branch('一句话总结'),branch('关键概念'),branch('难点'),branch('管理含义'),branch('案例'),branch('易错点'),branch('课后笔记保存'),branch(`${T} 自动生成待办/回忆题`)]),
  branch(`${I} Quick Review 快速复习`,[branch('先回忆再显示答案'),branch('待复习 / 稍后 / 已理解'),branch('返回来源 Lecture'),branch(`${T} 信心评分`),branch(`${T} 自定义回忆题`),branch(`${T} 间隔重复计划`)]),
 ]),
 branch('7. 知识库 Knowledge OS',[
  branch(`${I} 概念索引`,[branch('概念名称'),branch('定义'),branch('公式'),branch('管理含义'),branch('中英文辅助')]),
  branch(`${I} 独立概念页`,[branch('来源 Lecture 回链'),branch('外部教材资源'),branch('可跨课程复用')]),
  branch(`${T} 知识组织`,[branch('主题/课程/标签分类'),branch('概念之间的前置与关联'),branch('公式推导与单位'),branch('案例库'),branch('人物/框架/公司索引'),branch('引用与出处')]),
  branch(`${T} 知识检索增强`,[branch('全文搜索'),branch('同义词'),branch('中英文交叉搜索'),branch('按资料来源过滤'),branch('最近访问/收藏')]),
 ]),
 branch('8. 复习系统 Review OS',[
  branch(`${I} 专注复习`,[branch('一次一题'),branch('显示/收起答案'),branch('下一题'),branch('标记理解'),branch('稍后复习'),branch('撤销')]),
  branch(`${I} 筛选`,[branch('状态'),branch('课程'),branch('全部题目')]),
  branch(`${I} 状态同步`,[branch('首页'),branch('课程'),branch('Lecture'),branch('刷新后保留')]),
  branch(`${T} 学习算法`,[branch('间隔重复 SRS'),branch('遗忘曲线'),branch('难度/信心评分'),branch('每日复习上限'),branch('逾期队列'),branch('自动生成下一次日期')]),
  branch(`${T} 复习材料`,[branch('概念卡'),branch('公式卡'),branch('案例卡'),branch('错题卡'),branch('简答题'),branch('选择题'),branch('自测卷')]),
  branch(`${T} 复习反馈`,[branch('正确率'),branch('掌握趋势'),branch('薄弱点'),branch('按考试范围组卷')]),
 ]),
 branch('9. 笔记与 My OS',[
  branch(`${I} 本机笔记`,[branch('按课程'),branch('按 Lecture'),branch('课中与课后'),branch('Markdown 文本'),branch('未保存提醒')]),
  branch(`${I} 备份恢复`,[branch('导出 JSON'),branch('导入合并'),branch('V1 数据迁移'),branch('异常数据保护')]),
  branch(`${T} 笔记能力`,[branch('自动保存与版本历史'),branch('富文本/图片/表格/公式'),branch('双向链接'),branch('标签与收藏'),branch('全文搜索'),branch('批注与高亮'),branch('模板'),branch('导出 Markdown/PDF')]),
  branch(`${T} 跨设备`,[branch('账号同步'),branch('离线优先'),branch('冲突合并'),branch('加密备份')]),
 ]),
 branch('10. 搜索、导航与体验',[
  branch(`${I} 全局搜索`,[branch('课程'),branch('Lecture'),branch('概念'),branch('公式'),branch('中英文关键词'),branch('⌘/Ctrl + K')]),
  branch(`${I} 导航`,[branch('桌面侧栏'),branch('九科课程树'),branch('面包屑'),branch('Section Tabs'),branch('Sitemap'),branch('手机底部导航'),branch('手机课程抽屉')]),
  branch(`${I} 一键中英文`,[branch('全站界面切换'),branch('记住语言偏好'),branch('不改课程名称/公式/用户笔记'),branch('页面不刷新')]),
  branch(`${I} 可访问性基础`,[branch('键盘焦点'),branch('跳过导航'),branch('44px 触控目标'),branch('语义标签'),branch('减少动态效果')]),
  branch(`${T} 体验增强`,[branch('暗色模式'),branch('字号设置'),branch('PWA/添加到主屏幕'),branch('离线阅读'),branch('快捷命令面板'),branch('最近访问'),branch('收藏')]),
 ]),
 branch('11. 作业、日程与提醒',[
  branch(`${T} 作业中心`,[branch('作业题目与要求'),branch('课程/截止时间'),branch('附件'),branch('状态：未开始/进行中/已提交'),branch('拆解步骤'),branch('提交版本与反馈')]),
  branch(`${T} 日历`,[branch('课程表'),branch('作业截止'),branch('考试日期'),branch('个人学习计划'),branch('周/月视图')]),
  branch(`${T} 提醒`,[branch('预习提醒'),branch('Deadline 提醒'),branch('每日复习提醒'),branch('资料更新提醒'),branch('通知频率与免打扰')]),
  branch(`${Q} 是否连接 Google Calendar / Apple Calendar？`),
 ]),
 branch('12. IMBA Classroom 与协作',[
  branch(`${P} 当前状态`,[branch('入口和未启用说明'),branch('无模拟登录'),branch('无受限下载')]),
  branch(`${T} 身份与权限`,[branch('复旦邮箱验证码/SSO'),branch('班级白名单'),branch('学生/管理员/教师角色'),branch('会话与退出'),branch('权限过期')]),
  branch(`${T} 班级资料`,[branch('受控查看/下载'),branch('资料版本'),branch('访问日志'),branch('水印/下载限制'),branch('版权声明')]),
  branch(`${T} 协作`,[branch('共享课堂笔记'),branch('评论/提问'),branch('答案审核'),branch('同学贡献'),branch('举报/纠错'),branch('贡献者署名')]),
  branch(`${Q} Classroom 是否需要真实上线？若需要，GitHub Pages 不足以承担鉴权`),
 ]),
 branch('13. 本地资料导入与 AI 学习助手',[
  branch(`${T} Resource Inbox 资料收件箱`,[branch('检测 IMBA 文件夹新增/修改'),branch('识别课程与 Lecture'),branch('文件去重与版本'),branch('待处理队列')]),
  branch(`${T} 解析`,[branch('PDF/PPT/DOCX 文本提取'),branch('OCR 扫描件'),branch('表格/公式识别'),branch('录音转写（明确授权）'),branch('保留页码与出处')]),
  branch(`${T} AI 生成`,[branch('预习提纲'),branch('概念与公式'),branch('中英解释'),branch('管理含义'),branch('回忆题'),branch('课后总结模板'),branch('考试复习材料')]),
  branch(`${T} 人工审核`,[branch('原文与生成内容对照'),branch('编辑/接受/拒绝'),branch('事实与引用检查'),branch('公开级别选择'),branch('确认后进入网站')]),
  branch(`${I} 文件变化监控`,[branch('每小时检查'),branch('无变化不通知'),branch('发现变化先汇总'),branch('未经确认绝不发布')]),
 ]),
 branch('14. 内容管理与发布工作流',[
  branch(`${P} 内容模型`,[branch('Semester'),branch('Course'),branch('Lecture'),branch('Concept'),branch('Recall Question'),branch('Resource')]),
  branch(`${P} 模板`,[branch('定量课程'),branch('案例课程'),branch('综合课程'),branch('概念'),branch('资源')]),
  branch(`${T} 内容状态`,[branch('Draft 草稿'),branch('Class-ready 班级可用'),branch('Public-ready 公开可用'),branch('Archived 归档')]),
  branch(`${T} 审核流程`,[branch('内容完整性'),branch('事实核对'),branch('出处'),branch('隐私'),branch('版权'),branch('双语质量'),branch('最终发布确认')]),
  branch(`${I} 自动校验`,[branch('课程/Lecture/概念引用'),branch('稳定题目 ID'),branch('受限资产扫描'),branch('页面链接与锚点')]),
  branch(`${T} 管理后台`,[branch('无需改代码编辑课程'),branch('批量导入'),branch('预览'),branch('版本对比'),branch('回滚')]),
 ]),
 branch('15. 数据、账号与同步',[
  branch(`${I} 当前本机数据`,[branch('复习状态'),branch('笔记'),branch('语言偏好'),branch('浏览器 localStorage')]),
  branch(`${T} 用户账号`,[branch('注册/登录'),branch('个人资料'),branch('设备管理'),branch('退出所有设备'),branch('注销')]),
  branch(`${T} 云端数据`,[branch('笔记'),branch('复习记录'),branch('收藏'),branch('计划'),branch('文件元数据'),branch('同步时间')]),
  branch(`${T} 数据治理`,[branch('数据导出'),branch('删除'),branch('保留期限'),branch('版本迁移'),branch('灾备与恢复')]),
 ]),
 branch('16. 隐私、安全与版权',[
  branch(`${I} 公开/私密目录隔离`),branch(`${I} 公共构建禁止 PDF/PPT/DOCX/音视频`),branch(`${I} 不模拟未实现的身份权限`),
  branch(`${T} 上传前隐私扫描`,[branch('姓名/邮箱/学号'),branch('私人批注'),branch('教师资料'),branch('同学信息'),branch('隐藏元数据')]),
  branch(`${T} 安全`,[branch('认证与授权测试'),branch('最小权限'),branch('传输/存储加密'),branch('审计日志'),branch('依赖安全'),branch('备份恢复演练')]),
  branch(`${T} 版权`,[branch('资料授权范围'),branch('来源与引用'),branch('公开/班级/个人三级可见性'),branch('删除与下架流程')]),
 ]),
 branch('17. 技术、部署与运维',[
  branch(`${I} 前端`,[branch('Next.js / React'),branch('静态导出'),branch('响应式 Web'),branch('GitHub Pages 子路径')]),
  branch(`${I} GitHub Actions`,[branch('npm ci'),branch('自动测试'),branch('Lint'),branch('内容校验'),branch('构建'),branch('导出链接检查'),branch('Pages 发布')]),
  branch(`${P} 更新路径`,[branch('当前：本地修改 → 上传/提交 → Actions 自动部署'),branch('目标：发现变化 → Codex 汇总 → 用户确认 → 自动提交部署')]),
  branch(`${T} 运维`,[branch('构建失败通知'),branch('站点可用性监控'),branch('错误日志'),branch('性能监控'),branch('版本号/发布说明'),branch('回滚上一版本')]),
  branch(`${Q} 是否将本地目录正式连接为 Git 仓库，以实现确认后自动推送？`),
 ]),
 branch('18. 指标与产品分析',[
  branch('北极星指标候选',[branch('每周完成学习闭环的 Lecture 数'),branch('每堂课从资料到完成复习的总时间'),branch('按期完成复习的比例')]),
  branch('效率指标',[branch('找到目标资料耗时'),branch('完成一次预习耗时'),branch('整理一堂课耗时'),branch('平均页面跳转数')]),
  branch('学习效果',[branch('回忆题掌握率'),branch('延迟复习正确率'),branch('薄弱概念改善'),branch('考试/作业自评')]),
  branch('产品健康',[branch('周活跃'),branch('留存'),branch('功能使用率'),branch('搜索无结果率'),branch('同步/备份成功率'),branch('构建成功率')]),
  branch(`${Q} 隐私优先：是否允许匿名埋点？若不允许，仅做本地统计`),
 ]),
 branch('19. 非功能要求',[
  branch('性能',[branch('移动端首屏快速'),branch('弱网可用'),branch('静态资源缓存')]),
  branch('可靠性',[branch('保存不丢数据'),branch('导入失败不覆盖'),branch('发布前自动检查'),branch('可回滚')]),
  branch('兼容性',[branch('Chrome/Safari/Edge'),branch('iPhone/Android'),branch('320px–桌面宽屏')]),
  branch('可访问性',[branch('键盘操作'),branch('屏幕阅读器'),branch('对比度'),branch('触控尺寸'),branch('中英文可读性')]),
  branch('可维护性',[branch('稳定内容 ID'),branch('模板化'),branch('最少人工部署步骤'),branch('清晰版本说明')]),
 ]),
 branch('20. 路线图建议',[
  branch('V1.1 当前',[branch('信息架构与九科入口'),branch('Lecture 学习闭环示例'),branch('知识库/复习/笔记'),branch('双语/移动端'),branch('GitHub Pages 自动部署')]),
  branch('V1.2 内容可用',[branch('导入真实课程目录与 Lecture 元数据'),branch('资料收件箱'),branch('课表/作业/考试'),branch('内容审核与发布状态'),branch('稳定的一键更新')]),
  branch('V1.3 学习效率',[branch('间隔重复'),branch('自定义回忆题'),branch('知识图谱'),branch('搜索增强'),branch('学习数据分析')]),
  branch('V2 协作与同步',[branch('账号与跨设备'),branch('班级鉴权'),branch('受限资料'),branch('协作笔记'),branch('管理后台')]),
  branch(`${Q} 下一版优先级：内容导入 / 作业日历 / SRS / 账号同步 / Classroom？`),
 ]),
 branch('21. 待你补充的关键决策',[
  branch('最重要的前三个使用场景是什么？'),branch('哪些功能必须在手机上完成？'),branch('哪些资料可以公开、仅班级、仅个人？'),branch('是否需要账号和跨设备同步？'),branch('是否要支持教师/同学协作？'),branch('课表、作业和考试数据从哪里来？'),branch('AI 可以自动生成到什么程度，哪里必须人工审核？'),branch('下一版可接受的开发范围和上线时间？'),branch('判断 V1.2 成功的三个数字是什么？'),
 ]),
]);

let seq=0;
function topic(node){
 const value={id:`topic-${++seq}`,class:'topic',title:node.title};
 if(node.children?.length)value.children={attached:node.children.map(topic)};
 return value;
}
const sheetId='mba-learning-os-product-map';
const content=[{id:sheetId,class:'sheet',title:'MBA Learning OS 全功能产品脑图',rootTopic:{...topic(tree),structureClass:'org.xmind.ui.map.unbalanced'}}];
const dir=mkdtempSync(join(tmpdir(),'mba-learning-xmind-'));
writeFileSync(join(dir,'content.json'),JSON.stringify(content,null,2));
writeFileSync(join(dir,'metadata.json'),JSON.stringify({creator:{name:'Codex'},activeSheetId:sheetId},null,2));
writeFileSync(join(dir,'manifest.json'),JSON.stringify({'file-entries':{'content.json':{},'metadata.json':{}}},null,2));
const output=join(process.cwd(),'docs','MBA_Learning_OS_全功能产品脑图_V1.2草案.xmind');
const result=spawnSync('zip',['-q','-j',output,join(dir,'content.json'),join(dir,'metadata.json'),join(dir,'manifest.json')],{stdio:'inherit'});
if(result.status!==0)process.exit(result.status??1);
console.log(output);
