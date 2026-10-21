import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const read=name=>JSON.parse(readFileSync(new URL('../content/public/'+name,import.meta.url),'utf8'));
const framework=read('dmd-framework.json');

test('English DMD content translates every field and preserves the textbook structure',()=>{
 const english=read('dmd-framework.en.json');
 const han=/\p{Script=Han}/u;
 function compare(zh,en,path='framework'){
  assert.equal(typeof en,typeof zh,`${path}: missing or incompatible translation`);
  if(Array.isArray(zh)){
   assert.ok(Array.isArray(en),path);
   assert.equal(en.length,zh.length,`${path}: translated item count differs`);
   zh.forEach((value,index)=>compare(value,en[index],`${path}[${index}]`));
  }else if(zh&&typeof zh==='object'){
   assert.deepEqual(Object.keys(en),Object.keys(zh),`${path}: translated fields differ`);
   for(const key of Object.keys(zh))compare(zh[key],en[key],`${path}.${key}`);
  }else if(typeof zh==='string'){
   assert.ok(en.trim(),`${path}: empty translation`);
   assert.ok(!han.test(en),`${path}: Chinese remains in the English version`);
   if(!han.test(zh))assert.equal(en.normalize('NFKC').replace(/。/g,'.').replace(/\s/g,''),zh.normalize('NFKC').replace(/。/g,'.').replace(/\s/g,''),`${path}: an identifier, number or English textbook title changed`);
  }else assert.equal(en,zh,`${path}: structural value changed`);
 }
 compare(framework,english);
});

test('DMD framework preserves all supplied contents entries, pages and advanced markers',()=>{
 const expectedPages=[
  [2,16,17,30,33,35,44],
  [50,51,54,65,66,67,72,79,82,86,88,91,96,97,100],
  [111,112,115,120,127,132,135,139,139],
  [148,150,161,165,166,169,174,178,180,182,183,189],
  [196,197,199,201,203,205,211,213,217,217,218,219],
  [246,253,258,259,271,274,279,283,288,294,295,313],
  [324,332,335,347,354,365,367,374,375,397],
  [412,420,425,428,431,432,436,444],
  [452,461,464,468,471,471,478],
  [486,496,498,501,502],
 ];
 assert.equal(framework.chapters.length,10);
 assert.equal(framework.chapters.flatMap(chapter=>chapter.sections).length,97);
 framework.chapters.forEach((chapter,index)=>{
  assert.equal(chapter.number,index+1);
  assert.deepEqual(chapter.sections.map(section=>section.page),expectedPages[index]);
  assert.deepEqual(chapter.sections.map(section=>section.id),expectedPages[index].map((_,i)=>`${index+1}.${i+1}`));
 });
 assert.deepEqual(framework.chapters.flatMap(chapter=>chapter.sections.filter(section=>section.advanced).map(section=>section.id)),['2.12','7.7','8.6','9.4']);
 assert.deepEqual(framework.appendix.map(item=>[item.id,item.page]),[['A.1',518],['A.2',519]]);
});

test('DMD chapter prerequisites, source citations and existing class-note links resolve',()=>{
 const lessons=read('lecture-notes.json');
 const refs=new Set(framework.references.map(source=>source.id));
 assert.equal(refs.size,framework.references.length);
 for(const source of framework.references){
  assert.equal(new URL(source.url).protocol,'https:');
  assert.ok(source.scope&&source.checked);
 }
 for(const chapter of framework.chapters){
  assert.ok(chapter.prerequisites.every(number=>number>0&&number<chapter.number));
  assert.ok(chapter.refs.length>=2);
  assert.ok(chapter.refs.every(id=>refs.has(id)));
  assert.ok(chapter.lessons.every(id=>lessons.some(lesson=>lesson.id===id&&lesson.course==='data-models-decisions')));
 }
 assert.ok(framework.chapters.filter(chapter=>chapter.number>=5).every(chapter=>chapter.lessons.length===0));
});

test('every DMD chapter includes usable notes, conditional formulas and a complete worked example',()=>{
 for(const chapter of framework.chapters){
  assert.ok(chapter.question&&chapter.goal);
  assert.ok(chapter.notes.length>=3);
  assert.ok(chapter.notes.every(note=>note.title&&note.points.length>=3));
  assert.ok(chapter.formulas.length>=2);
  assert.equal(chapter.workflow.length,4);
  assert.equal(chapter.example.steps.length,4);
  assert.ok(chapter.pitfalls.length>=3&&chapter.checks.length>=3);
 }
 assert.ok(framework.scope.includes('考试范围'));
 assert.ok(framework.provenance.includes('不冒充课堂纪要'));
});
