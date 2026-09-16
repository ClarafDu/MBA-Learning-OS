'use client';
import {useEffect,useRef,useState} from 'react';
import type {Lesson} from '@/lib/lecture-notes';
import CloudNote from './CloudNote';

export default function LectureNotes({lesson,en,initialTopic,onChapter}:{lesson:Lesson;en:boolean;initialTopic?:string|null;onChapter:(id:string)=>void}){
 const [expanded,setExpanded]=useState<Record<string,boolean>>(()=>Object.fromEntries(lesson.topics.map((topic,index)=>[topic.id,initialTopic?topic.id===initialTopic:index===0])));
 const root=useRef<HTMLElement>(null);
 useEffect(()=>{if(initialTopic){const element=root.current?.querySelector<HTMLElement>('[id="lesson-topic-'+initialTopic+'"]');element?.scrollIntoView({block:'start'});element?.querySelector('summary')?.focus();}},[initialTopic]);
 function jump(id:string){setExpanded(current=>({...current,[id]:true}));root.current?.querySelector<HTMLElement>('[id="lesson-topic-'+id+'"]')?.scrollIntoView({behavior:'smooth',block:'start'});}
 return <section ref={root} className="lesson-workspace" aria-labelledby="lesson-title">
  <header className="lesson-header"><p className="eyebrow">{lesson.date} · {en?'CLASS NOTES':'课堂笔记'}</p><h2 id="lesson-title">{en?lesson.titleEn:lesson.titleZh}</h2><p>{en?lesson.summaryEn:lesson.summaryZh}</p><small>{en?'Based on':'整理依据'} · {lesson.source}</small></header>
  <div className="lesson-layout"><nav className="lesson-index" aria-label={en?'Lesson topics':'本堂课知识点'}><b>{en?'Jump to a topic':'快速定位'}</b>{lesson.topics.map((topic,index)=><button key={topic.id} onClick={()=>jump(topic.id)}><span>{String(index+1).padStart(2,'0')}</span>{en?topic.titleEn:topic.titleZh}</button>)}<div className="lesson-expand-actions"><button onClick={()=>setExpanded(Object.fromEntries(lesson.topics.map(topic=>[topic.id,true])))}>{en?'Expand all':'全部展开'}</button><button onClick={()=>setExpanded({})}>{en?'Collapse all':'全部收起'}</button></div></nav>
   <div className="lesson-topics">{lesson.topics.map((topic,index)=><details id={'lesson-topic-'+topic.id} className="lesson-topic" key={topic.id} open={!!expanded[topic.id]}><summary onClick={event=>{event.preventDefault();setExpanded(current=>({...current,[topic.id]:!current[topic.id]}));}}><span>{String(index+1).padStart(2,'0')}</span><div><h3>{en?topic.titleEn:topic.titleZh}</h3><small>{en?topic.titleZh:topic.titleEn}</small></div><b aria-hidden="true">{expanded[topic.id]?'−':'＋'}</b></summary><div className="lesson-topic-body"><h4>{en?'Key points & reasoning':'知识点与推导'}</h4><ol>{(en?topic.pointsEn:topic.pointsZh).map(point=><li key={point}>{point}</li>)}</ol><div className="lesson-case"><h4>{en?'Case & application':'课堂案例与应用'}</h4><p>{en?topic.caseEn:topic.caseZh}</p></div><div className="lesson-source"><small>{lesson.source} · {topic.pages}</small><button className="text-button" onClick={()=>onChapter(topic.chapter)}>{en?'Locate in course framework':'定位到课程框架'} →</button></div></div></details>)}<CloudNote noteKey={'lesson-'+lesson.id} title={en?'My thoughts on this class':'这堂课的个人补充'}/></div>
  </div>
 </section>;
}
