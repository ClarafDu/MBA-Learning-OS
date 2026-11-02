import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const read=name=>JSON.parse(readFileSync(new URL('../content/public/'+name+'.json',import.meta.url),'utf8'));
test('November slide deadlines preserve exact versus unconfirmed times',()=>{
 const tasks=read('deadlines');
 const accounting=tasks.filter(x=>x.id==='accounting-homework4-20261107');
 assert.equal(accounting.length,1);
 assert.equal(accounting[0].start,'2026-11-07T23:00:00+08:00');
 assert.equal(accounting[0].timeConfirmed,true);
 assert.match(accounting[0].source,/p\.77/);
 const dmd=tasks.find(x=>x.id==='dmd-homework6-20261126');
 assert.equal(dmd.start.slice(0,10),'2026-11-26');
 assert.equal(dmd.timeConfirmed,false);
 assert.equal(dmd.submissionLink,'');
});
test('new slide guides have bilingual topics, page references and map links',()=>{
 const notes=read('lecture-notes'),maps=read('course-map'),reviews=read('review-summaries');
 for(const id of ['accounting-1026','accounting-1102','dmd-1105']){
  const lesson=notes.find(x=>x.id===id);
  assert.ok(lesson);
  for(const topic of lesson.topics){
   assert.equal(topic.pointsZh.length,topic.pointsEn.length);
   assert.ok(topic.pages&&topic.caseZh&&topic.caseEn);
   assert.ok(maps.find(x=>x.course===lesson.course).chapters.find(x=>x.id===topic.chapter).concepts.some(x=>x.id===topic.id));
  }
  assert.ok(reviews.some(x=>x.lesson===id));
 }
 const updated=notes.find(x=>x.id==='dmd-1029');
 assert.equal(updated.source,'lecture6-1029new.pdf');
 assert.match(updated.topics.find(x=>x.id==='dmd-1029-mean-ci').caseEn,/p\.46/);
 assert.match(notes.find(x=>x.id==='dmd-1105').titleEn,/preparation/);
});
