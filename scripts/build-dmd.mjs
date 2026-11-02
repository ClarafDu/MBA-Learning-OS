import {readFile,writeFile,mkdir,copyFile} from 'node:fs/promises';
import {resolve,join} from 'node:path';
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export async function buildDmd({outputDir,basePath='',siteOrigin='https://clarafdu.github.io'}){
 const from=resolve('integrations/dmd'),to=join(outputDir,'dmd'),root=basePath+'/dmd/';
 const data=JSON.parse(await readFile(join(from,'content.json'),'utf8')),media=JSON.parse(await readFile(join(from,'media.json'),'utf8'));
 await mkdir(to,{recursive:true});
 for(const name of ['app.js','math.js','state.js','labs.js','styles.css','content.json','media.json','icon.svg'])await copyFile(join(from,name),join(to,name));
 const raw=(await readFile(join(from,'index.html'),'utf8')).replace(/((?:href|src)=")\.\//g,(_,prefix)=>prefix+root).replace('data-route="" href="'+root+'"','data-route="" href="'+root+'"');
 const nodeUrl=id=>root+'learn/'+id+'/';
 const map=`<header><h1>DMD · 数 / Math</h1><p>零基础中英双语学习室 / A bilingual learning studio from the foundations.</p><p>Enable JavaScript for experiments, practice, language switching and private local notes.</p></header>${data.groups.map(g=>`<section><h2>${esc(g.title.zh)} · ${esc(g.title.en)}</h2><ul>${data.nodes.filter(n=>n.group===g.id).map(n=>`<li><a href="${nodeUrl(n.id)}">${esc(n.title.zh)} · ${esc(n.title.en)}</a></li>`).join('')}</ul></section>`).join('')}`;
 const body=n=>`<a href="${root}">← DMD</a>${['zh','en'].map(lang=>`<article lang="${lang==='zh'?'zh-CN':'en'}"><h${lang==='zh'?'1':'2'}>${esc(n.title[lang])}</h${lang==='zh'?'1':'2'}><p>${esc(n.goal[lang])}</p>${n.body.map(p=>`<p>${esc(p[lang])}</p>`).join('')}<pre class="formula">${esc(n.formula[lang])}</pre><ul>${n.symbols.map(p=>`<li>${esc(p[lang])}</li>`).join('')}</ul><h3>${lang==='zh'?'分步例题':'Worked example'}</h3><p>${esc(n.example.scenario[lang])}</p><ol>${n.example.steps.map(s=>`<li>${esc(s[lang])}</li>`).join('')}</ol><ul>${n.pitfalls.map(p=>`<li>${esc(p[lang])}</li>`).join('')}</ul><h3>${lang==='zh'?'先补这些':'Prerequisites'}</h3>${n.prerequisites.map(id=>`<p><a href="${nodeUrl(id)}">${esc(data.nodes.find(x=>x.id===id).title[lang])}</a></p>`).join('')}<h3>${lang==='zh'?'视频与演示':'Videos and demonstrations'}</h3>${n.media.map(id=>media.resources.find(x=>x.id===id)).filter(Boolean).map(m=>`<p><a href="${esc(m.url)}" rel="noopener noreferrer">${esc(m.title[lang])}</a> — ${esc(m.guide[lang])}</p>`).join('')}<p>${esc(n.source)} · PDF ${n.pages.join(', ')}</p></article>`).join('')}<p>启用 JavaScript 使用交互与个人记录。Enable JavaScript for interactive learning and notes.</p>`;
 async function page(route,contents,title,index=true){const canonical=new URL(root+route,siteOrigin).href;const html=raw.replace(/<title>.*?<\/title>/,()=>`<title>${esc(title)}</title>`).replace('</head>',()=>`<link rel="canonical" href="${esc(canonical)}"><meta name="robots" content="${index?'index,follow':'noindex,follow'}"></head>`).replace(/(<main id="main"[^>]*>)[\s\S]*?(<\/main>)/,(_,a,b)=>a+contents+b);const dir=join(to,route);await mkdir(dir,{recursive:true});await writeFile(join(dir,'index.html'),html);}
 await page('',map,'DMD · 数 / Math · MBA Learning OS');
 for(const n of data.nodes)await page('learn/'+n.id+'/',body(n),`${n.title.zh} · ${n.title.en} · DMD`);
 for(const r of ['labs','videos','notes','review','practice','about'])await page(r+'/',map,`DMD · ${r}`,!['notes','review','practice'].includes(r));
 console.log(`DMD exported: ${data.nodes.length} bilingual concepts, ${data.nodes.reduce((s,n)=>s+n.questions.length,0)} questions.`);
 return {nodes:data.nodes.length,root};
}
