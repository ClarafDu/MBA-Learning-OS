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
test('revision summaries have real source notes, page references and bilingual points',()=>{
 const notes=read('lecture-notes.json'),summaries=read('review-summaries.json');
 assert.equal(summaries.length,6);
 assert.equal(new Set(summaries.map(s=>s.lesson)).size,summaries.length);
 for(const summary of summaries){
  assert.ok(notes.some(n=>n.id===summary.lesson));assert.ok(summary.pages);
  assert.ok(summary.pointsZh.length>=4);assert.equal(summary.pointsZh.length,summary.pointsEn.length);
 }
});
