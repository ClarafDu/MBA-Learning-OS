import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile,mkdtemp} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {buildDmd} from '../scripts/build-dmd.mjs';
const glossary=JSON.parse(await readFile(new URL('../integrations/dmd/glossary.json',import.meta.url)));
const course=JSON.parse(await readFile(new URL('../integrations/dmd/content.json',import.meta.url)));
test('DMD glossary pairs unique bilingual terms with valid course concepts and memory cues',()=>{
 assert.equal(glossary.terms.length,60);
 for(const key of ['id','zh','en'])assert.equal(new Set(glossary.terms.map(t=>t[key])).size,60);
 for(const t of glossary.terms){const node=course.nodes.find(n=>n.id===t.node);assert.ok(node,t.node);assert.equal(t.group,node.group);assert.ok(t.symbol);for(const field of ['meaning','memory'])for(const lang of ['zh','en'])assert.ok(t[field][lang]?.length>8);assert.ok(!/[\u4e00-\u9fff]/.test(t.meaning.en+t.memory.en));}
 const find=en=>glossary.terms.find(t=>t.en===en);
 assert.match(find('Standard deviation').memory.en,/standard error/);
 assert.match(find('Probability density').memory.en,/exceed 1/);
 assert.match(find('p-value').memory.en,/neither the probability H₀ is true/);
 assert.match(find('Conditional probability').memory.en,/differs/);
});
test('glossary deep link exports complete bilingual content and lesson links without JavaScript',async()=>{
 const outputDir=await mkdtemp(join(tmpdir(),'dmd-glossary-'));await buildDmd({outputDir,basePath:'/MBA-Learning-OS'});
 const html=await readFile(join(outputDir,'dmd/glossary/index.html'),'utf8');
 for(const t of glossary.terms){assert.ok(html.includes(t.zh));assert.ok(html.includes(t.en));assert.ok(html.includes(`/dmd/learn/${t.node}/`));}
 assert.match(html,/index,follow/);assert.match(html,/canonical.*\/dmd\/glossary\//);
 assert.deepEqual(JSON.parse(await readFile(join(outputDir,'dmd/glossary.json'),'utf8')),glossary);
});
