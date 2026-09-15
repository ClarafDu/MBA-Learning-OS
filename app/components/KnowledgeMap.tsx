'use client';
import {Suspense,useMemo,useState} from 'react';
import {useSearchParams} from 'next/navigation';
import Link from 'next/link';
import {catalog} from '@/lib/catalog';
import outlineData from '@/content/public/course-map.json';
import {useLanguage} from './Language';
import CloudNote from './CloudNote';

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
 return <MindMap key={course+requestedConcept} initialCourse={course} initialConcept={requestedConcept}/>;
}

function MindMap({initialCourse,initialConcept}:{initialCourse:string;initialConcept:string|null}){
 const {language}=useLanguage(),en=language==='en';
 const [course,setCourse]=useState(initialCourse),[selected,setSelected]=useState(initialConcept||''),[query,setQuery]=useState('');
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

 function chooseCourse(slug:string){setCourse(slug);setSelected('');setQuery('');}
 function chooseResult(item:(typeof results)[number]){setCourse(item.course);const target=outlines.find(entry=>entry.course===item.course)!;setSelected(item.kind==='concept'?item.id:target.chapters.find(chapter=>chapter.id===item.id)?.concepts[0]?.id||'');setQuery('');}

 return <div className="content outline-page">
  <header className="page-header outline-header">
   <div><p className="eyebrow">COURSE · CHAPTER · CONCEPT · CASE</p><h1>{en?'See the course. Follow the thinking.':'先看课程全貌，再进入具体知识。'}</h1><p>{en?'Course materials are organized into chapter frameworks, concepts and cases.':'把 IMBA 课件与笔记整理为“课程—章节—概念—案例”的思维导图。'}</p></div>
   <Link className="button" href="/capture">＋ {en?'Add a private note':'记录私人笔记'}</Link>
  </header>

  <div className="outline-toolbar">
   <div className="map-search"><label className="sr-only" htmlFor="outline-search">{en?'Search the course map':'搜索课程导图'}</label><input id="outline-search" value={query} onChange={event=>setQuery(event.target.value)} placeholder={en?'Search chapters, concepts and cases…':'搜索章节、概念与案例…'}/>{results.length>0&&<div className="map-search-results">{results.map(item=><button key={item.kind+item.course+item.id} onClick={()=>chooseResult(item)}><span>{item.title}</span><small>{item.meta} · {item.kind==='chapter'?(en?'Chapter':'章节'):(en?'Concept':'概念')}</small></button>)}</div>}</div>
   <span className="source-status">{outline.status==='ready'?(en?`${outline.sources.length} verified sources`:`${outline.sources.length} 份课件已整理`):(en?'Source material pending':'等待上传课件')}</span>
  </div>

  <nav className="outline-course-tabs" aria-label={en?'Course maps':'课程导图'}>{catalog.courses.map(item=><button key={item.slug} aria-pressed={item.slug===course} onClick={()=>chooseCourse(item.slug)}><b>{item.code}</b><span>{item.title}</span></button>)}</nav>

  {outline.status==='pending'?<section className="outline-empty"><span>{current.code}</span><div><p className="eyebrow">SOURCE NEEDED</p><h2>{current.title}</h2><p>{en?'No course slides or notes were found in the IMBA folder. Upload source material before generating this map.':'IMBA 文件夹中暂未找到这门课的课件或笔记。上传资料后，我会按章节提取知识框架和案例。'}</p><Link className="button secondary" href="/capture">{en?'Upload or record a source':'上传资料或记录线索'} →</Link></div></section>:
  <div className="outline-workspace">
   <aside className="outline-root"><span>{current.code}</span><p>{en?'COURSE MAP':'课程思维导图'}</p><h2>{current.title}</h2><small>{outline.chapters.length} {en?'chapters':'个章节'} · {outline.chapters.flatMap(item=>item.concepts).length} {en?'concepts':'个概念'}</small><div className="outline-source-list"><b>{en?'Sources':'资料来源'}</b>{outline.sources.map(source=><span key={source}>{source}</span>)}</div></aside>
   <section className="outline-branches" aria-label={en?'Chapter framework':'章节框架'}>{outline.chapters.map((chapter,index)=><article className="outline-branch" key={chapter.id}>
    <div className="chapter-node"><span>{String(index+1).padStart(2,'0')}</span><div><h3>{en?chapter.titleEn.replace(/^\d+\s*/, ''):chapter.titleZh.replace(/^\d+\s*/, '')}</h3><small>{chapter.source}</small></div></div>
    <div className="concept-nodes">{chapter.concepts.map(item=><button key={item.id} className={item.id===concept?.id?'selected':''} aria-pressed={item.id===concept?.id} onClick={()=>setSelected(item.id)}><span>{en?item.titleEn:item.titleZh}</span><small>{en?item.titleZh:item.titleEn}</small></button>)}</div>
   </article>)}</section>
   {concept&&<aside className="outline-detail"><p className="eyebrow">{en?'SELECTED CONCEPT':'当前概念'}</p><h2>{en?concept.titleEn:concept.titleZh}</h2><p className="concept-translation">{en?concept.titleZh:concept.titleEn}</p><div className="outline-detail-block"><small>{en?'FRAMEWORK':'知识框架'}</small><p>{en?concept.summaryEn:concept.summaryZh}</p></div><div className="outline-detail-block case"><small>{en?'CASE / APPLICATION':'案例 / 应用'}</small><p>{en?concept.caseEn:concept.caseZh}</p></div><p className="outline-citation">{en?'Source':'来源'} · {conceptChapter?.source}</p><CloudNote noteKey={'outline-'+course+'-'+concept.id} title={en?'My private note':'我的私人笔记'}/></aside>}
  </div>}
  <p className="outline-disclaimer">{en?'AI-assisted structure based on the course files in the local IMBA folder. Use the original slides as the final authority.':'框架由 AI 根据本地 IMBA 课件辅助整理；页码和原课件是最终依据，不确定内容不会自动补写。'}</p>
 </div>;
}
