import {cp,mkdir,readFile,writeFile} from 'node:fs/promises';
import {resolve,join} from 'node:path';
import {pathToFileURL} from 'node:url';
import {execFileSync} from 'node:child_process';

const source=resolve(process.argv[2]||'../accounting-learning');
const destination=resolve('integrations/accounting');
const files=['index.html','app.js','core.js','i18n.js','labs.js','styles.css','icon.svg','manifest.webmanifest','sw.js','content/index.js','content/lecture-7.js','content/lectures-1-2.js','content/lectures-3-4.js','content/lectures-5-6.js'];
const revision=execFileSync('git',['-C',source,'rev-parse','HEAD'],{encoding:'utf8'}).trim();
const dirty=execFileSync('git',['-C',source,'status','--porcelain','--untracked-files=no'],{encoding:'utf8'}).trim();
if(dirty)throw new Error('Commit the accounting source changes before synchronizing the reviewed snapshot.');
await mkdir(destination,{recursive:true});
for(const file of files){await mkdir(resolve(destination,file,'..'),{recursive:true});await cp(join(source,file),join(destination,file));}
const {lectures}=await import(pathToFileURL(join(destination,'content/index.js')));
const index=lectures.map(l=>({id:l.id,number:l.number,title:l.title,en:l.en,nodes:l.nodes.map(n=>({id:n.id,title:n.title,en:n.en,summary:n.summary,summaryEn:n.english.summary}))}));
await writeFile('content/public/accounting-index.json',JSON.stringify(index,null,2)+'\n');
await writeFile(join(destination,'origin.json'),JSON.stringify({repository:'https://github.com/ClarafDu/accounting-learning-studio',revision,files},null,2)+'\n');
const text=await readFile(join(destination,'app.js'),'utf8');
if(!text.includes("form.getAttribute('id')==='note-form'"))throw new Error('The accounting snapshot must include the verified note-submission fix.');
console.log(`Synchronized reviewed accounting revision ${revision.slice(0,7)}: ${index.length} lectures and ${index.flatMap(l=>l.nodes).length} concepts.`);
