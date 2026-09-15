'use client';
import Link from 'next/link';
import {catalog} from '@/lib/catalog';
import {deadline} from '@/lib/planner.mjs';
import {eventTitle,useEvents} from './Planner';
import {useLanguage} from './Language';
import {useNow} from './useNow';

export default function SemesterHome(){
 const {language}=useLanguage(),en=language==='en',events=useEvents(),now=useNow();
 const nextClass=events.find(event=>!event.done&&event.kind==='class'&&Date.parse(event.end)>now);
 const nextDeadline=events.find(event=>!event.done&&event.kind!=='class'&&Date.parse(event.end)>now);
 return <div className="content semester-home compact-home">
  <header className="focus-hero">
   <div><p className="eyebrow">MBA LEARNING OS</p><h1>{en?'Find it fast. Never miss what matters.':'快速找到信息，不错过重要节点。'}</h1><p>{en?'One place for schedules, deadlines, course materials and your private notes.':'课程时间、截止日期、课件和私人笔记，一个入口就够了。'}</p></div>
   <Link className="home-search-link" href="/map">⌕ <span>{en?'Search courses, concepts and materials':'搜索课程、知识与资料'}</span><b>→</b></Link>
  </header>
  <section className="today-strip" aria-label={en?'What matters next':'接下来最重要的信息'}>
   <article><span className="status-label">{en?'NEXT CLASS':'下一节课'}</span>{nextClass?<><strong>{eventTitle(nextClass,en)}</strong><p>{new Date(nextClass.start).toLocaleString(en?'en-GB':'zh-CN',{timeZone:'Asia/Shanghai',month:'short',day:'numeric',weekday:'short',hour:'2-digit',minute:'2-digit'})}</p><small>{nextClass.location||(en?'Location pending':'地点待补充')}</small></>:<><strong>{en?'No upcoming class':'暂无即将开始的课程'}</strong><p>{en?'Your schedule is clear for now.':'当前没有需要提醒的课程。'}</p></>}<Link href="/calendar">{en?'Open Schedule':'查看 Schedule'} →</Link></article>
   <article className="deadline-summary"><span className="status-label">{en?'NEXT DEADLINE':'最近截止日期'}</span>{nextDeadline?<><strong>{eventTitle(nextDeadline,en)}</strong><p>{deadline(nextDeadline).days} {en?'days left':'天后截止'}</p><progress max={100} value={deadline(nextDeadline).percent}/></>:<><strong>{en?'No deadline added':'尚未添加 Deadline'}</strong><p>{en?'Add homework or exam dates in Schedule.':'在 Schedule 中补充作业或考试时间。'}</p></>}<Link href="/calendar">{en?'Manage deadlines':'管理 Deadline'} →</Link></article>
  </section>
  <div className="two-lines">
   <Link className="product-line schedule-line" href="/calendar"><span className="line-number">01</span><div><p className="eyebrow">TIME & DEADLINES</p><h2>Schedule</h2><p>{en?'Classes, homework deadlines and exams, with a class-sharing path for verified members.':'课程、作业 Deadline 与考试集中查看；通过验证后，一位同学发布即可同步给全班。'}</p><ul><li>{en?'Weekly and monthly views':'本周与月历视图'}</li><li>{en?'Class deadline updates':'班级 Deadline 同步'}</li><li>{en?'Calendar export':'导入手机或电脑日历'}</li></ul></div><b>↗</b></Link>
   <Link className="product-line map-line" href="/map"><span className="line-number">02</span><div><p className="eyebrow">MATERIALS & KNOWLEDGE</p><h2>Map</h2><p>{en?'Follow each course from chapters to concepts, frameworks and cases.':'按“课程—章节—概念—框架 / 案例”浏览 IMBA 课件与笔记整理出的思维导图。'}</p><ul><li>{en?'Chapter mind maps':'章节思维导图'}</li><li>{en?'Frameworks and cases':'概念框架与案例'}</li><li>{en?'Private notes':'私人笔记'}</li></ul></div><b>↗</b></Link>
  </div>
  <section className="course-index"><div className="section-heading"><div><p className="eyebrow">9 COURSES</p><h2>{en?'Jump into the map':'从课程进入地图'}</h2></div><Link href="/map">{en?'Open full map':'打开完整地图'} ↗</Link></div><div>{catalog.courses.map(course=><Link href={'/map?course='+course.slug} key={course.slug}><span>{course.code}</span><b>{course.title}</b></Link>)}</div></section>
 </div>;
}
