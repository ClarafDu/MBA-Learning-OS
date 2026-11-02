import {readFile,writeFile,mkdir,copyFile} from 'node:fs/promises';
import {resolve,join} from 'node:path';
import {pathToFileURL} from 'node:url';
import {createHash} from 'node:crypto';
import {accountingHref,utilityRoutes} from './accounting-routes.mjs';

const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export async function buildAccounting({outputDir,basePath='',siteOrigin='https://clarafdu.github.io'}){
 const snapshot=resolve('integrations/accounting');
 const origin=JSON.parse(await readFile(join(snapshot,'origin.json'),'utf8'));
 const {lectures,nodes}=await import(pathToFileURL(join(snapshot,'content/index.js')));
 const root=basePath+'/accounting/';
 const destination=join(outputDir,'accounting');
 await mkdir(destination,{recursive:true});
 for(const file of origin.files){await mkdir(resolve(destination,file,'..'),{recursive:true});await copyFile(join(snapshot,file),join(destination,file));}
 await copyFile(new URL('./accounting-routes.mjs',import.meta.url),join(destination,'routes.js'));
 let app=await readFile(join(destination,'app.js'),'utf8');
 const navigateAssignments=app.match(/location\.hash='(?:practice|review)'/g)||[];
 if(navigateAssignments.length!==3)throw new Error('Review accounting route integration after upstream navigation changes.');
 app=app.replace(/location\.hash='(practice|review)'/g,(_,route)=>`navigate('${route}')`).replaceAll('location.hash','routeHash()');
 app="import {routeHash,navigate} from './route-bridge.js';\n"+app;
 app=app.replace("window.addEventListener('hashchange'","window.addEventListener('accountingnavigate'");
 app=app.replace("navigator.serviceWorker.register('./sw.js')","navigator.serviceWorker.register(new URL('./sw.js',import.meta.url))");
 app=app.replaceAll('https://github.com/ClarafDu/accounting-learning-studio','https://github.com/ClarafDu/MBA-Learning-OS');
 await writeFile(join(destination,'app.js'),app);
 const bridge=`import {accountingHref,accountingRoute,utilityRoutes} from './routes.js';
const root=document.querySelector('meta[name="accounting-root"]').content;
export function routeHash(){return accountingRoute(location.pathname,root);}
export function navigate(route,replace=false){const href=accountingHref(route,root);if(location.pathname!==href)history[replace?'replaceState':'pushState'](null,'',href);window.dispatchEvent(new Event('accountingnavigate'));}
function isRoute(route){return utilityRoutes.includes(route)||/^learn\\/[a-z0-9-]+$/.test(route);}
if(location.hash&&isRoute(location.hash.slice(1)))history.replaceState(null,'',accountingHref(location.hash.slice(1),root));
function repairLinks(){for(const a of document.querySelectorAll('a[href^="#"]')){const route=a.getAttribute('href').slice(1);if(isRoute(route))a.href=accountingHref(route,root);}}
new MutationObserver(repairLinks).observe(document.body,{childList:true,subtree:true});repairLinks();
document.addEventListener('click',event=>{const a=event.target.closest('a[href]');if(!a||a.target==='_blank'||a.hasAttribute('download')||event.button!==0||event.metaKey||event.ctrlKey||event.shiftKey||event.altKey)return;const url=new URL(a.href,location.href);if(url.origin!==location.origin||!url.pathname.startsWith(root)||url.hash||url.search)return;const route=accountingRoute(url.pathname,root).slice(1);if(!isRoute(route))return;event.preventDefault();navigate(route);},true);
window.addEventListener('popstate',()=>window.dispatchEvent(new Event('accountingnavigate')));
`;
 await writeFile(join(destination,'route-bridge.js'),bridge);
 let sw=await readFile(join(destination,'sw.js'),'utf8');
 const cacheRevision=createHash('sha256').update(origin.revision+app+bridge).digest('hex').slice(0,12);
 sw=sw.replace(/const CACHE='[^']+';/,`const CACHE='mba-accounting-${cacheRevision}';`).replace("k.startsWith('xunzhang-')","k.startsWith('mba-accounting-')").replace("'./','index.html'","'./','routes.js','route-bridge.js','index.html'");
 await writeFile(join(destination,'sw.js'),sw);
 const raw=await readFile(join(snapshot,'index.html'),'utf8');
 const baseTemplate=raw.replace(/((?:href|src)=")\.\//g,`$1${root}`).replace(/href="#(map|continue|review|notes)"/g,(_,route)=>`href="${accountingHref(route,root)}"`).replace('</head>',`<meta name="accounting-root" content="${root}"></head>`).replace('<span id="breadcrumb">',`<a class="mba-return" href="${basePath||''}/">← MBA Learning OS</a><span id="breadcrumb">`);
 const extraCSS='\n.mba-return{font-size:11px;color:var(--green);white-space:nowrap}.topbar{flex-wrap:wrap;height:auto;min-height:79px;padding-block:12px}.topbar>#breadcrumb{flex:1}.topbar>div{margin-left:auto}@media(max-width:700px){.topbar{min-height:70px;gap:7px}.mba-return{font-size:10px}.topbar>#breadcrumb{display:none}}\n';
 await writeFile(join(destination,'styles.css'),(await readFile(join(destination,'styles.css'),'utf8'))+extraCSS);
 const nodeHref=id=>accountingHref('learn/'+id,root);
 const mapHTML=`<div class="page-heading"><div><div class="eyebrow">MBA LEARNING OS / ACCOUNTING</div><h1>会计 · Accounting</h1><p>Lecture 1–7 · 70个中英双语知识点 · 140道自编题。</p></div></div>${lectures.map(l=>`<section class="panel"><h2>Lecture ${l.number} · ${esc(l.title)}</h2><p lang="en">${esc(l.en)}</p><ul>${l.nodes.map(n=>`<li><a href="${nodeHref(n.id)}">${esc(n.title)} · ${esc(n.en)}</a><p>${esc(n.summary)}</p></li>`).join('')}</ul></section>`).join('')}`;
 const lessonHTML=n=>`<nav class="back-link"><a href="${root}">← 会计知识地图 / Accounting map</a></nav><header class="page-heading"><div><div class="eyebrow">MBA LEARNING OS / ACCOUNTING / LECTURE ${n.lectureNumber}</div><h1>${esc(n.title)}</h1><p lang="en">${esc(n.en)}</p></div></header><article class="lesson-content"><section id="understand"><h2>概念与逻辑</h2>${n.explanation.map(p=>`<p>${esc(p)}</p>`).join('')}<ul>${n.rules.map(p=>`<li>${esc(p)}</li>`).join('')}</ul></section><section id="example"><h2>分步例子</h2><p>${esc(n.example.scenario)}</p><ol>${n.example.steps.map(s=>`<li>${esc(s)}</li>`).join('')}</ol><p>${esc(n.example.conclusion)}</p></section><section id="pitfalls"><h2>易混淆点</h2><ul>${n.pitfalls.map(p=>`<li>${esc(p)}</li>`).join('')}</ul></section><section id="check"><h2>自测与记录 / Practice and notes</h2><p>启用JavaScript后可作答和保存个人笔记。Enable JavaScript for interactive practice and local notes.</p></section><section lang="en"><h2>${esc(n.en)}</h2>${n.english.explanation.map(p=>`<p>${esc(p)}</p>`).join('')}<h3>Worked example</h3><p>${esc(n.english.example.scenario)}</p><ol>${n.english.example.steps.map(p=>`<li>${esc(p)}</li>`).join('')}</ol><p>${esc(n.english.example.conclusion)}</p></section><p class="source-policy">${esc(n.source)} · PDF ${n.pages.join(', ')}. Original slides and private notes are not published.</p></article>`;
 async function page(route,body,title,description,indexable=true){
   const url=new URL(accountingHref(route,root),siteOrigin).href;
   const head=`<link rel="canonical" href="${esc(url)}"><meta name="robots" content="${indexable?'index,follow':'noindex,follow'}"><meta property="og:title" content="${esc(title)}"><meta property="og:url" content="${esc(url)}">`;
   const html=baseTemplate.replace(/<title>[^<]*<\/title>/,()=>`<title>${esc(title)}</title>`).replace(/<meta name="description" content="[^"]*">/,()=>`<meta name="description" content="${esc(description)}">`).replace('</head>',()=>head+'</head>').replace(/(<main id="main"[^>]*>)[\s\S]*?(<\/main>)/,(_match,open,close)=>open+body+close);
   const dir=route==='map'?destination:join(destination,route);await mkdir(dir,{recursive:true});await writeFile(join(dir,'index.html'),html);
 }
 await page('map',mapHTML,'会计 · Accounting · MBA Learning OS','Lecture 1–7：完整会计知识地图、中英双语讲解、英文自测与本机个人笔记。');
 for(const route of utilityRoutes.filter(r=>r!=='map'))await page(route,mapHTML,`Accounting · ${route} · MBA Learning OS`,'Accounting learning workspace.',route==='connections');
 for(const n of nodes)await page('learn/'+n.id,lessonHTML(n),`${n.title} · ${n.en} · MBA Learning OS`,n.summary);
 console.log(`Accounting exported: ${nodes.length} concept pages, ${lectures.length} lectures, ${root}`);
 return {root,nodes:nodes.length};
}
