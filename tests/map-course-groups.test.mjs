import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const source=readFileSync(new URL('../app/components/KnowledgeMap.tsx',import.meta.url),'utf8');
const catalog=JSON.parse(readFileSync(new URL('../content/public/catalog.json',import.meta.url),'utf8'));
const list=name=>JSON.parse(source.match(new RegExp('const '+name+'=(\\[[^;]+\\]);'))[1].replaceAll("'",'"'));
test('Map prioritizes Accounting, Economics and DMD without changing the global catalog',()=>{
 assert.deepEqual(list('priorityCourses'),['financial-accounting','managerial-economics','data-models-decisions']);
 assert.match(source,/conceptCourse\|\|priorityCourses\[0\]/);
 assert.equal(catalog.courses[0].slug,'managerial-economics');
});
test('Map archives exactly the four user-confirmed completed courses and retains all courses',()=>{
 const focus=list('priorityCourses'),completed=list('completedCourses');
 assert.deepEqual(completed,['strategic-management','esg','chinese-modernization','business-english']);
 assert.equal(new Set([...focus,...completed]).size,7);
 assert.ok([...focus,...completed].every(slug=>catalog.courses.some(c=>c.slug===slug)));
 assert.match(source,/const otherCourses=catalog.courses.filter/);
 assert.match(source,/completedCourses.includes\(initialCourse\)/);
 assert.match(source,/optgroup/);
 assert.match(source,/Completed courses/);
});
