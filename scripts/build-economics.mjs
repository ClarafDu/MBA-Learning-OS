import {readFile,writeFile,mkdir,copyFile} from 'node:fs/promises';
import {resolve,join} from 'node:path';
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export async function buildEconomics({outputDir,basePath='',siteOrigin='https://clarafdu.github.io'}){
 const from=resolve('integrations/economics'),to=join(outputDir,'economics'),root=basePath+'/economics/';
 const data=JSON.parse(await readFile(join(from,'content.json'),'utf8')),cases=JSON.parse(await readFile(join(from,'cases.json'),'utf8')).cases;
 await mkdir(to,{recursive:true});
 for(const name of ['app.js','math.js','state.js','labs.js','styles.css','content.json','cases.json','icon.svg'])await copyFile(join(from,name),join(to,name));
 const raw=(await readFile(join(from,'index.html'),'utf8')).replace(/((?:href|src)=")\.\//g,(_,prefix)=>prefix+root);
 const link=(route,title)=>`<a href="${root+route}/">${esc(title)}</a>`;
 const map=`<header><h1>💲 经济学 · Economics</h1><p>4 modules · ${data.nodes.length} bilingual concepts · ${cases.length} decision cases · ${data.nodes.length*2} questions</p><p>知识树、场景决策与互动模型 / Knowledge tree, decisions and interactive models.</p>${link('cases','案例实验室 / Cases')} · ${link('labs','互动模型 / Models')}</header><div id="knowledge-map">${data.groups.map(g=>`<section><h2>${esc(g.title.zh)} · ${esc(g.title.en)}</h2><ul>${data.nodes.filter(n=>n.group===g.id).map(n=>`<li>${link('learn/'+n.id,n.title.zh+' · '+n.title.en)}</li>`).join('')}</ul></section>`).join('')}</div>`;
 const caseList=`<h1>案例实验室 / Case laboratory</h1>${cases.map(c=>`<article><h2>${link('cases/'+c.id,c.title.zh+' · '+c.title.en)}</h2><p>${c.kind==='slides'?'课件案例改编 / Adapted slide case':'原创教学模拟 / Teaching simulation'}</p><p>${esc(c.question.zh)} · ${esc(c.question.en)}</p></article>`).join('')}`;
 const concept=n=>`${['zh','en'].map(lang=>`<article lang="${lang==='zh'?'zh-CN':'en'}"><h${lang==='zh'?'1':'2'}>${esc(n.title[lang])}</h${lang==='zh'?'1':'2'}><p>${esc(n.goal[lang])}</p>${n.body.map(p=>`<p>${esc(p[lang])}</p>`).join('')}<pre class="formula">${esc(n.formula[lang])}</pre><ul>${n.symbols.map(s=>`<li>${esc(s[lang])}</li>`).join('')}</ul><h3>${lang==='zh'?'分步例题':'Worked example'}</h3><p>${esc(n.example.scenario[lang])}</p><ol>${n.example.steps.map(s=>`<li>${esc(s[lang])}</li>`).join('')}</ol>${n.pitfalls.map(s=>`<p>${esc(s[lang])}</p>`).join('')}<h3>${lang==='zh'?'先修与案例':'Prerequisites and cases'}</h3>${n.prerequisites.map(id=>link('learn/'+id,data.nodes.find(x=>x.id===id).title[lang])).join(' · ')}<ul>${cases.filter(c=>c.concepts.includes(n.id)).map(c=>`<li>${link('cases/'+c.id,c.title[lang])}</li>`).join('')}</ul><p>${esc(n.source)} · PDF ${n.pages.join(', ')}</p></article>`).join('')}<p>启用JavaScript使用实验、练习和本机记录。Enable JavaScript for models, practice and local records.</p>`;
 const caseBody=c=>['zh','en'].map(lang=>`<article lang="${lang==='zh'?'zh-CN':'en'}"><h${lang==='zh'?'1':'2'}>${esc(c.title[lang])}</h${lang==='zh'?'1':'2'}><p>${esc(c.context[lang])}</p><h3>${esc(c.question[lang])}</h3><ul>${c.options.map(o=>`<li>${esc(o.label[lang])} — ${esc(o.feedback[lang])}</li>`).join('')}</ul>${c.information.map(p=>`<p>${esc(p[lang])}</p>`).join('')}<ol>${c.analysis.map(p=>`<li>${esc(p[lang])}</li>`).join('')}</ol><p>${esc(c.transfer[lang])}</p>${c.concepts.map(id=>link('learn/'+id,data.nodes.find(n=>n.id===id).title[lang])).join(' · ')}<p>${esc(c.source)}</p></article>`).join('');
 async function page(route,contents,title,index=true){
  const canonical=new URL(root+route,siteOrigin).href;
  const html=raw.replace(/<title>.*?<\/title>/,()=>`<title>${esc(title)}</title>`).replace('</head>',()=>`<link rel="canonical" href="${esc(canonical)}"><meta name="robots" content="${index?'index,follow':'noindex,follow'}"></head>`).replace(/(<main id="main"[^>]*>)[\s\S]*?(<\/main>)/,(_,a,b)=>a+contents+b);
  const dir=join(to,route);await mkdir(dir,{recursive:true});await writeFile(join(dir,'index.html'),html);
 }
 await page('',map,'💲 经济学 · Economics · MBA Learning OS');
 for(const n of data.nodes)await page('learn/'+n.id+'/',concept(n),n.title.zh+' · '+n.title.en+' · Economics');
 await page('cases/',caseList,'案例实验室 · Economics');
 for(const c of cases)await page('cases/'+c.id+'/',caseBody(c),c.title.zh+' · '+c.title.en+' · Economics');
 for(const route of ['labs','notes','review','practice','continue','about'])await page(route+'/',map,'Economics · '+route,!['notes','review','practice','continue'].includes(route));
 console.log(`Economics exported: ${data.nodes.length} bilingual concepts, ${cases.length} cases, ${data.nodes.length*2} questions.`);
 return {nodes:data.nodes.length,cases:cases.length,root};
}
