import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {expandWeeklySchedule} from '../lib/schedule.mjs';
const read=name=>JSON.parse(readFileSync(new URL('../content/public/'+name,import.meta.url),'utf8'));
test('ESG dates match the seven sessions on source slide 17',()=>{
 const series=read('schedule.json');
 const dates=expandWeeklySchedule(series).filter(e=>e.course==='esg').map(e=>e.start.slice(0,10));
 assert.deepEqual(dates,['2026-09-09','2026-09-16','2026-09-23','2026-10-14','2026-10-21','2026-10-28','2026-11-04']);
 assert.throws(()=>expandWeeklySchedule([{...series.find(s=>s.course==='esg'),excludedDates:['2026-09-10']}]));
});
test('Strategic Management has seven verified dates and B414 for sessions four and seven',()=>{
 const series=read('schedule.json');
 const classes=expandWeeklySchedule(series).filter(e=>e.course==='strategic-management');
 assert.deepEqual(classes.map(e=>e.start.slice(0,10)),['2026-09-07','2026-09-14','2026-09-21','2026-10-12','2026-10-19','2026-10-26','2026-11-02']);
 assert.deepEqual(classes.map(e=>e.location),['政立院区 A419 教室','政立院区 A419 教室','政立院区 A419 教室','政立院区 B414 教室','政立院区 A419 教室','政立院区 A419 教室','政立院区 B414 教室']);
 assert.throws(()=>expandWeeklySchedule([{...series.find(s=>s.course==='strategic-management'),locationOverrides:{'2026-09-28':'B414'}}]));
});
test('published schedule matches all 81 rows in the September 28 semester timetable',()=>{
 const classes=expandWeeklySchedule(read('schedule.json'));
 const expected={
  'career-development':['2026-11-25','2026-12-02','2026-12-09','2026-12-16'],
  'organizational-processes-behavior':['2026-11-25','2026-12-02','2026-12-09','2026-12-16','2026-12-23','2026-12-30','2027-01-06'],
  'business-english':['2026-09-13','2026-09-27','2026-10-11','2026-10-18','2026-10-25','2026-11-01','2026-11-08'],
  'strategic-management':['2026-09-07','2026-09-14','2026-09-21','2026-10-12','2026-10-19','2026-10-26','2026-11-02'],
  esg:['2026-09-09','2026-09-16','2026-09-23','2026-10-14','2026-10-21','2026-10-28','2026-11-04'],
  'chinese-modernization':['2026-09-11','2026-09-18','2026-10-09','2026-10-16','2026-10-23','2026-10-30','2026-11-06'],
  'financial-accounting':['2026-09-07','2026-09-14','2026-09-21','2026-10-12','2026-10-19','2026-10-26','2026-11-02','2026-11-23','2026-11-30','2026-12-07','2026-12-14','2026-12-21','2026-12-28','2027-01-04'],
  'managerial-economics':['2026-09-08','2026-09-15','2026-09-22','2026-10-13','2026-10-20','2026-10-27','2026-11-03','2026-11-24','2026-12-01','2026-12-08','2026-12-15','2026-12-22','2026-12-29','2027-01-05'],
  'data-models-decisions':['2026-09-10','2026-09-17','2026-09-24','2026-10-15','2026-10-22','2026-10-29','2026-11-05','2026-11-26','2026-12-03','2026-12-10','2026-12-17','2026-12-24','2026-12-31','2027-01-07']
 };
 assert.equal(classes.length,81);
 for(const [course,dates] of Object.entries(expected)){
  const selected=classes.filter(event=>event.course===course);
  assert.deepEqual(selected.map(event=>event.start.slice(0,10)),dates);
  assert.ok(selected.every(event=>event.teacher));
 }
 assert.equal(classes.find(event=>event.course==='chinese-modernization')?.end.slice(11,16),'17:00');
});
test('revision summaries have real source notes, page references and bilingual points',()=>{
 const notes=read('lecture-notes.json'),summaries=read('review-summaries.json');
 assert.ok(summaries.length>=6);
 assert.equal(new Set(summaries.map(s=>s.lesson)).size,summaries.length);
 for(const summary of summaries){
  assert.ok(notes.some(n=>n.id===summary.lesson));assert.ok(summary.pages);
  assert.ok(summary.pointsZh.length>=4);assert.equal(summary.pointsZh.length,summary.pointsEn.length);
 }
});
test('Accounting Homework 3 uses the latest confirmed deadline and sheet submission URL without duplicating the old task',()=>{
 const task=read('deadlines.json').find(e=>e.id==='financial-accounting-homework-3-2026-10-17-2300');
 assert.equal(task.start,'2026-10-24T23:00:00+08:00');
 assert.equal(task.timeConfirmed,true);
 assert.ok(task.submissionLink.includes('content_id=_32672_1'));
 assert.equal(task.source,'00IMBA_Deadlines.xlsx 第 25 行');
 assert.equal(read('deadlines.json').filter(e=>e.title.includes('Homework 3')&&e.course==='financial-accounting').length,1);
});
test('Economics class 4 reflection uses the explicit Monday midnight deadline',()=>{
 const task=read('deadlines.json').find(e=>e.source==='00IMBA_Deadlines.xlsx 第 26 行');
 assert.equal(task.start,'2026-10-20T00:00:00+08:00');
 assert.equal(task.timeConfirmed,true);
 assert.ok(task.submissionLink.includes('content_id=_32719_1'));
});
test('November exams match the user supplied exam timetable',()=>{
 const tasks=read('deadlines.json');
 for(const [course,day,room] of [['esg','11','B309'],['chinese-modernization','13','B507']]){
  const exams=tasks.filter(e=>e.course===course&&e.kind==='final');
  assert.equal(exams.length,1);
  assert.equal(exams[0].start,`2026-11-${day}T14:00:00+08:00`);
  assert.equal(exams[0].end,`2026-11-${day}T16:00:00+08:00`);
  assert.equal(exams[0].location,`政立院区 ${room} 教室`);
 }
});
test('Accounting Lecture 5 has sourced bilingual details, cases and a revision summary',()=>{
 const lesson=read('lecture-notes.json').find(e=>e.id==='fa-1019');
 assert.equal(lesson.date,'2026-10-19');
 assert.equal(lesson.source,'Lecture 5.pdf');
 assert.equal(lesson.topics.length,5);
 for(const topic of lesson.topics){
  assert.equal(topic.chapter,'fa-inventory');
  assert.equal(topic.pointsZh.length,topic.pointsEn.length);
  assert.ok(topic.caseZh&&topic.caseEn&&topic.pages);
 }
 assert.ok(read('course-map.json').find(c=>c.course==='financial-accounting').chapters.some(c=>c.id==='fa-inventory'));
 assert.ok(read('review-summaries.json').some(s=>s.lesson===lesson.id));
});
