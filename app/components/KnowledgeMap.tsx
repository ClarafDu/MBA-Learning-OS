'use client';
import {Suspense,useMemo,useRef,useState} from 'react';
import {useSearchParams} from 'next/navigation';
import Link from 'next/link';
import {catalog} from '@/lib/catalog';
import {knowledge} from '@/lib/knowledge';
import {buildMapLayout,clamp} from '@/lib/map-layout.mjs';
import type {KnowledgeNode} from '@/lib/knowledge';
import {useLanguage} from './Language';
import CloudNote from './CloudNote';

type CourseNode=(typeof catalog.courses)[number]&{x:number;y:number;active:boolean};
type ConceptNode=KnowledgeNode&{x:number;y:number};
type MapEdge={id:string;kind:'owns'|'related'|'cross';from:{x:number;y:number};to:{x:number;y:number}};
type MapGraph={width:number;height:number;center:{x:number;y:number};courseNodes:CourseNode[];conceptNodes:ConceptNode[];edges:MapEdge[]};

export default function KnowledgeMap(){return <Suspense fallback={<p className="content">正在打开知识地图 / Loading map…</p>}><MapQuery/></Suspense>;}

function MapQuery(){
 const params=useSearchParams();
 const requested=knowledge.find(k=>k.id===params.get('concept'));
 const course=catalog.courses.find(c=>c.slug===params.get('course'))?.slug||requested?.courses[0]||catalog.courses[0].slug;
 const selected=requested?.id||knowledge.find(k=>k.courses.includes(course))?.id||knowledge[0].id;
 return <MapContent key={course+selected} initialCourse={course} initialSelected={selected}/>;
}

function short(text:string,max=15){return text.length>max?text.slice(0,max-1)+'…':text;}

function MapContent({initialCourse,initialSelected}:{initialCourse:string;initialSelected:string}){
 const {language}=useLanguage(),en=language==='en';
 const [course,setCourse]=useState(initialCourse),[selected,setSelected]=useState(initialSelected),[q,setQ]=useState('');
 const [view,setView]=useState({x:0,y:0,scale:1});
 const drag=useRef<{id:number;x:number;y:number;originX:number;originY:number}|null>(null);
 const graph=useMemo(()=>buildMapLayout(catalog.courses,knowledge,course) as unknown as MapGraph,[course]);
 const current=catalog.courses.find(c=>c.slug===course)!;
 const node=knowledge.find(k=>k.id===selected)||graph.conceptNodes[0];
 const query=q.trim().toLowerCase();
 const matches=useMemo(()=>query?[...catalog.courses.map(c=>({kind:'course' as const,id:c.slug,title:c.title,meta:c.code,text:c.type})),...knowledge.map(k=>({kind:'concept' as const,id:k.id,title:en?k.en:k.zh,meta:en?k.zh:k.en,text:k.definitionZh+' '+k.definitionEn}))].filter(item=>(item.title+' '+item.meta+' '+item.text).toLowerCase().includes(query)).slice(0,8):[],[query,en]);

 function resetView(){setView({x:0,y:0,scale:1});}
 function chooseCourse(slug:string){setCourse(slug);setSelected(knowledge.find(k=>k.courses.includes(slug))?.id||knowledge[0].id);setQ('');resetView();}
 function chooseConcept(id:string){const target=knowledge.find(k=>k.id===id);if(!target)return;if(!target.courses.includes(course))setCourse(target.courses[0]);setSelected(id);setQ('');resetView();}
 function beginPan(e:React.PointerEvent<SVGSVGElement>){if((e.target as Element).closest('[data-map-node]'))return;e.currentTarget.setPointerCapture(e.pointerId);drag.current={id:e.pointerId,x:e.clientX,y:e.clientY,originX:view.x,originY:view.y};}
 function movePan(e:React.PointerEvent<SVGSVGElement>){if(!drag.current||drag.current.id!==e.pointerId)return;setView(v=>({...v,x:drag.current!.originX+e.clientX-drag.current!.x,y:drag.current!.originY+e.clientY-drag.current!.y}));}
 function endPan(e:React.PointerEvent<SVGSVGElement>){if(drag.current?.id===e.pointerId)drag.current=null;}
 function wheel(e:React.WheelEvent<SVGSVGElement>){e.preventDefault();setView(v=>({...v,scale:clamp(v.scale*(e.deltaY>0?.9:1.1),.65,1.8)}));}
 function keySelect(e:React.KeyboardEvent<SVGGElement>,action:()=>void){if(e.key==='Enter'||e.key===' '){e.preventDefault();action();}}

 return <div className="content map-page">
  <header className="page-header map-header"><div><p className="eyebrow">COURSES · MATERIALS · NOTES</p><h1>{en?'Navigate your learning map.':'沿着地图，找到所需信息。'}</h1><p>{en?'Courses, concepts, materials and private notes in one connected view.':'课程、知识、课件和私人笔记，在同一张地图中互相导航。'}</p></div><Link className="button" href="/capture">＋ {en?'Add a private note':'记录私人笔记'}</Link></header>
  <div className="map-commandbar">
   <div className="map-search"><label className="sr-only" htmlFor="map-search">{en?'Search the map':'搜索地图'}</label><input id="map-search" value={q} onChange={e=>setQ(e.target.value)} placeholder={en?'Search courses and concepts…':'搜索课程、知识点和公式…'}/>{matches.length>0&&<div className="map-search-results">{matches.map(item=><button key={item.kind+item.id} onClick={()=>item.kind==='course'?chooseCourse(item.id):chooseConcept(item.id)}><span>{item.title}</span><small>{item.meta} · {item.kind==='course'?(en?'Course':'课程'):(en?'Concept':'知识点')}</small></button>)}</div>}</div>
   <div className="map-view-actions"><button onClick={()=>setView(v=>({...v,scale:clamp(v.scale-.15,.65,1.8)}))} aria-label={en?'Zoom out':'缩小'}>−</button><span>{Math.round(view.scale*100)}%</span><button onClick={()=>setView(v=>({...v,scale:clamp(v.scale+.15,.65,1.8)}))} aria-label={en?'Zoom in':'放大'}>＋</button><button onClick={resetView}>{en?'Fit':'适应屏幕'}</button></div>
  </div>
  <div className="map-workspace">
   <section className="atlas-panel">
    <div className="atlas-legend"><span><i className="legend-course"/>{en?'Course':'课程'}</span><span><i className="legend-concept"/>{en?'Concept':'知识点'}</span><span><i className="legend-cross"/>{en?'Cross-course link':'跨课程关联'}</span></div>
    <svg className="knowledge-atlas" viewBox={`0 0 ${graph.width} ${graph.height}`} role="application" aria-label={en?'Interactive knowledge map. Drag to pan and scroll to zoom.':'交互式知识地图。拖动平移，滚轮缩放。'} onPointerDown={beginPan} onPointerMove={movePan} onPointerUp={endPan} onPointerCancel={endPan} onWheel={wheel}>
     <rect width={graph.width} height={graph.height} className="atlas-background"/>
     <g transform={`translate(${view.x} ${view.y}) scale(${view.scale})`}>
      {graph.edges.map(edge=><line key={edge.id} className={'atlas-edge '+edge.kind} x1={edge.from.x} y1={edge.from.y} x2={edge.to.x} y2={edge.to.y}/>)}
      {graph.courseNodes.map(c=><g data-map-node="course" role="button" tabIndex={0} aria-label={`${c.code} ${c.title}`} aria-pressed={c.slug===course} key={c.slug} className={'atlas-course '+(c.slug===course?'active':'')} transform={`translate(${c.x} ${c.y})`} onClick={()=>chooseCourse(c.slug)} onKeyDown={e=>keySelect(e,()=>chooseCourse(c.slug))}><rect x={-68} y={-31} width={136} height={62} rx={14}/><text textAnchor="middle" y={-4}>{c.code}</text><text className="node-sub" textAnchor="middle" y={15}>{short(c.title,19)}</text></g>)}
      {graph.conceptNodes.map(k=><g data-map-node="concept" role="button" tabIndex={0} aria-label={`${k.zh} ${k.en}`} aria-pressed={k.id===selected} key={k.id} className={'atlas-concept '+(k.id===selected?'selected':'')} transform={`translate(${k.x} ${k.y})`} onClick={()=>chooseConcept(k.id)} onKeyDown={e=>keySelect(e,()=>chooseConcept(k.id))}><circle r={43}/><text textAnchor="middle" y={-3}>{short(en?k.en:k.zh,12)}</text><text className="node-sub" textAnchor="middle" y={14}>{short(en?k.zh:k.en,14)}</text></g>)}
     </g>
    </svg>
    <p className="map-hint">{en?'Drag the canvas to move. Scroll or use the buttons to zoom. Select any course or concept to navigate.':'拖动画布移动，滚轮或按钮缩放；点击任意课程或知识点即可导航。'}</p>
   </section>
   <aside className="atlas-detail">
    <div className="detail-course"><span>{current.code}</span><div><small>{en?'CURRENT COURSE':'当前课程'}</small><h2>{current.title}</h2></div></div>
    <div className="detail-actions"><Link href={'/courses/'+course}>{en?'Open course':'课程总览'} ↗</Link><Link href="/calendar">{en?'View schedule':'查看日程'} ↗</Link></div>
    {node&&<><div className="detail-divider"/><span className="eyebrow">{en?'SELECTED CONCEPT':'当前知识点'}</span><h3>{en?node.en:node.zh}</h3><p className="concept-translation">{en?node.zh:node.en}</p><p>{en?node.definitionEn:node.definitionZh}</p><details><summary>{en?'Example and connected courses':'案例与关联课程'}</summary><p>{en?node.exampleEn:node.exampleZh}</p><div className="topic-links">{node.courses.map(slug=><button className="text-button" key={slug} onClick={()=>chooseCourse(slug)}>{catalog.courses.find(c=>c.slug===slug)?.code}</button>)}</div></details><CloudNote noteKey={'concept-'+node.id} title={en?'My private note':'我的私人笔记'}/></>}
    <div className="material-shortcut"><small>{en?'COURSE MATERIALS':'课程资料'}</small><h3>{en?'Slides and readings':'课件与阅读材料'}</h3><p>{en?'Materials will appear here after class access and private storage are enabled.':'班级权限与私有存储开通后，可在这里预览或下载课件。'}</p><Link href="/classroom">{en?'View access status':'查看访问状态'} →</Link></div>
   </aside>
  </div>
 </div>;
}
