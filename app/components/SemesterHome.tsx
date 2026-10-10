'use client';
import Link from 'next/link';
import {catalog} from '@/lib/catalog';
import {deadline} from '@/lib/planner.mjs';
import {eventTitle,useEvents} from './Planner';
import {taskState} from '@/lib/task-progress.mjs';
import {useWorkspace} from './WorkspaceState';
import {useLanguage} from './Language';
import {useNow} from './useNow';
import activity from '@/content/public/activity.json';
import {translate} from '@/lib/language.mjs';

export default function SemesterHome(){
 const {language}=useLanguage(),en=language==='en',events=useEvents(),now=useNow(),ws=useWorkspace();
 const nextClass=events.find(event=>!event.done&&event.kind==='class'&&Date.parse(event.end)>now);
 const pending=events.filter(event=>event.kind!=='class'&&!taskState(event,ws.records,ws.ownerId).done&&Date.parse(event.start)>now);
 const nextDeadline=pending[0];
 const dueSoon=pending.filter(event=>Date.parse(event.start)-now<=7*86400000).length;
 const weekEnd=now+7*86400000;
 const classesThisWeek=events.filter(event=>event.kind==='class'&&Date.parse(event.end)>now&&Date.parse(event.start)<=weekEnd).length;
 const campusMatter=events.find(event=>event.visibility==='public'&&event.kind==='other');
 const today=now?new Date(now).toLocaleDateString(en?'en-GB':'zh-CN',{timeZone:'Asia/Shanghai',month:'long',day:'numeric',weekday:'long'}):'';
 return <div className="content semester-home compact-home">
  <header className="focus-hero">
   <div><p className="eyebrow">{today||'MBA LEARNING OS'}</p><h1>{en?'What needs your attention now':'现在最需要关注什么'}</h1><p>{en?'Start with the next class and deadline, then move directly into the relevant course knowledge.':'先处理最近的课程与 Deadline，再直接进入对应课程知识。'}</p><div className="home-signal-row"><span><b>{dueSoon}</b>{en?' due in 7 days':'项 7 天内截止'}</span><span><b>{classesThisWeek}</b>{en?' classes in 7 days':'节 7 天内课程'}</span></div></div>
   <Link className="home-search-link" href="/map">⌕ <span>{en?'Search courses, concepts and materials':'搜索课程、知识与资料'}</span><b>→</b></Link>
  </header>
  <section className="today-strip" aria-label={en?'What matters next':'接下来最重要的信息'}>
   <article><span className="status-label">{en?'NEXT CLASS':'下一节课'}</span>{nextClass?<><strong>{eventTitle(nextClass,en)}</strong><p>{new Date(nextClass.start).toLocaleString(en?'en-GB':'zh-CN',{timeZone:'Asia/Shanghai',month:'short',day:'numeric',weekday:'short',hour:'2-digit',minute:'2-digit'})}</p><small>{nextClass.location?(en?translate(nextClass.location,'en'):nextClass.location):(en?'Location pending':'地点待补充')}</small></>:<><strong>{en?'No upcoming class':'暂无即将开始的课程'}</strong><p>{en?'Your schedule is clear for now.':'当前没有需要提醒的课程。'}</p></>}<Link href="/calendar">{en?'Open Schedule':'查看 Schedule'} →</Link></article>
   <article className="deadline-summary"><span className="status-label">{en?'NEXT DEADLINE':'最近截止日期'}</span>{nextDeadline?<><strong>{eventTitle(nextDeadline,en)}</strong><p>{deadline(nextDeadline,now).days} {en?'days left':'天后截止'}</p><progress max={100} value={deadline(nextDeadline,now).percent}/><Link className="home-primary-action" href={'/calendar?task='+encodeURIComponent(nextDeadline.id)}>{en?'Open task & submission':'查看任务与提交入口'} →</Link></>:<><strong>{en?'No upcoming deadline':'暂无近期 Deadline'}</strong><p>{en?'Add homework or exam dates in Schedule.':'在 Schedule 中补充作业或考试时间。'}</p><Link href="/calendar">{en?'Manage deadlines':'管理 Deadline'} →</Link></>}</article>
  </section>
  <section className="home-campus" aria-labelledby="home-campus-title"><div><p className="eyebrow">CAMPUS LIFE</p><h2 id="home-campus-title">{en?'Campus matters & activities':'校园事项与活动'}</h2><p>{campusMatter?`${eventTitle(campusMatter,en)} · ${new Date(campusMatter.start).toLocaleDateString(en?'en-GB':'zh-CN',{timeZone:'Asia/Shanghai',month:'long',day:'numeric'})}${en?' deadline':'截止'} · `:''}{en?'Badminton':'羽毛球'} · {new Date(activity.start).toLocaleString(en?'en-GB':'zh-CN',{timeZone:'Asia/Shanghai',month:'long',day:'numeric',hour:'2-digit',minute:'2-digit'})}{en?' (tentative)':'（暂定）'}</p></div><Link className="button secondary" href="/calendar#campus-activities">{en?'View details':'查看详情'} →</Link></section>
  <div className="two-lines">
   <Link className="product-line schedule-line" href="/calendar"><span className="line-number">01</span><div><p className="eyebrow">TIME & DEADLINES</p><h2>Schedule</h2><p>{en?'Classes, homework deadlines and exams, with a class-sharing path for verified members.':'课程、作业 Deadline 与考试集中查看；通过验证后，一位同学发布即可同步给全班。'}</p><ul><li>{en?'Weekly and monthly views':'本周与月历视图'}</li><li>{en?'Class deadline updates':'班级 Deadline 同步'}</li><li>{en?'Calendar export':'导入手机或电脑日历'}</li></ul></div><b>↗</b></Link>
   <Link className="product-line map-line" href="/map"><span className="line-number">02</span><div><p className="eyebrow">MATERIALS & KNOWLEDGE</p><h2>Map</h2><p>{en?'Follow each course from chapters to concepts, frameworks and cases.':'按“课程—章节—概念—框架 / 案例”浏览 IMBA 课件与笔记整理出的思维导图。'}</p><ul><li>{en?'Chapter mind maps':'章节思维导图'}</li><li>{en?'Frameworks and cases':'概念框架与案例'}</li><li>{en?'Private notes':'私人笔记'}</li></ul></div><b>↗</b></Link>
  </div>
  <section className="course-index"><div className="section-heading"><div><p className="eyebrow">9 COURSES</p><h2>{en?'Jump into the map':'从课程进入地图'}</h2></div><Link href="/map">{en?'Open full map':'打开完整地图'} ↗</Link></div><div>{catalog.courses.map(course=><Link href={'/map?course='+course.slug} key={course.slug}><span>{course.code}</span><b>{en?translate(course.title,'en'):course.title}</b></Link>)}</div></section>
 </div>;
}
