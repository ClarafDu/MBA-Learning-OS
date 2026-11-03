import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile,mkdtemp,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import * as math from '../integrations/economics/math.js';
import {labInfo} from '../integrations/economics/labs.js';
import {empty,valid,merge,evaluate,review,KEY} from '../integrations/economics/state.js';
import {buildEconomics} from '../scripts/build-economics.mjs';
const data=JSON.parse(await readFile(new URL('../integrations/economics/content.json',import.meta.url))),cases=JSON.parse(await readFile(new URL('../integrations/economics/cases.json',import.meta.url))).cases;
const close=(a,b)=>assert.ok(Math.abs(a-b)<1e-9,`${a} != ${b}`);
function bilingual(x){if(!x||typeof x!=='object')return;if('zh'in x||'en'in x){assert.equal(typeof x.zh,'string');assert.equal(typeof x.en,'string');assert.ok(x.zh.length&&x.en.length);assert.ok(!/[\u4e00-\u9fff]/u.test(x.en),'Chinese in English: '+x.en);}for(const v of Object.values(x))bilingual(v);}
test('economics covers four source decks with unique bilingual nodes, source bounds and acyclic prerequisites',()=>{
 bilingual(data);bilingual(cases);assert.equal(data.groups.length,4);assert.equal(data.nodes.length,40);assert.equal(cases.length,12);assert.equal(Object.keys(labInfo).length,12);
 const ids=new Set(data.nodes.map(n=>n.id)),qids=new Set();assert.equal(ids.size,40);
 const visit=(id,path=[])=>{assert.ok(!path.includes(id),'cycle '+id);const n=data.nodes.find(n=>n.id===id);assert.ok(n,'missing '+id);for(const pre of n.prerequisites)visit(pre,[...path,id]);};
 for(const n of data.nodes){visit(n.id);assert.ok(labInfo[n.lab]);assert.equal(n.questions.length,2);assert.ok(n.body.length>=2);assert.ok(n.example.steps.length>=3);for(const page of n.pages)assert.ok(Number.isInteger(page)&&page>=1&&page<=[48,106,106,65][Number(n.group.slice(1))-1]);for(const q of n.questions){assert.ok(!qids.has(q.id));qids.add(q.id);assert.ok(evaluate(q,q.type==='choice'?String(q.answer):q.answer));if(q.type==='choice'){assert.equal(q.options.length,3);assert.ok(q.answer>=0&&q.answer<3);}}}
 for(const c of cases){assert.equal(c.options.length,3);assert.ok(c.information.length>=2);assert.ok(c.analysis.length>=2);assert.ok(labInfo[c.lab]);for(const id of c.concepts)assert.ok(ids.has(id));}
 assert.equal(qids.size,80);assert.equal(cases.filter(c=>c.id.startsWith('cafe-')).length,4);
});
test('all forty numeric exercises are independently recomputed',()=>{
 const expected={
  'economic-system':150-90,demand:120-3*20,supply:12+2*8,equilibrium:(90-10)/2,elasticity:-2*40/(120-2*40),'related-demand':.8*5,'market-shocks':(100-40)/3,'market-coordination':150-90,
  'cost-curves':120/40+3,'scale-scope':80+50-110,'opportunity-sunk':30,surplus:.5*(80-30)*20,'taxes-controls':.5*10*(50-40),monopoly:(30-6)/2,'elasticity-pricing':1/5,'two-part':.5*(18-6)**2,segmentation:(24+4)/2,'self-selection':1000-850,bundling:(20-3-3)*4,platforms:130-80-30,
  'game-elements':11,dominance:3+3,nash:2,sequential:Math.max(-10,30),commitment:50-35,bargaining:120-40,repeated:(10-6)/(10-2),cournot:(36-6)/3,stackelberg:(40-8)/4,bertrand:9,'differentiation-location':(30+90)/2,attrition:.25*80-15,
  'adverse-selection':.6*500,'winners-curse':1.5*40/2,'appraisal-screening':150-120-18,'signaling-reputation':40-15,'moral-hazard':.3*20-4,'principal-agent':5*8,'incentive-contracts':(90-60)*.2,'decision-rights':60-20-15
 };assert.equal(Object.keys(expected).length,40);for(const n of data.nodes)close(n.questions[0].answer,expected[n.id]);
});
test('supply, tax and surplus satisfy budget and welfare identities across slider ranges',()=>{
 for(const a of [80,100,140])for(const c of [0,10,50])for(const tax of [0,15,30]){
  const m=math.welfare(a,2,c,1,tax),baseline=math.welfare(a,2,c,1,0);close(m.buyerPrice-m.sellerPrice,tax);close(m.total+m.loss,baseline.total);assert.ok(m.quantity>=0);close(m.revenue,tax*m.quantity);
 }
 const m=math.welfare(100,2,10,1,15);close(m.quantity,25);close(m.buyerPrice,50);close(m.sellerPrice,35);close(m.loss,37.5);
});
test('price changes distinguish revenue from profit and respect membership participation',()=>{
 const a=math.pricing(50,.5,10,0,30),b=math.pricing(50,.5,10,0,25);assert.ok(b.revenue>a.revenue);assert.ok(b.profit<a.profit);close(a.optimalPrice,30);
 assert.equal(math.membership(4,128).joins,true);assert.equal(math.membership(4,129).joins,false);close(math.membership(4,129).profit,0);
 close(math.bundle(10,18,2).separateProfit,16);close(math.bundle(10,18,2).bundleProfit,28);
});
test('game equilibrium, credible entry, quantity models and location obey their stated mechanisms',()=>{
 const pd=[[[8,8],[1,12]],[[12,1],[3,3]]],coord=[[[4,4],[0,0]],[[0,0],[3,3]]],pennies=[[[1,-1],[-1,1]],[[-1,1],[1,-1]]];
 assert.deepEqual(math.bestResponses(pd).filter(x=>x.nash).map(x=>[x.r,x.c]),[[1,1]]);assert.equal(math.bestResponses(coord).filter(x=>x.nash).length,2);assert.equal(math.bestResponses(pennies).filter(x=>x.nash).length,0);
 assert.equal(math.entry(-20,40).enter,true);assert.equal(math.entry(50,20).enter,false);assert.equal(math.entry(20,20).response,'share');
 const q=math.oligopoly();assert.deepEqual([q.monopoly,q.cournot,q.stackelberg,q.bertrand,q.leader,q.follower],[12,16,18,24,12,6]);
 for(const a of [0,25,50,100])for(const b of [0,25,50,100]){const m=math.location(a,b);close(m.leftShare+m.rightShare,1);assert.ok(m.leftShare>=0&&m.leftShare<=1);}close(math.location(30,90).leftShare,.6);
});
test('acceptance conditioning and commission basis change expected values and actions',()=>{
 const m=math.acquisition(60);close(m.conditionalSeller,30);close(m.conditionalBuyer,45);close(m.conditionalProfit,-15);close(m.expectedProfit,-9);close(math.acquisition(0).acceptance,0);
 assert.equal(math.incentives(.1,'revenue').chosen.id,'volume');close(math.incentives(.1,'revenue').net,0);assert.equal(math.incentives(.1,'profit').chosen.id,'value');close(math.incentives(.1,'profit').net,27);
});
test('economics backups merge notes, deletion markers, decisions and review while rejecting other apps',()=>{
 const a=empty(),b=empty();assert.equal(KEY,'mba-economics-learning-v1');assert.ok(valid(a));a.notes=[{id:'n-1',node:'demand',kind:'understanding',body:'<script>not executable</script>',at:1,deleted:false}];b.notes=[{...a.notes[0],at:3,deleted:true}];
 a.decisions['cafe-demand']={initial:0,final:1,before:'old',after:'',transfer:'',at:1};b.decisions['cafe-demand']={...a.decisions['cafe-demand'],after:'new',at:2};
 const result=merge(a,b);assert.equal(result.notes[0].deleted,true);assert.equal(result.decisions['cafe-demand'].after,'new');assert.equal(a.decisions['cafe-demand'].after,'');assert.throws(()=>merge(a,{...b,app:'dmd'}));assert.ok(!valid({...b,decisions:{bad:{}}}));
 const q=data.nodes[0].questions[1];assert.equal(evaluate({...q,answer:0},''),false);assert.equal(evaluate({...q,answer:0},null),false);assert.equal(evaluate(data.nodes[0].questions[0],''),false);
 a.attempts=[{id:'try-1',question:q.id,value:'1',correct:true,hinted:true,at:1}];assert.equal(review(a,[q],2)[0].needsWork,true);a.attempts.push({id:'try-2',question:q.id,value:'0',correct:true,hinted:false,at:3});assert.equal(review(a,[q],4)[0].needsWork,false);assert.equal(review(a,[q],4)[0].due,false);
});
test('export provides reloadable bilingual concept and case URLs with canonical base paths',async()=>{
 const out=await mkdtemp(join(tmpdir(),'economics-test-'));try{const result=await buildEconomics({outputDir:out,basePath:'/MBA-Learning-OS'});assert.equal(result.nodes,40);assert.equal(result.cases,12);
 const html=await readFile(join(out,'economics/learn/winners-curse/index.html'),'utf8');assert.ok(html.includes('收购报价与赢家诅咒'));assert.ok(html.includes('Acquisition offers and the winner'));assert.ok(html.includes('src="/MBA-Learning-OS/economics/app.js"'));assert.ok(html.includes('href="https://clarafdu.github.io/MBA-Learning-OS/economics/learn/winners-curse/"'));assert.equal((html.match(/<main /g)||[]).length,1);
 const page=await readFile(join(out,'economics/cases/cafe-demand/index.html'),'utf8');assert.ok(page.includes('Corner café'));assert.ok(page.includes('750'));const notes=await readFile(join(out,'economics/notes/index.html'),'utf8');assert.ok(notes.includes('noindex,follow'));
 }finally{await rm(out,{recursive:true,force:true});}
});
