import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const tasks=JSON.parse(readFileSync(new URL('../content/public/deadlines.json',import.meta.url),'utf8'));
test('Accounting Homework 4 gains its sheet link without duplicate tasks or loss of the confirmed time',()=>{
 const matches=tasks.filter(x=>x.course==='financial-accounting'&&x.start.startsWith('2026-11-07'));
 assert.equal(matches.length,1);
 assert.equal(matches[0].id,'accounting-homework4-20261107');
 assert.equal(matches[0].start,'2026-11-07T23:00:00+08:00');
 assert.equal(matches[0].timeConfirmed,true);
 const url=new URL(matches[0].submissionLink);
 assert.equal(url.hostname,'lms.fdsm.fudan.edu.cn');
 assert.equal(url.searchParams.get('content_id'),'_32985_1');
});
test('ESG reflection has the explicit November 7 17:00 deadline and authorized questionnaire',()=>{
 const task=tasks.find(x=>x.id==='esg-2026-11-07-1700-35');
 assert.equal(task.start,'2026-11-07T17:00:00+08:00');
 assert.equal(task.timeConfirmed,true);
 assert.equal(task.submissionLink,'https://wj.qq.com/s2/28528054/xbp4/');
 assert.ok(task.publicDetailsEn);
});
test('conflicting strategy final date is not silently imported from the sheet',()=>{
 assert.equal(tasks.some(x=>x.source==='00IMBA_Deadlines.xlsx 第 34 行'),false);
});
