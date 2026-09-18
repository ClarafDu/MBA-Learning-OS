import summaries from '@/content/public/review-summaries.json';
import {notes} from '@/lib/lecture-notes';

export default function ReviewSummaries({course,en,onLesson}:{course:string;en:boolean;onLesson:(id:string)=>void}){
 const items=summaries.map(summary=>({...summary,lessonInfo:notes.find(n=>n.id===summary.lesson)!})).filter(item=>item.lessonInfo.course===course).sort((a,b)=>b.lessonInfo.date.localeCompare(a.lessonInfo.date));
 return <section className="review-focus"><header><p className="eyebrow">REVISION ESSENTIALS</p><h2>{en?'AI notes · revision essentials':'AI 笔记 · 复习重点'}</h2><p>{en?'Condensed from the summary sections of your uploaded AI notes. Checked corrections take precedence over transcript errors.':'单独汇总已上传 AI 笔记中的总结。按课程复习，一眼找到重点；已核实的纪要错误以校正内容为准。'}</p></header>
 {!items.length&&<p className="panel">{en?'No AI-note summary uploaded for this course yet. See class notes or the chapter framework.':'这门课暂未上传 AI 笔记总结，可先查看课堂笔记或章节框架。'}</p>}
 <div className="review-focus-grid">{items.map(item=><article key={item.lesson}><time>{item.lessonInfo.date}</time><h3>{en?item.lessonInfo.titleEn:item.lessonInfo.titleZh}</h3><ol>{(en?item.pointsEn:item.pointsZh).map(point=><li key={point}>{point}</li>)}</ol><p className="review-source">{en?'Source':'来源'}：{item.lessonInfo.source} · {en?'pp.':'第'} {item.pages} {en?'':'页'}</p><button className="text-button" onClick={()=>onLesson(item.lesson)}>{en?'Read concepts & cases':'展开知识点与案例'} →</button></article>)}</div>
 </section>;
}
