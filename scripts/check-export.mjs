import { readFile,readdir,stat } from 'node:fs/promises';
import { join } from 'node:path';
import { githubBase } from './github-base.mjs';
const base=githubBase({...process.env,GITHUB_PAGES:'true'});
const root=join(process.cwd(),'out');
async function walk(dir){const entries=await readdir(dir,{withFileTypes:true});const files=[];for(const e of entries){const p=join(dir,e.name);if(e.isDirectory())files.push(...await walk(p));else files.push(p);}return files;}
const pages=(await walk(root)).filter(f=>f.endsWith('.html'));const errors=new Set();let links=0;
for(const page of pages){
 const html=await readFile(page,'utf8');
 const route='/'+page.slice(root.length+1).replace(/index\.html$/,'');
 const origin=new URL((base||'')+route,'https://local.test');
 for(const match of html.matchAll(/(?:href|src)="([^"]+)"/g)){
  const url=new URL(match[1].replaceAll('&amp;','&'),origin);
  if(url.origin!=='https://local.test')continue;
  if(base && url.pathname!==base && !url.pathname.startsWith(base+'/')){errors.add('Missing base path: '+url.pathname);continue;}
  let path=decodeURIComponent(url.pathname.slice(base.length));
  if(path.endsWith('/'))path+='index.html';
  let target=join(root,path);let info=await stat(target).catch(()=>null);
  if(info?.isDirectory()){target=join(target,'index.html');info=await stat(target).catch(()=>null);}
  if(!info){errors.add('Missing file: '+url.pathname);continue;}
  if(url.hash && target.endsWith('.html')){const contents=await readFile(target,'utf8');if(!contents.includes('id="'+decodeURIComponent(url.hash.slice(1))+'"'))errors.add('Missing anchor: '+url.pathname+url.hash);}
  links++;
 }
}
if(errors.size){console.error([...errors].join('\n'));process.exit(1);}
console.log('Export verified: '+pages.length+' HTML pages, '+links+' internal links/assets, base '+(base||'/'));
