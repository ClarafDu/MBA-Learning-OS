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
test('revision summaries have real source notes, page references and bilingual points',()=>{
 const notes=read('lecture-notes.json'),summaries=read('review-summaries.json');
 assert.equal(summaries.length,6);
 assert.equal(new Set(summaries.map(s=>s.lesson)).size,summaries.length);
 for(const summary of summaries){
  assert.ok(notes.some(n=>n.id===summary.lesson));assert.ok(summary.pages);
  assert.ok(summary.pointsZh.length>=4);assert.equal(summary.pointsZh.length,summary.pointsEn.length);
 }
});
