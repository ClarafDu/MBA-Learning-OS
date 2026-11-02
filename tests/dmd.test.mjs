import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile,mkdtemp,writeFile} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {mean,variance,normalCDF,binomial,bayes,sampleMeans,confidenceIntervals,combinedVariance,testP,galtonSequence,sweepValue} from '../integrations/dmd/math.js';
import {empty,valid,merge,review,evaluate} from '../integrations/dmd/state.js';
import {buildDmd} from '../scripts/build-dmd.mjs';
import {buildSitemap} from '../scripts/build-sitemap.mjs';
const data=JSON.parse(await readFile(new URL('../integrations/dmd/content.json',import.meta.url)));
const near=(a,b,t=1e-6)=>assert.ok(Math.abs(a-b)<t,`${a} versus ${b}`);
test('DMD content is bilingual, connected, source-bounded, with explicit preview scope',async()=>{
 assert.equal(data.nodes.length,37);const ids=new Set(data.nodes.map(n=>n.id));assert.equal(ids.size,37);const qids=new Set();
 function bilingual(value){if(!value||typeof value!=='object')return;if('zh'in value||'en'in value){assert.ok(typeof value.zh==='string'&&value.zh.length>0);assert.ok(typeof value.en==='string'&&value.en.length>0);assert.ok(!/[\u4e00-\u9fff]/.test(value.en),'Untranslated English: '+value.en);}for(const v of Object.values(value))if(typeof v==='object')bilingual(v);}
 bilingual(data);
 const pageCounts={'lecture1-0910.pdf':53,'lecture2-0917.pdf':44,'lecture3-0924.pdf':48,'lecture4-1015.pdf':50,'lecture5-1022.pdf':46,'lecture6-1029new.pdf':47,'lecture7-1105.pdf':53};
 for(const n of data.nodes){assert.equal(n.questions.length,2);assert.ok(n.body.length>=3);assert.equal(n.example.steps.length,4);assert.ok(n.pitfalls.length);for(const id of n.prerequisites)assert.ok(ids.has(id));if(n.group!=='foundation'){assert.ok(pageCounts[n.source]);assert.ok(n.pages.length);for(const p of n.pages)assert.ok(p>=1&&p<=pageCounts[n.source]);}for(const q of n.questions){assert.ok(!qids.has(q.id));qids.add(q.id);assert.ok(evaluate(q,q.answer));if(q.type==='choice'){assert.equal(q.options.length,3);assert.ok(q.answer>=0&&q.answer<3);}else assert.ok(Number.isFinite(q.answer));}}
 const seen=new Set(),active=new Set();function visit(id){assert.ok(!active.has(id),'Prerequisite cycle');if(seen.has(id))return;active.add(id);data.nodes.find(n=>n.id===id).prerequisites.forEach(visit);active.delete(id);seen.add(id);}ids.forEach(visit);assert.equal(qids.size,74);
 const media=JSON.parse(await readFile(new URL('../integrations/dmd/media.json',import.meta.url)));bilingual(media);assert.equal(media.resources.filter(m=>m.teacherSource).length,10);assert.equal(media.resources.filter(m=>m.kind==='video').length,8);const mids=new Set(media.resources.map(m=>m.id));for(const n of data.nodes)for(const id of n.media)assert.ok(mids.has(id),'Missing resource '+id);for(const m of media.resources){assert.equal(new URL(m.url).protocol,'https:');assert.ok(m.verification.en);if(m.videoId)assert.match(m.videoId,/^[a-zA-Z0-9_-]{11}$/);}
});
test('visual math agrees with independent textbook reference values and probability identities',()=>{
 near(mean([8,12]),10);near(variance([8,12]),4);near(variance([8,12],true),8);
 near(normalCDF(1.96),.9750021048517795,1e-7);near(normalCDF(-2),.0227501319481792,1e-7);near(normalCDF(0),.5);
 for(const n of [1,5,30])for(const p of [0,.05,.5,.95,1]){const probs=binomial(n,p);near(probs.reduce((s,x)=>s+x,0),1);near(probs.reduce((s,x,k)=>s+k*x,0),n*p);}
 near(binomial(3,.5)[2],.375);near(bayes(.1,.8,.2).posterior,80/260);near(combinedVariance(10,15,-1),25);near(combinedVariance(10,15,1),625);
 near(testP(2,'two'),.0455002638963584,2e-7);near(testP(-2,'left'),.0227501319481792,1e-7);near(testP(2,'right'),testP(-2,'left'));
 const means=sampleMeans(25,20000);near(mean(means),1,.01);near(Math.sqrt(variance(means,true)),.2,.01);
 const intervals=confidenceIntervals(25,1.959964,20000);near(intervals.filter(i=>i.covers).length/intervals.length,.95,.01);for(const i of intervals.slice(0,5))near(i.hi-i.lo,2*1.959964*2);
});
test('backup merge retains edits, deletion markers and attempts, and rejects invalid data',()=>{
 const a=empty(),b=empty();a.notes=[{id:'note-1',node:'numbers',body:'original',kind:'question',at:1,deleted:false}];b.notes=[{...a.notes[0],body:'later',at:2,deleted:true}];b.progress.numbers={status:'question',at:2};assert.ok(valid(a));const m=merge(a,b);assert.equal(m.notes[0].deleted,true);assert.equal(m.notes[0].body,'later');assert.equal(m.progress.numbers.status,'question');assert.throws(()=>merge(a,{app:'accounting'}));assert.equal(a.notes[0].body,'original');assert.ok(!valid({...a,notes:[{...a.notes[0],at:-1}]}));
});
test('hinted success stays in review; independent success is retained for later recall',()=>{
 const q=data.nodes[0].questions[0],s=empty();s.attempts=[{id:'a1',question:q.id,value:String(q.answer),correct:true,hinted:true,at:1}];assert.ok(review(s,[q],2)[0].needsWork);s.attempts.push({id:'a2',question:q.id,value:String(q.answer),correct:true,hinted:false,at:3});const r=review(s,[q],4)[0];assert.equal(r.needsWork,false);assert.equal(r.due,false);assert.ok(review(s,[q],4*86400000)[0].due);assert.equal(evaluate({type:'number',answer:0,tolerance:.001},''),false);
});
test('DMD export creates bilingual reloadable pages and noindex personal utility pages',async()=>{
 const out=await mkdtemp(join(tmpdir(),'dmd-test-')),opts={outputDir:out,basePath:'/MBA-Learning-OS'};await writeFile(join(out,'index.html'),'<h1>MBA</h1>');const result=await buildDmd(opts);assert.equal(result.nodes,37);const html=await readFile(join(out,'dmd/learn/standard-error/index.html'),'utf8');assert.ok(html.includes('抽样分布与标准误'));assert.ok(html.includes('Sampling distributions'));assert.ok(html.includes('src="/MBA-Learning-OS/dmd/app.js"'));assert.ok(html.includes('href="https://clarafdu.github.io/MBA-Learning-OS/dmd/learn/standard-error/"'));assert.equal((html.match(/<main /g)||[]).length,1);const urls=await buildSitemap(opts);assert.ok(urls.some(u=>u.endsWith('/dmd/learn/standard-error/')));assert.ok(!urls.some(u=>/\/dmd\/(notes|review|practice)\//.test(u)));
});

test('animated Galton paths obey Bernoulli trials and sweep controls stay on their bounds',()=>{
 for(const p of [0,.2,.5,1]){const paths=galtonSequence(10,p,10000,123);for(const path of paths){assert.equal(path.length,11);assert.equal(path[0],0);for(let j=1;j<path.length;j++)assert.ok([0,1].includes(path[j]-path[j-1]));}near(mean(paths.map(path=>path.at(-1))),10*p,.06);}
 const slider={min:3,max:15,step:1};assert.equal(sweepValue(slider,0),3);assert.equal(sweepValue(slider,60),15);assert.equal(sweepValue(slider,100),15);for(let j=0;j<=60;j++){const value=sweepValue(slider,j);assert.ok(value>=3&&value<=15);assert.equal(value%1,0);}
});
