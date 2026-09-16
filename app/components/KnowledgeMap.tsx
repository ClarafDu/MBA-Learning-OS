'use client';
import {Suspense,useMemo,useState} from 'react';
import {useSearchParams} from 'next/navigation';
import Link from 'next/link';
import {catalog} from '@/lib/catalog';
import outlineData from '@/content/public/course-map.json';
import {useLanguage} from './Language';
import CloudNote from './CloudNote';
import LectureNotes from './LectureNotes';
import {notes,lessonSearchItems} from '@/lib/lecture-notes';

type Concept={id:string;titleZh:string;titleEn:string;summaryZh:string;summaryEn:string;caseZh:string;caseEn:string};
type Chapter={id:string;titleZh:string;titleEn:string;source:string;concepts:Concept[]};
type CourseOutline={course:string;status:'ready'|'pending';sources:string[];chapters:Chapter[]};
const outlines=outlineData as CourseOutline[];

export default function KnowledgeMap(){return <Suspense fallback={<p className="content">正在打开课程导图 / Loading course map…</p>}><MapQuery/></Suspense>;}

function MapQuery(){
 const params=useSearchParams();
 const requestedConcept=params.get('concept');
 const conceptCourse=outlines.find(item=>item.chapters.some(chapter=>chapter.concepts.some(concept=>concept.id===requestedConcept)))?.course;
 const course=catalog.courses.find(item=>item.slug===params.get('course'))?.slug||conceptCourse||catalog.courses[0].slug;
 return <MindMap key={course+requestedConcept+params.get('lesson')+params.get('topic')} initialCourse={course} initialConcept={requestedConcept} initialLesson={params.get('lesson')} initialTopic={params.get('topic')}/>;
}

function MindMap({initialCourse,initialConcept,initialLesson,initialTopic}:{initialCourse:string;initialConcept:string|null;initialLesson:string|null;initialTopic:string|null}){
 const {language}=useLanguage(),en=language==='en';
 const [course,setCourse]=useState(initialCourse),[selected,setSelected]=useState(initialConcept||''),[query,setQuery]=useState('');
 const [view,setView]=useState(initialConcept?'framework':notes.some(item=>item.course===initialCourse)?'notes':'framework');
 const [lessonId,setLessonId]=useState(initialLesson||'');
 const lessons=notes.filter(item=>item.course===course).sort((a,b)=>b.date.localeCompare(a.date));
 const lesson=lessons.find(item=>item.id===lessonId)||lessons[0];
 const noteResults=needleResults(query);
 function needleResults(value:string){const needle=value.trim().toLowerCase();return needle?lessonSearchItems.filter(item=>(item.title+' '+item.text+' '+item.detail).toLowerCase().includes(needle)).slice(0,8):[];}
 const outline=outlines.find(item=>item.course===course)!;
 const current=catalog.courses.find(item=>item.slug===course)!;
 const first=outline.chapters[0]?.concepts[0];
 const concept=outline.chapters.flatMap(chapter=>chapter.concepts).find(item=>item.id===selected)||first;
 const conceptChapter=outline.chapters.find(chapter=>chapter.concepts.some(item=>item.id===concept?.id));
 const needle=query.trim().toLowerCase();
 const results=useMemo(()=>needle?outlines.flatMap(item=>{
  const courseInfo=catalog.courses.find(courseItem=>courseItem.slug===item.course)!;
  return item.chapters.flatMap(chapter=>[
   {kind:'chapter',course:item.course,id:chapter.id,title:en?chapter.titleEn:chapter.titleZh,meta:courseInfo.code},
   ...chapter.concepts.map(itemConcept=>({kind:'concept',course:item.course,id:itemConcept.id,title:en?itemConcept.titleEn:itemConcept.titleZh,meta:(en?itemConcept.titleZh:itemConcept.titleEn)+' · '+courseInfo.code}))
  ]);
 }).filter(item=>(item.title+' '+item.meta).toLowerCase().includes(needle)).slice(0,10):[],[needle,en]);

 function chooseCourse(slug:string){setCourse(slug);setSelected('');setQuery('');setLessonId('');setView(notes.some(item=>item.course===slug)?'notes':'framework');}
 function chooseResult(item:(typeof results)[number]){setView('framework');setCourse(item.course);const target=outlines.find(entry=>entry.course===item.course)!;setSelected(item.kind==='concept'?item.id:target.chapters.find(chapter=>chapter.id===item.id)?.concepts[0]?.id||'');setQuery('');}

 return <div className="content outline-page">
  <header className="page-header outline-header">
   <div><p className="eyebrow">COURSE · CHAPTER · CONCEPT · CASE</p><h1>{en?'See the course. Follow the thinking.':'先看课程全貌，再进入具体知识。'}</h1><p>{en?'Course materials are organized into chapter frameworks, concepts and cases.':'把 IMBA 课件与笔记整理为“课程—章节—概念—案例”的思维导图。'}</p></div>
   <Link className="button" href="/capture">＋ {en?'Capture a thought':'随时记录'}</Link>
  </header>

  <div className="outline-toolbar">
   <div className="map-search"><label className="sr-only" htmlFor="outline-search">{en?'Search the course map':'搜索课程导图'}</label><input id="outline-search" value={query} onChange={event=>setQuery(event.target.value)} placeholder={en?'Search chapters, concepts and cases…':'搜索章节、概念与案例…'}/>{(results.length>0||noteResults.length>0)&&<div className="map-search-results">{noteResults.map(item=><Link key={item.href} href={item.href} onClick={()=>setQuery('')}><span>{item.title}</span><small>{item.detail}</small></Link>)}{results.map(item=><button key={item.kind+item.course+item.id} onClick={()=>chooseResult(item)}><span>{item.title}</span><small>{item.meta} · {item.kind==='chapter'?(en?'Chapter':'章节'):(en?'Concept':'概念')}</small></button>)}</div>}{query.trim()&&!results.length&&!noteResults.length&&<p role="status">{en?'No matches. Try a case or concept name.':'没有找到相关内容，试试案例名或概念名。'}</p>}</div>
   <span className="source-status">{outline.status==='ready'?(en?`${outline.sources.length} sources · ${lessons.length} lesson notes`:`${outline.sources.length} 份课件 · ${lessons.length} 份课堂笔记`):(en?'Source material pending':'等待上传课件')}</span>
  </div>

  <nav className="outline-course-tabs" aria-label={en?'Course maps':'课程导图'}>{catalog.courses.map(item=><button key={item.slug} aria-pressed={item.slug===course} onClick={()=>chooseCourse(item.slug)}><b>{item.code}</b><span>{item.title}</span></button>)}</nav>

  <div className="map-content-mode segmented"><button aria-pressed={view==='framework'} onClick={()=>setView('framework')}>{en?'Chapter framework':'章节框架'}</button><button aria-pressed={view==='notes'} onClick={()=>setView('notes')}>{en?'Class notes':'课堂笔记'} · {lessons.length}</button></div>
  {view==='notes'?<>{lessons.length?<><nav className="lesson-tabs" aria-label={en?'Choose a class':'按上课日期选择'}>{lessons.map(item=><button key={item.id} aria-pressed={item.id===lesson?.id} onClick={()=>setLessonId(item.id)}><time>{item.date.slice(5)}</time><span>{en?item.titleEn:item.titleZh}</span></button>)}</nav>{lesson&&<LectureNotes key={lesson.id+initialTopic} lesson={lesson} en={en} initialTopic={lesson.id===initialLesson?initialTopic:null} onChapter={id=>{setView('framework');setSelected(outline.chapters.find(item=>item.id===id)?.concepts[0]?.id||'');}}/>}</>:<div className="panel"><h2>{en?'Class notes not added yet':'这门课的课堂笔记待补充'}</h2><p>{en?'You can still browse the source-based chapter framework.':'可以先查看课件整理的章节框架；收到课堂笔记后会在这里补充。'}</p><button className="button secondary" onClick={()=>setView('framework')}>{en?'View framework':'查看章节框架'} →</button></div>}</>:
  outline.status==='pending'?<section className="outline-empty"><span>{current.code}</span><div><p className="eyebrow">SOURCE NEEDED</p><h2>{current.title}</h2><p>{en?'No course slides or notes were found in the IMBA folder. Upload source material before generating this map.':'IMBA 文件夹中暂未找到这门课的课件或笔记。上传资料后，我会按章节提取知识框架和案例。'}</p><Link className="button secondary" href="/capture">{en?'Upload or record a source':'上传资料或记录线索'} →</Link></div></section>:
  <div className="outline-workspace">
   <aside className="outline-root"><span>{current.code}</span><p>{en?'COURSE MAP':'课程思维导图'}</p><h2>{current.title}</h2><small>{outline.chapters.length} {en?'chapters':'个章节'} · {outline.chapters.flatMap(item=>item.concepts).length} {en?'concepts':'个概念'}</small><div className="outline-source-list"><b>{en?'Sources':'资料来源'}</b>{outline.sources.map(source=><span key={source}>{source}</span>)}</div></aside>
   <section className="outline-branches" aria-label={en?'Chapter framework':'章节框架'}>{outline.chapters.map((chapter,index)=><article className="outline-branch" key={chapter.id}>
    <div className="chapter-node"><span>{String(index+1).padStart(2,'0')}</span><div><h3>{en?chapter.titleEn.replace(/^\d+\s*/, ''):chapter.titleZh.replace(/^\d+\s*/, '')}</h3><small>{chapter.source}</small></div></div>
    <div className="concept-nodes">{chapter.concepts.map(item=><button key={item.id} className={item.id===concept?.id?'selected':''} aria-pressed={item.id===concept?.id} onClick={()=>setSelected(item.id)}><span>{en?item.titleEn:item.titleZh}</span><small>{en?item.titleZh:item.titleEn}</small></button>)}</div>
   </article>)}</section>
   {concept&&<aside className="outline-detail"><p className="eyebrow">{en?'SELECTED CONCEPT':'当前概念'}</p><h2>{en?concept.titleEn:concept.titleZh}</h2><p className="concept-translation">{en?concept.titleZh:concept.titleEn}</p><div className="outline-detail-block"><small>{en?'FRAMEWORK':'知识框架'}</small><p>{en?concept.summaryEn:concept.summaryZh}</p></div><div className="outline-detail-block case"><small>{en?'CASE / APPLICATION':'案例 / 应用'}</small><p>{en?concept.caseEn:concept.caseZh}</p></div><div className="lesson-related">{lessons.filter(item=>item.topics.some(topic=>topic.chapter===conceptChapter?.id)).map(item=><button key={item.id} className="text-button" onClick={()=>{setLessonId(item.id);setView('notes');}}>{item.date.slice(5)} · {en?'Read detailed class notes':'查看详细课堂笔记'} →</button>)}</div><p className="outline-citation">{en?'Source':'来源'} · {conceptChapter?.source}</p><CloudNote noteKey={'outline-'+course+'-'+concept.id} title={en?'My private note':'我的私人笔记'}/></aside>}
  </div>}
  <p className="outline-disclaimer">{en?'Study summaries from course slides and class notes. Source pages and corrections are shown beside the relevant topics.':'根据课件与课堂笔记整理。知识点附来源页码；对照课件发现的纪要错误已在对应位置注明。'}</p>
 </div>;
}
