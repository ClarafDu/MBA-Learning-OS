import Link from 'next/link';
import framework from '@/content/public/dmd-framework.json';
import notes from '@/content/public/lecture-notes.json';
import styles from './page.module.css';

export const metadata={title:'DMD 教材完整框架 · MBA Learning OS',description:'按教材目录组织的 10 章学习框架、概念笔记、公式条件、分步例题与核验来源。'};

export default function DmdFrameworkPage(){
 const chapters=framework.chapters;
 const sections=chapters.reduce((sum,chapter)=>sum+chapter.sections.length,0);
 const topics=chapters.reduce((sum,chapter)=>sum+chapter.notes.length,0);
 return <div className={'content '+styles.page}>
  <nav className="breadcrumbs" aria-label="面包屑"><Link href="/">首页</Link><span>/</span><Link href="/map?course=data-models-decisions">DMD 课程地图</Link><span>/</span><span aria-current="page">教材完整框架</span></nav>
  <header className={'page-header '+styles.hero} id="framework-top">
   <p className="eyebrow">DATA · MODELS · DECISIONS / COMPLETE STUDY FRAMEWORK</p>
   <h1>数据、模型与决策<br/>把整门课连成一条线。</h1>
   <p>从“不确定时如何选”，到“用数据估计”，再到“在约束下找到最优行动”。</p>
   <div className={styles.stats}><span><b>10</b> 章教材框架</span><span><b>{sections}</b> 个目录条目</span><span><b>{topics}</b> 组概念笔记</span><span><b>10</b> 道分步算例</span></div>
   <p className={styles.meta}>核验日期：{framework.updated} · {framework.textbook}</p>
   <div className="button-row"><Link className="button" href="/map?course=data-models-decisions&lesson=dmd-1022">已有课堂笔记 →</Link><a className="button secondary" href="#chapter-1">开始学习</a><a className="button secondary" href="#verification">查看核验与来源</a></div>
  </header>

  <section className={'panel '+styles.scope} aria-labelledby="scope-title"><h2 id="scope-title">先分清教材范围与课堂进度</h2><p>{framework.scope}</p><p>{framework.provenance}</p><small>{framework.sourceNote}</small></section>
  <section className={styles.roadmap} aria-label="课程学习主线">
   {[['01','定义决策','第 1 章'],['02–03','表达不确定性','第 2–3 章'],['04','从样本估计','第 4 章'],['05–06','模拟与预测','第 5–6 章'],['07–09','选择最优行动','第 7–9 章'],['10','整合与实施','第 10 章']].map(([number,title,detail])=><div key={number}><b>{number}</b><strong>{title}</strong><small>{detail}</small></div>)}
  </section>

  <div className={styles.layout}>
   <aside className={styles.index}><nav aria-label="教材章节导航"><h2>教材 10 章</h2>{chapters.map(chapter=><a key={chapter.id} href={'#'+chapter.id}><b>{String(chapter.number).padStart(2,'0')}</b><span>{chapter.zh}</span></a>)}<a href="#appendix">附录与查表</a><a href="#verification">核验记录与参考资料</a></nav><p>推荐顺序：1 → 2 → 3 → 4 → 5 → 6 → 7 → 8 / 9 → 10。每章先读目标，再看公式条件，最后遮住答案重做算例。</p></aside>
   <div className={styles.chapters}>
    {chapters.map(chapter=>{
     const lessons=notes.filter(lesson=>chapter.lessons.includes(lesson.id));
     return <article id={chapter.id} key={chapter.id} className={styles.chapter}>
      <header><p className="eyebrow">CHAPTER {String(chapter.number).padStart(2,'0')} · 教材 p.{chapter.page}</p><h2>{chapter.zh}</h2><p lang="en" className={styles.english}>{chapter.en}</p><p className={styles.question}>{chapter.question}</p><p><b>学完应会：</b>{chapter.goal}</p><p className={styles.meta}>先修：{chapter.prerequisites.length?chapter.prerequisites.map((number,index)=><span key={number}>{index?'、':''}<a href={'#chapter-'+number}>第 {number} 章</a></span>):'无需统计先修，先能清楚描述商业问题。'}</p></header>
      <div className={styles.coverage}><b>{lessons.length?'已有相关课堂笔记 + 补充概念':'教材框架 + 公开资料补充'}</b><span>{lessons.length?'相关笔记提供部分概念的课堂对应，不表示本章全部讲授完毕。':'尚无对应课堂笔记；以下为预习与自学内容。'}</span>{lessons.map(lesson=><Link key={lesson.id} href={'/map?course=data-models-decisions&lesson='+lesson.id}>{lesson.date.slice(5)} · {lesson.titleZh} ↗</Link>)}</div>
      <details className={styles.details}><summary>原目录逐节对照 · {chapter.sections.length} 个条目</summary><div className={styles.tableWrap}><table><caption>第 {chapter.number} 章目录 · 印刷页码 · * 为教材进阶标记</caption><thead><tr><th scope="col">节号</th><th scope="col">内容</th><th scope="col">页码</th></tr></thead><tbody>{chapter.sections.map(section=><tr key={section.id}><th scope="row">{section.id}{section.advanced?' *':''}</th><td>{section.zh}<small lang="en">{section.en}</small></td><td>{section.page}</td></tr>)}</tbody></table></div></details>
      <section className={styles.block}><h3>概念笔记 · 定义、条件与关系</h3>{chapter.notes.map((note,index)=><details className={styles.details} key={note.title} open={index===0}><summary>{index+1}. {note.title}</summary><ol>{note.points.map(point=><li key={point}>{point}</li>)}</ol></details>)}</section>
      <section className={styles.block}><h3>公式与适用条件</h3><p className={styles.meta}>记号：Φ 为标准正态 CDF，N(μ,σ²) 的第二个参数为方差。使用前对照上方假设。</p><ul className={styles.formulas}>{chapter.formulas.map(formula=><li key={formula}>{formula}</li>)}</ul></section>
      <section className={styles.block}><h3>考试答题 / 建模步骤</h3><ol className={styles.steps}>{chapter.workflow.map(step=><li key={step}>{step}</li>)}</ol></section>
      <section className={styles.example}><h3>{chapter.example.title}</h3><ol className={styles.steps}>{chapter.example.steps.map(step=><li key={step}>{step}</li>)}</ol></section>
      <section className={styles.block}><h3>易错点</h3><ul>{chapter.pitfalls.map(point=><li key={point}>{point}</li>)}</ul></section>
      <details className={styles.details}><summary>自测：我能独立完成吗？</summary><ul>{chapter.checks.map(check=><li key={check}>{check}</li>)}</ul></details>
      {chapter.cases.length>0&&<details className={styles.details}><summary>教材案例索引 · {chapter.cases.length} 个</summary><p className={styles.meta}>以下仅保留目录中的名称与页码；案例分析须使用原教材的数据和要求。</p><ul>{chapter.cases.map(item=><li key={item} lang="en">{item}</li>)}</ul></details>}
      <footer className={styles.sources}><h3>本章核验来源</h3><p>DMD 教材第 {chapter.number} 章（p.{chapter.page} 起）及用户提供的目录；公开概念对照：</p><ul>{chapter.refs.map(id=>{const source=framework.references.find(item=>item.id===id)!;return <li key={id}><a href={source.url} target="_blank" rel="noreferrer">{source.title} ↗</a><small>{source.scope}</small></li>;})}</ul><a href="#framework-top">回到全课程概览 ↑</a></footer>
     </article>;
    })}
    <section id="appendix" className={styles.chapter}><p className="eyebrow">APPENDIX · p.517</p><h2>附录：查表前先认清概率方向</h2>{framework.appendix.map(item=><div key={item.id} className={styles.block}><h3>{item.id} {item.zh} · p.{item.page}</h3><p lang="en" className={styles.english}>{item.en}</p><p>{item.note}</p></div>)}<p>教材参考文献从 p.521 开始，索引从 p.525 开始。</p></section>
    <section id="verification" className={styles.chapter}><p className="eyebrow">SOURCES & VERIFICATION · {framework.updated}</p><h2>信息如何核验</h2><ol>{framework.verificationNotes.map(note=><li key={note}>{note}</li>)}</ol><h3>公开学习资料</h3><p>章节结构以你提供的目录为准。以下大学课程、公开教材和 NIST 资料用于核对概念与适用条件，不代替本班教师要求。</p><ul className={styles.references}>{framework.references.map(source=><li key={source.id} id={'source-'+source.id}><a href={source.url} target="_blank" rel="noreferrer">{source.title} ↗</a><p>{source.scope}</p><small>核对日期：{source.checked}</small></li>)}</ul><Link className="button secondary" href="/map?course=data-models-decisions">返回 DMD 课程地图 →</Link></section>
   </div>
  </div>
 </div>;
}
