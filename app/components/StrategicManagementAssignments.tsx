'use client';

import Link from 'next/link';
import deadlines from '@/content/public/deadlines.json';
import {useLanguage} from './Language';

const assignment = deadlines.find(item => item.id === 'strategic-management-final-case-2026-11-16')!;

export default function StrategicManagementAssignments(){
 const {language}=useLanguage();
 const en=language==='en';

 return <section className="course-section" id="final-assignments" aria-labelledby="final-assignments-title">
  <h2 id="final-assignments-title">{en?'Final assignments and grading':'期末任务与成绩构成'}</h2>
  <div className="panel">
   <h3>{en?'Individual final case assignment · 40%':'个人期末案例作业 · 40%'}</h3>
   <p><strong>{en?'Due 16 November 2026 at 09:00 (Shanghai time)':'2026 年 11 月 16 日上午 9:00 截止（上海时间）'}</strong></p>
   <p>{en?assignment.publicDetailsEn:assignment.publicDetails}</p>
   <div className="button-row">
    <a className="button" href={assignment.submissionLink} target="_blank" rel="noreferrer">{en?'Submit final case':'提交个人期末作业'} ↗</a>
    <Link className="button secondary" href={'/calendar?task='+assignment.id+'#countdown'}>{en?'View deadline in Schedule':'在日历中查看截止时间'}</Link>
   </div>
   <h3>{en?'Peer evaluation · 10%':'小组互评 · 10%'}</h3>
   <p>{en?'Complete both forms (5% each) and select your group. Both are due two weeks after the course ends. The timetable lists 2 November as the final class, which puts the deadline on 16 November. The forms give no cutoff time.':'填写两份互评问卷（各占 5%），并选择自己的组别。两份问卷都要求在结课后两周内完成。按课表最后一课 11 月 2 日推算，截止日为 11 月 16 日，问卷未注明具体时刻。'}</p>
   <div className="button-row">
    <a className="button secondary" href="https://www.wjx.cn/vm/YDFTp2z.aspx" target="_blank" rel="noreferrer">{en?'Tesla peer evaluation':'Tesla 互评'} ↗</a>
    <a className="button secondary" href="https://v.wjx.cn/vm/PZtdCfG.aspx" target="_blank" rel="noreferrer">{en?'Apple peer evaluation':'Apple 互评'} ↗</a>
   </div>
   <h3>{en?'Class participation · 10%':'课堂参与 · 10%'}</h3>
   <p>{en?'Complete the participation form. The course announcement gives no deadline.':'填写课堂参与表。课程通知未注明截止时间。'}</p>
   <p>{en?'If you did not get a chance to speak, the course slides (p. 24) allow a 100–150 word reflection to be sent to the teaching assistant by the final assignment deadline.':'如课堂上没有发言机会，课件第 24 页允许在期末作业截止前向助教提交一篇 100–150 词的学习反思。'}</p>
   <div className="button-row">
    <a className="button secondary" href="https://www.kdocs.cn/l/cvbe2RlR44T9" target="_blank" rel="noreferrer">{en?'Open participation form':'打开课堂参与表'} ↗</a>
   </div>
   <h3>{en?'Group case analysis report · 40%':'小组案例分析报告 · 40%'}</h3>
   <p>{en?'Completed, per the course announcement.':'课程通知已标为完成。'}</p>
  </div>
 </section>;
}
