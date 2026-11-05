import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,statSync} from 'node:fs';
const read=file=>readFileSync(new URL('../'+file,import.meta.url),'utf8');
test('shared shell defers public search content and retains keyboard and retry paths',()=>{
 const shell=read('app/components/SiteShell.tsx');
 assert.doesNotMatch(shell,/^import (?!type).*course-map|^import (?!type).*lecture-notes/m);
 assert.match(shell,/await import\('@\/lib\/public-search'\)/);
 assert.match(shell,/ctrlKey/);
 assert.match(shell,/setSearchError\(true\)/);
 assert.match(shell,/void loadSearch\(\)/);
 assert.match(shell,/record.owner===ws.ownerId/);
 const search=read('lib/public-search.ts');
 assert.match(search,/lessonSearchItems/);
 assert.match(search,/concept.caseZh/);
 assert.match(search,/concept.caseEn/);
});
test('schedule sections mount on first visit and keep visited sections alive',()=>{
 const planner=read('app/components/Planner.tsx');
 assert.match(planner,/dynamic\(\(\)=>import\('\.\/CourseSchedule'\)/);
 assert.match(planner,/visited.courses&&/);
 assert.match(planner,/visited.campus&&/);
 assert.match(planner,/visited.tools&&/);
 assert.match(planner,/\.\.\.previous,\[tab\]:true/);
 assert.match(planner,/id="all-courses"/);
 assert.match(planner,/id="campus-activities"/);
});
test('display logo and favicon stay small while original artwork is preserved',()=>{
 for(const [file,max] of [['class-logo-small.webp',12000],['favicon-32.png',5000],['apple-touch-icon.png',60000]])assert.ok(statSync(new URL('../public/'+file,import.meta.url)).size<max,file);
 assert.ok(statSync(new URL('../public/class-logo.png',import.meta.url)).size>1000000);
 assert.match(read('app/components/SiteShell.tsx'),/class-logo-small.webp/);
 assert.doesNotMatch(read('app/layout.tsx'),/\/class-logo.png/);
});
test('shell, task and course link lists do not automatically prefetch other routes',()=>{
 for(const name of ['SiteShell','TaskReminder','CourseSchedule','Planner']){
  const source=read('app/components/'+name+'.tsx');
  assert.doesNotMatch(source,/<Link (?!prefetch=\{false\})/);
 }
});
