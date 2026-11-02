import {test} from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,readFile,mkdir,writeFile,stat} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {buildAccounting} from '../scripts/build-accounting.mjs';
import {buildSitemap} from '../scripts/build-sitemap.mjs';
import {accountingHref,accountingRoute} from '../scripts/accounting-routes.mjs';

test('accounting has reloadable nested URLs under a GitHub project base path',()=>{
 const root='/MBA-Learning-OS/accounting/';
 assert.equal(accountingHref('map',root),root);
 assert.equal(accountingHref('learn/l7-dta',root),root+'learn/l7-dta/');
 assert.equal(accountingRoute(root+'learn/l7-dta/',root),'#learn/l7-dta');
 assert.equal(accountingRoute(root+'notes/',root),'#notes');
});
test('export creates standalone crawlable concept pages and a sitemap without private workspaces',async()=>{
 const out=await mkdtemp(join(tmpdir(),'mba-accounting-test-'));
 const opts={outputDir:out,basePath:'/MBA-Learning-OS'};
 await writeFile(join(out,'index.html'),'<h1>MBA Learning OS</h1>');
 await mkdir(join(out,'my-os'));await writeFile(join(out,'my-os','index.html'),'<h1>Private workspace shell</h1>');
 const result=await buildAccounting(opts);assert.equal(result.nodes,70);
 const html=await readFile(join(out,'accounting/learn/l7-dta/index.html'),'utf8');
 assert.ok(html.includes('<link rel="canonical" href="https://clarafdu.github.io/MBA-Learning-OS/accounting/learn/l7-dta/">'));
 assert.ok(html.includes('递延所得税资产'));assert.ok(html.includes('A qualifying future deduction')||html.includes('future tax benefit'));
 assert.ok(html.includes('src="/MBA-Learning-OS/accounting/app.js"'));
 assert.equal((html.match(/<main id="main"/g)||[]).length,1,'Dollar amounts must not expand replacement capture groups');
 assert.equal((html.match(/<\/main>/g)||[]).length,1);
 assert.ok(html.includes('$200'),'Keep literal dollar amounts intact');
 assert.ok(!html.includes('href="#map"'));
 assert.ok(html.includes('href="/MBA-Learning-OS/"'));
 const app=await readFile(join(out,'accounting/app.js'),'utf8');assert.ok(!app.includes('location.hash'));assert.ok(app.includes("form.getAttribute('id')==='note-form'"));
 const sw=await readFile(join(out,'accounting/sw.js'),'utf8');assert.ok(sw.includes("k.startsWith('mba-accounting-')"));assert.ok(!sw.includes("k.startsWith('xunzhang-')"));
 assert.ok((await stat(join(out,'accounting/notes/index.html'))).isFile());
 const urls=await buildSitemap(opts);assert.ok(urls.includes('https://clarafdu.github.io/MBA-Learning-OS/accounting/learn/l7-dta/'));assert.ok(!urls.some(u=>u.includes('#')||u.includes('/notes/')||u.includes('/my-os/')));
 const robot=await readFile(join(out,'robots.txt'),'utf8');assert.ok(robot.includes('https://clarafdu.github.io/MBA-Learning-OS/sitemap.xml'));
});
