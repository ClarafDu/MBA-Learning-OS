import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile,mkdtemp} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {buildDmd} from '../scripts/build-dmd.mjs';
import {derivationHTML} from '../integrations/dmd/derivations.js';
const course=JSON.parse(await readFile(new URL('../integrations/dmd/content.json',import.meta.url)));
const data=JSON.parse(await readFile(new URL('../integrations/dmd/derivations.json',import.meta.url)));
const esc=s=>s.replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
test('every formula/model has its own bilingual derivation and numerical calculation problem',()=>{
 assert.deepEqual(Object.keys(data.entries).sort(),course.nodes.map(n=>n.id).sort());
 function bilingual(pair){assert.ok(pair.zh?.length>0);assert.ok(pair.en?.length>0);assert.ok(!/[\u4e00-\u9fff]/.test(pair.en),pair.en);}
 for(const [id,d] of Object.entries(data.entries)){bilingual(d.kind);assert.ok(d.derivation.length>=4,id);assert.ok(d.example.steps.length>=4,id);bilingual(d.example.scenario);for(const step of [...d.derivation,...d.example.steps])bilingual(step);assert.match(d.example.steps.map(s=>s.en).join(' '),/\d/);}
 assert.match(data.entries.clt.derivation.map(s=>s.en).join(' '),/finite|variance/i);
 assert.match(data.entries.clt.derivation.map(s=>s.en).join(' '),/continuity theorem/);
 assert.match(data.entries['mean-ci'].derivation.map(s=>s.en).join(' '),/orthogonal/);
 assert.match(data.entries.spread.derivation.map(s=>s.en).join(' '),/unbiased/);
 assert.match(data.entries.decision.kind.en,/workflow/i);
});
test('new worked calculations agree with independent quadrature and exact probability sums',()=>{
 const entry=id=>data.entries[id].example.steps.map(s=>s.en).join(' ');
 function integrate(f,a,b,n=20000){const h=(b-a)/n;let sum=f(a)+f(b);for(let i=1;i<n;i++)sum+=(i%2?4:2)*f(a+i*h);return sum*h/3;}
 const phi=x=>Math.exp(-x*x/2)/Math.sqrt(2*Math.PI),cdf=x=>.5+(x<0?-1:1)*integrate(phi,0,Math.abs(x));
 const beta=cdf(1.6448536269514722-3);assert.ok(Math.abs(beta-.08768546324970368)<1e-10);assert.ok(entry('errors').includes(beta.toFixed(6)));assert.ok(entry('errors').includes((1-beta).toFixed(6)));
 let probability=2**-100,total=probability;for(let k=1;k<=55;k++){probability*= (101-k)/k;total+=probability;}assert.ok(entry('binomial-approx').includes(total.toFixed(9)));
 const margin=1.959963984540054*Math.sqrt(.24/100);assert.ok(entry('proportion-ci').includes(margin.toFixed(9)));
 assert.ok(entry('standardize').includes((1-cdf(2)).toFixed(9)));assert.ok(entry('normal').includes((2*cdf(1)-1).toFixed(9)));
 // df=24 t-density normalization computed independently via integer gamma values.
 const gamma12=39916800,gamma12half=316234143225/4096*Math.sqrt(Math.PI);
 const t=x=>gamma12half/(Math.sqrt(24*Math.PI)*gamma12)*(1+x*x/24)**(-12.5);
 assert.ok(entry('mean-test').includes((1-2*integrate(t,0,1)).toFixed(8)));
 assert.ok(19.6/Math.sqrt(97)<=2&&19.6/Math.sqrt(96)>2);
});
test('both static formula hub and concept lessons contain the complete derivation in each language',async()=>{
 const outputDir=await mkdtemp(join(tmpdir(),'dmd-derivations-'));await buildDmd({outputDir,basePath:'/MBA-Learning-OS'});
 const hub=await readFile(join(outputDir,'dmd/formulas/index.html'),'utf8');
 for(const n of course.nodes){const lesson=await readFile(join(outputDir,`dmd/learn/${n.id}/index.html`),'utf8');for(const lang of ['zh','en'])for(const step of [...data.entries[n.id].derivation,...data.entries[n.id].example.steps]){assert.ok(hub.includes(esc(step[lang])),n.id);assert.ok(lesson.includes(esc(step[lang])),n.id);}}
 assert.deepEqual(JSON.parse(await readFile(join(outputDir,'dmd/derivations.json'),'utf8')),data);
});
test('derivation renderer escapes all authored text',()=>{
 const pair={zh:'<script>alert("x")</script>',en:'<img src=x>'};const result=derivationHTML({kind:pair,derivation:[pair],example:{scenario:pair,steps:[pair]}},'en');assert.ok(!result.includes('<img'));assert.ok(result.includes('&lt;img'));
});
