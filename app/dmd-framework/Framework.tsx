'use client';
import {useEffect} from 'react';
import Link from 'next/link';
import chineseFramework from '@/content/public/dmd-framework.json';
import englishFramework from '@/content/public/dmd-framework.en.json';
import notes from '@/content/public/lecture-notes.json';
import {useLanguage} from '@/app/components/Language';
import styles from './page.module.css';

export default function DmdFramework(){
 const {language}=useLanguage();
 const en=language==='en';
 const framework=en?englishFramework:chineseFramework;
 const t=(zh:string,english:string)=>en?english:zh;
 useEffect(()=>{document.title=en?'DMD Complete Study Framework · MBA Learning OS':'DMD 教材完整框架 · MBA Learning OS';},[en]);
 const chapters=framework.chapters;
 const sections=chapters.reduce((sum,chapter)=>sum+chapter.sections.length,0);
 const topics=chapters.reduce((sum,chapter)=>sum+chapter.notes.length,0);
 return <div className={'content '+styles.page}>
  <nav className="breadcrumbs" aria-label={t('面包屑','Breadcrumb')}><Link href="/">{t('首页','Home')}</Link><span>/</span><Link href="/map?course=data-models-decisions">{t('DMD 课程地图','DMD course map')}</Link><span>/</span><span aria-current="page">{t('教材完整框架','Complete textbook framework')}</span></nav>
  <header className={'page-header '+styles.hero} id="framework-top">
   <p className="eyebrow">DATA · MODELS · DECISIONS / COMPLETE STUDY FRAMEWORK</p>
   <h1>{t('数据、模型与决策','Data, Models, and Decisions')}<br/>{t('把整门课连成一条线。','Connect the whole course.')}</h1>
   <p>{t('从“不确定时如何选”，到“用数据估计”，再到“在约束下找到最优行动”。','From choosing under uncertainty, to learning from data, to finding the best action under constraints.')}</p>
   <div className={styles.stats}><span><b>10</b> {t('章教材框架','textbook chapters')}</span><span><b>{sections}</b> {t('个目录条目','contents entries')}</span><span><b>{topics}</b> {t('组概念笔记','concept notes')}</span><span><b>10</b> {t('道分步算例','worked examples')}</span></div>
   <p className={styles.meta}>{t('核验日期：','Verified: ')}{framework.updated} · {framework.textbook}</p>
   <div className="button-row"><Link className="button" href="/map?course=data-models-decisions&lesson=dmd-1022">{t('已有课堂笔记','Existing class notes')} →</Link><a className="button secondary" href="#chapter-1">{t('开始学习','Start learning')}</a><a className="button secondary" href="#verification">{t('查看核验与来源','Verification & sources')}</a></div>
  </header>

  <section className={'panel '+styles.scope} aria-labelledby="scope-title"><h2 id="scope-title">{t('先分清教材范围与课堂进度','Textbook coverage and class progress')}</h2><p>{framework.scope}</p><p>{framework.provenance}</p><small>{framework.sourceNote}</small></section>
  <section className={styles.roadmap} aria-label={t('课程学习主线','Course learning path')}>
   {[['01',t('定义决策','Define the decision'),t('第 1 章','Chapter 1')],['02–03',t('表达不确定性','Model uncertainty'),t('第 2–3 章','Chapters 2–3')],['04',t('从样本估计','Learn from samples'),t('第 4 章','Chapter 4')],['05–06',t('模拟与预测','Simulate & predict'),t('第 5–6 章','Chapters 5–6')],['07–09',t('选择最优行动','Optimize actions'),t('第 7–9 章','Chapters 7–9')],['10',t('整合与实施','Integrate & implement'),t('第 10 章','Chapter 10')]].map(([number,title,detail])=><div key={number}><b>{number}</b><strong>{title}</strong><small>{detail}</small></div>)}
  </section>

  <div className={styles.layout}>
   <aside className={styles.index}><nav aria-label={t('教材章节导航','Textbook chapter navigation')}><h2>{t('教材 10 章','The 10 chapters')}</h2>{chapters.map(chapter=><a key={chapter.id} href={'#'+chapter.id}><b>{String(chapter.number).padStart(2,'0')}</b><span>{chapter.zh}</span></a>)}<a href="#appendix">{t('附录与查表','Appendix & tables')}</a><a href="#verification">{t('核验记录与参考资料','Verification & references')}</a></nav><p>{t('推荐顺序：1 → 2 → 3 → 4 → 5 → 6 → 7 → 8 / 9 → 10。每章先读目标，再看公式条件，最后遮住答案重做算例。','Suggested order: 1 → 2 → 3 → 4 → 5 → 6 → 7 → 8 / 9 → 10. Read the objectives, check the formula assumptions, then redo the example without looking at its solution.')}</p></aside>
   <div className={styles.chapters}>
    {chapters.map(chapter=>{
     const lessons=notes.filter(lesson=>chapter.lessons.includes(lesson.id));
     return <article id={chapter.id} key={chapter.id} className={styles.chapter}>
      <header><p className="eyebrow">CHAPTER {String(chapter.number).padStart(2,'0')} · {t('教材 p.','Textbook p.')}{chapter.page}</p><h2>{chapter.zh}</h2>{!en&&<p lang="en" className={styles.english}>{chapter.en}</p>}<p className={styles.question}>{chapter.question}</p><p><b>{t('学完应会：','Learning outcome: ')}</b>{chapter.goal}</p><p className={styles.meta}>{t('先修：','Prerequisites: ')}{chapter.prerequisites.length?chapter.prerequisites.map((number,index)=><span key={number}>{index?t('、',', '):''}<a href={'#chapter-'+number}>{t('第 '+number+' 章','Chapter '+number)}</a></span>):t('无需统计先修，先能清楚描述商业问题。','No statistics prerequisite; start by stating the business problem clearly.')}</p></header>
      <div className={styles.coverage}><b>{lessons.length?t('已有相关课堂笔记 + 补充概念','Related class notes + supplementary concepts'):t('教材框架 + 公开资料补充','Textbook framework + supplementary public sources')}</b><span>{lessons.length?t('相关笔记提供部分概念的课堂对应，不表示本章全部讲授完毕。','Related notes connect some concepts to class; they do not establish that the entire chapter has been taught.'):t('尚无对应课堂笔记；以下为预习与自学内容。','No corresponding class notes yet. The material below is for preparation and self-study.')}</span>{lessons.map(lesson=><Link key={lesson.id} href={'/map?course=data-models-decisions&lesson='+lesson.id}>{lesson.date.slice(5)} · {en?lesson.titleEn:lesson.titleZh} ↗</Link>)}</div>
      <details className={styles.details}><summary>{t('原目录逐节对照','Original contents, section by section')} · {chapter.sections.length} {t('个条目','entries')}</summary><div className={styles.tableWrap}><table><caption>{t('第 '+chapter.number+' 章目录 · 印刷页码 · * 为教材进阶标记','Chapter '+chapter.number+' contents · printed page numbers · * marks an advanced textbook section')}</caption><thead><tr><th scope="col">{t('节号','Section')}</th><th scope="col">{t('内容','Topic')}</th><th scope="col">{t('页码','Page')}</th></tr></thead><tbody>{chapter.sections.map(section=><tr key={section.id}><th scope="row">{section.id}{section.advanced?' *':''}</th><td>{section.zh}{!en&&<small lang="en">{section.en}</small>}</td><td>{section.page}</td></tr>)}</tbody></table></div></details>
      <section className={styles.block}><h3>{t('概念笔记 · 定义、条件与关系','Concept notes · definitions, assumptions & relationships')}</h3>{chapter.notes.map((note,index)=><details className={styles.details} key={chapter.id+'-note-'+index} open={index===0}><summary>{index+1}. {note.title}</summary><ol>{note.points.map((point,pointIndex)=><li key={pointIndex}>{point}</li>)}</ol></details>)}</section>
      <section className={styles.block}><h3>{t('公式与适用条件','Formulas & conditions')}</h3><p className={styles.meta}>{t('记号：Φ 为标准正态 CDF，N(μ,σ²) 的第二个参数为方差。使用前对照上方假设。','Notation: Φ is the standard normal CDF. The second parameter in N(μ,σ²) is variance. Check the assumptions above before using a formula.')}</p><ul className={styles.formulas}>{chapter.formulas.map((formula,index)=><li key={index}>{formula}</li>)}</ul></section>
      <section className={styles.block}><h3>{t('考试答题 / 建模步骤','Exam solution / modeling steps')}</h3><ol className={styles.steps}>{chapter.workflow.map((step,index)=><li key={index}>{step}</li>)}</ol></section>
      <section className={styles.example}><h3>{chapter.example.title}</h3><ol className={styles.steps}>{chapter.example.steps.map((step,index)=><li key={index}>{step}</li>)}</ol></section>
      <section className={styles.block}><h3>{t('易错点','Common pitfalls')}</h3><ul>{chapter.pitfalls.map((point,index)=><li key={index}>{point}</li>)}</ul></section>
      <details className={styles.details}><summary>{t('自测：我能独立完成吗？','Self-check: can I do this independently?')}</summary><ul>{chapter.checks.map((check,index)=><li key={index}>{check}</li>)}</ul></details>
      {chapter.cases.length>0&&<details className={styles.details}><summary>{t('教材案例索引','Textbook case index')} · {chapter.cases.length} {t('个','cases')}</summary><p className={styles.meta}>{t('以下仅保留目录中的名称与页码；案例分析须使用原教材的数据和要求。','Only the case names and page numbers from the contents are listed. Use the original textbook data and instructions for case analysis.')}</p><ul>{chapter.cases.map(item=><li key={item} lang="en">{item}</li>)}</ul></details>}
      <footer className={styles.sources}><h3>{t('本章核验来源','Sources checked for this chapter')}</h3><p>{t('DMD 教材第 '+chapter.number+' 章（p.'+chapter.page+' 起）及用户提供的目录；公开概念对照：','DMD textbook Chapter '+chapter.number+' (starting on p.'+chapter.page+') and the supplied contents; public sources used for conceptual cross-checks:')}</p><ul>{chapter.refs.map(id=>{const source=framework.references.find(item=>item.id===id)!;return <li key={id}><a href={source.url} target="_blank" rel="noreferrer">{source.title} ↗</a><small>{source.scope}</small></li>;})}</ul><a href="#framework-top">{t('回到全课程概览','Back to course overview')} ↑</a></footer>
     </article>;
    })}
    <section id="appendix" className={styles.chapter}><p className="eyebrow">APPENDIX · p.517</p><h2>{t('附录：查表前先认清概率方向','Appendix: identify the probability direction before using a table')}</h2>{framework.appendix.map(item=><div key={item.id} className={styles.block}><h3>{item.id} {item.zh} · p.{item.page}</h3>{!en&&<p lang="en" className={styles.english}>{item.en}</p>}<p>{item.note}</p></div>)}<p>{t('教材参考文献从 p.521 开始，索引从 p.525 开始。','The textbook references start on p.521 and the index starts on p.525.')}</p></section>
    <section id="verification" className={styles.chapter}><p className="eyebrow">SOURCES & VERIFICATION · {framework.updated}</p><h2>{t('信息如何核验','How the information was checked')}</h2><ol>{framework.verificationNotes.map((note,index)=><li key={index}>{note}</li>)}</ol><h3>{t('公开学习资料','Public learning sources')}</h3><p>{t('章节结构以你提供的目录为准。以下大学课程、公开教材和 NIST 资料用于核对概念与适用条件，不代替本班教师要求。','The chapter structure follows the contents you supplied. The university courses, open textbooks and NIST sources below support checks on concepts and conditions; they do not replace this class’s instructor requirements.')}</p><ul className={styles.references}>{framework.references.map(source=><li key={source.id} id={'source-'+source.id}><a href={source.url} target="_blank" rel="noreferrer">{source.title} ↗</a><p>{source.scope}</p><small>{t('核对日期：','Checked: ')}{source.checked}</small></li>)}</ul><Link className="button secondary" href="/map?course=data-models-decisions">{t('返回 DMD 课程地图','Return to the DMD course map')} →</Link></section>
   </div>
  </div>
 </div>;
}
