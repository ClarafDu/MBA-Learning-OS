import {readFile,readdir,writeFile} from 'node:fs/promises';
import {join,relative} from 'node:path';
const esc=s=>s.replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&apos;'}[c]));
export async function buildSitemap({outputDir,basePath='',siteOrigin='https://clarafdu.github.io'}){
 async function walk(dir){const result=[];for(const e of await readdir(dir,{withFileTypes:true})){const p=join(dir,e.name);if(e.isDirectory())result.push(...await walk(p));else if(e.name.endsWith('.html'))result.push(p);}return result;}
 const urls=[];
 for(const file of await walk(outputDir)){
  const rel=relative(outputDir,file).replaceAll('\\','/');if(/(^|\/)404(?:\/|\.html)/.test(rel))continue;
  const text=await readFile(file,'utf8');if(/<meta name="robots" content="noindex/.test(text))continue;
  const route=rel.replace(/index\.html$/,'');
  if(/^(?:account|capture|my-os|review)(?:\/|$)/.test(route))continue;
  urls.push(new URL(basePath+'/'+route,siteOrigin).href);
 }
 const unique=[...new Set(urls)].sort();
 const xml=`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${unique.map(url=>`  <url><loc>${esc(url)}</loc></url>`).join('\n')}\n</urlset>\n`;
 await writeFile(join(outputDir,'sitemap.xml'),xml);
 await writeFile(join(outputDir,'robots.txt'),`User-agent: *\nAllow: ${basePath||''}/\nSitemap: ${new URL(basePath+'/sitemap.xml',siteOrigin).href}\n`);
 console.log(`Sitemap exported: ${unique.length} real page URLs, no hash fragments.`);
 return unique;
}
