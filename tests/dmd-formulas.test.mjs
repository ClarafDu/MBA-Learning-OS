import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile,mkdtemp} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {buildDmd} from '../scripts/build-dmd.mjs';
const esc=s=>s.replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;').replaceAll("'",'&#39;');
test('formula export retains bilingual formulas, notation, conditions and complete worked examples',async()=>{
 const data=JSON.parse(await readFile(new URL('../integrations/dmd/content.json',import.meta.url)));
 const outputDir=await mkdtemp(join(tmpdir(),'dmd-formulas-'));await buildDmd({outputDir,basePath:'/MBA-Learning-OS'});
 const html=await readFile(join(outputDir,'dmd/formulas/index.html'),'utf8');
 assert.match(html,/canonical.*\/dmd\/formulas\//);assert.match(html,/index,follow/);
 for(const n of data.nodes)for(const lang of ['zh','en']){assert.ok(html.includes(esc(n.title[lang])));for(const symbol of n.symbols)assert.ok(html.includes(symbol[lang].replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;').replaceAll("'",'&#39;')));assert.ok(n.body.length>=3);assert.equal(n.example.steps.length,4);}
 const app=await readFile(new URL('../integrations/dmd/app.js',import.meta.url),'utf8');const mainNav=app.slice(app.indexOf("$('#nav').innerHTML="),app.indexOf("$('#footer').innerHTML="));assert.ok(!mainNav.includes("['formulas'"));assert.match(app,/function labNavigation/);assert.match(app,/r==='formulas'\?'labs'/);assert.match(app,/else if\(r==='formulas'\)formulasPage\(\)/);
});
