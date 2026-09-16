'use client';
import {useState} from 'react';
import Link from 'next/link';
import {catalog} from '@/lib/catalog';
import notes from '@/content/public/lecture-notes.json';
import {courseSessionProgress} from '@/lib/planner.mjs';
import type {EventItem} from './Planner';
const eventTitle=(event:EventItem,en:boolean)=>en&&event.titleEn?event.titleEn:event.title;

const dateKey=(value:string)=>new Date(Date.parse(value)+8*3600000).toISOString().slice(0,10);
const clock=(value:string)=>new Date(Date.parse(value)+8*3600000).toISOString().slice(11,16);
const kinds:Record<string,[string,string]>={class:['上课','Class'],homework:['作业','Assignment'],reflection:['反馈','Reflection'],midterm:['期中考试','Midterm'],final:['期末考试','Final']};

export default function CourseSchedule({events,en,now,onEdit,canEdit}:{events:EventItem[];en:boolean;now:number;onEdit:(event:EventItem)=>void;canEdit:(event:EventItem)=>boolean}){
 const [month,setMonth]=useState(()=>dateKey(new Date().toISOString()).slice(0,7));
 const [mode,setMode]=useState('list'),[course,setCourse]=useState(catalog.courses[0].slug),[day,setDay]=useState('');
 const monthly=events.filter(event=>dateKey(event.start).startsWith(month));
 const selected=monthly.filter(event=>course==='all'||event.course===course);
 const display=selected.filter(event=>!day||dateKey(event.start)===day);
 const [year,mo]=month.split('-').map(Number),days=new Date(year,mo,0).getDate(),offset=(new Date(year,mo-1,1).getDay()+6)%7;
 const progress=courseSessionProgress(events,course,now);
 const title=catalog.courses.find(item=>item.slug===course);
 const courseName=(slug:string)=>{const item=catalog.courses.find(c=>c.slug===slug);return en?item?.title:(events.find(e=>e.course===slug&&e.kind==='class')?.title||item?.title);};
 function changeMonth(value:string){if(/^\d{4}-\d{2}$/.test(value)){setMonth(value);setDay('');}}
 function step(delta:number){changeMonth(new Date(Date.UTC(year,mo-1+delta,1)).toISOString().slice(0,7));}
 return <section className="calendar-panel" aria-labelledby="all-courses-title">
  <div className="schedule-heading"><div><p className="eyebrow">YOUR CLASSES</p><h2 id="all-courses-title">{en?'Course schedule':'全部课程'}</h2><p>{en?'Choose a course to see this month’s classes and notes.':'按课程查看每月安排，点开即可进入当天的课堂知识。'}</p></div><div className="segmented" aria-label={en?'View':'展示形式'}>{['list','month'].map(value=><button key={value} aria-pressed={mode===value} onClick={()=>{setMode(value);setDay('');}}>{value==='list'?(en?'List':'列表'):(en?'Calendar':'日历')}</button>)}</div></div>
  <div className="calendar-toolbar"><button className="icon-button" aria-label={en?'Previous month':'上个月'} onClick={()=>step(-1)}>‹</button><input type="month" aria-label="月份 / Month" value={month} onChange={e=>changeMonth(e.target.value)}/><button className="icon-button" aria-label={en?'Next month':'下个月'} onClick={()=>step(1)}>›</button><button className="text-button" onClick={()=>changeMonth(dateKey(new Date().toISOString()).slice(0,7))}>{en?'This month':'本月'}</button><small>{monthly.length} {en?'events across all courses':'项月度安排'}</small></div>
  <nav className="schedule-course-tabs" aria-label={en?'Filter by course':'按课程切换'}>{catalog.courses.map(item=><button key={item.slug} aria-pressed={course===item.slug} onClick={()=>{setCourse(item.slug);setDay('');}}>{courseName(item.slug)}<small>{monthly.filter(e=>e.course===item.slug).length}</small></button>)}<button aria-pressed={course==='all'} onClick={()=>{setCourse('all');setDay('');}}>{en?'Show all':'查看全部'}<small>{monthly.length}</small></button></nav>
  {mode==='month'&&<><p className="calendar-scroll-hint">{en?'Select a date for details. On a small screen, swipe the calendar sideways.':'点选日期查看安排；手机端可左右滑动月历。'}</p><div className="calendar-scroll" tabIndex={0} role="region" aria-label={en?'Monthly calendar':'月历'}><div className="calendar-month-grid"><div className="calendar-week">{(en?['Mon','Tue','Wed','Thu','Fri','Sat','Sun']:['一','二','三','四','五','六','日']).map(v=><span key={v}>{v}</span>)}</div><div className="calendar-days">{Array.from({length:offset},(_,i)=><span key={'blank'+i}/>)}{Array.from({length:days},(_,i)=>{const key=month+'-'+String(i+1).padStart(2,'0'),items=selected.filter(e=>dateKey(e.start)===key);return <button key={key} aria-label={`${key} · ${items.length} ${en?'events':'项安排'}`} className={day===key?'selected':''} aria-pressed={day===key} onClick={()=>setDay(day===key?'':key)}><b>{i+1}</b>{items.map(event=><span className={'calendar-event '+event.kind} key={event.id}><span>{eventTitle(event,en)}</span><small>{event.timeConfirmed===false?(en?'Time TBC':'时间待定'):clock(event.start)}{event.location?' · '+event.location.replace(/政立院区\s*/,'').replace(/\s*教室/,''):''}</small></span>)}</button>;})}</div></div></div></>}
  <div className="agenda" aria-live="polite"><div className="schedule-list-heading"><h3>{day||month} · {title?courseName(course):(en?'All courses':'全部课程')} <small>{display.length} {en?'events':'项安排'}</small></h3>{day&&<button className="text-button" onClick={()=>setDay('')}>{en?'Whole month':'返回整月'}</button>}</div>
   {course!=='all'&&progress.total>0&&<div className="course-session-progress"><div><span>{en?'Course progress':'课程进度'}</span><strong>{en?`${progress.completed} of ${progress.total} classes`:`已上 ${progress.completed} / 共 ${progress.total} 节`}</strong></div><progress max={100} value={progress.percent} aria-label={en?'Course progress':'课程进度'}/></div>}
   {!display.length&&<div className="planner-empty"><h3>{en?'No events for this selection':'这段时间没有该课程的安排'}</h3><p>{en?'Choose another course or month.':'切换上方课程标签或月份查看其他安排。'}</p><a href="https://cs.fdsm.fudan.edu.cn/EAS/student/" target="_blank" rel="noreferrer">{en?'Student portal':'学生门户'} ↗</a></div>}
   {display.map(event=>{const lessons=notes.filter(note=>note.course===event.course&&note.date===dateKey(event.start));return <article className="agenda-item" key={event.id}><time dateTime={event.start}>{new Date(event.start).toLocaleDateString(en?'en-GB':'zh-CN',{timeZone:'Asia/Shanghai',month:'short',day:'numeric',weekday:'short'})}<b>{event.timeConfirmed===false?(en?'Time TBC':'时间待定'):clock(event.start)}</b>{event.kind==='class'&&<small>– {clock(event.end)}</small>}</time><div><span className="pill">{kinds[event.kind]?.[en?1:0]}{event.audience==='elective'?(en?' · My elective':' · 个人选修'):''}</span><h3>{eventTitle(event,en)}</h3>{event.location&&<p className="event-location">{event.location}</p>}{event.description&&<p>{event.description}</p>}<div className="topic-links">{lessons.map(note=><Link key={note.id} href={'/map?course='+event.course+'&lesson='+note.id}>{en?note.titleEn:note.titleZh} →</Link>)}{!lessons.length&&<Link href={'/map?course='+event.course}>{en?'Course framework':'课程知识框架'} →</Link>}{(event.link||event.submissionLink)&&<a href={event.link||event.submissionLink} target="_blank" rel="noreferrer">{en?'Submission':'提交入口'} ↗</a>}{event.materialLink&&<a href={event.materialLink} target="_blank" rel="noreferrer">{en?'Materials':'课件'} ↗</a>}</div>{event.kind==='class'&&!lessons.length&&<small className="lesson-pending">{en?'Notes for this session have not been added yet.':'本次课堂笔记待补充'}</small>}</div>{canEdit(event)&&<button className="text-button" onClick={()=>onEdit(event)}>{en?'Edit':'编辑'}</button>}</article>})}
  </div>
 </section>;
}
