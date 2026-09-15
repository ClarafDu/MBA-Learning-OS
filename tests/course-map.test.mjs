import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';

const outlines=JSON.parse(await readFile(new URL('../content/public/course-map.json',import.meta.url),'utf8'));

test('every course outline has unique navigable concepts',()=>{
 assert.equal(outlines.length,9);
 const ids=new Set();
 for(const outline of outlines)for(const chapter of outline.chapters){
  assert.ok(chapter.source);
  assert.ok(chapter.concepts.length>0);
  for(const concept of chapter.concepts){
   assert.ok(!ids.has(concept.id),`duplicate concept id: ${concept.id}`);
   ids.add(concept.id);
   for(const field of ['titleZh','titleEn','summaryZh','summaryEn','caseZh','caseEn'])assert.ok(concept[field],`${concept.id} missing ${field}`);
  }
 }
 assert.ok(ids.size>=60);
});

test('course design screenshots structure the three supplied courses',()=>{
 const expected={
  'managerial-economics':['导论','市场运行规律','弹性分析与应用','成本分析','经营决策定律','完全竞争市场'],
  'financial-accounting':['会计假设与一般原则','财务报表','记账原理','会计循环'],
  'data-models-decisions':['概率论基础','离散型概率分布','连续型概率分布','多个随机变量及其关系','大数定律与中心极限定理'],
 };
 for(const [course,titles] of Object.entries(expected)){
  const outline=outlines.find(item=>item.course===course);
  assert.ok(outline.sources.includes('课程章节设计截图'));
  for(const title of titles)assert.ok(outline.chapters.some(chapter=>chapter.titleZh.includes(title)),`${course} missing ${title}`);
 }
});
