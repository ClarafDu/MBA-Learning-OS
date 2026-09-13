import {readFile,readdir,stat,mkdir} from 'node:fs/promises';
import {join,basename,dirname,resolve} from 'node:path';
import {spawnSync} from 'node:child_process';
const root=process.cwd(),parent=dirname(root),prefix=basename(root);
const version=JSON.parse(await readFile(join(root,'package.json'),'utf8')).version;
const release=resolve(parent,'releases','MBA-Learning-OS-V'+version+'-source.zip');
if(await stat(release).catch(()=>null))throw Error('Release archive already exists: '+release);
const files=[];
async function collect(path){const info=await stat(join(root,path));if(info.isDirectory()){for(const name of (await readdir(join(root,path))).sort()){if(name==='.DS_Store'||name.endsWith('.log'))continue;await collect(join(path,name));}}else files.push(join(prefix,path));}
for(const path of ['app','lib','content/public','public','scripts','tests','.github','backend','templates',
 'content/class/README.md','content/private/README.md','restricted-assets/README.md',
 'docs/V1.2.1-RELEASE.md','README.md','package.json','package-lock.json','next.config.ts','next-env.d.ts',
 'vite.config.ts','tsconfig.json','eslint.config.mjs','.gitignore','.env.example','启动本地预览.command'])await collect(path);
await mkdir(dirname(release),{recursive:true});
const zip=spawnSync('zip',['-q',release,'-@'],{cwd:parent,input:files.join('\n')+'\n',encoding:'utf8'});
if(zip.status!==0)throw Error(zip.stderr||'Zip failed');
console.log(release+' · '+files.length+' files. No .openai config, dependencies, builds, secrets or raw materials.');
