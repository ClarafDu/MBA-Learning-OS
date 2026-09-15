'use client';
import Link from 'next/link';
import {useEffect,useMemo,useState} from 'react';
import {catalog} from '@/lib/catalog';
import {downloadFile,safeUrl} from '@/lib/planner.mjs';
import {makeNotebookJSON,makeNotebookMarkdown,notebookEntries} from '@/lib/notebook.mjs';
import {useWorkspace} from './WorkspaceState';
import {cloud} from '@/lib/cloud';

const draftKey='mba-learning-notebook-draft-v1';

export default function Capture(){
 const ws=useWorkspace();
 const [message,setMessage]=useState(''),[busy,setBusy]=useState(false),[draftReady,setDraftReady]=useState(false),[savedAt,setSavedAt]=useState('');
 const [title,setTitle]=useState(''),[body,setBody]=useState('');
 const entries=useMemo(()=>notebookEntries(ws.records,ws.ownerId),[ws.records,ws.ownerId]);
 const captures=ws.records.filter(record=>record.owner===ws.ownerId&&record.kind==='capture');

 useEffect(()=>{let active=true;queueMicrotask(()=>{if(!active)return;try{const draft=JSON.parse(localStorage.getItem(draftKey)||'{}');if(typeof draft.title==='string')setTitle(draft.title);if(typeof draft.body==='string')setBody(draft.body);if(typeof draft.savedAt==='string')setSavedAt(draft.savedAt);}catch{}setDraftReady(true);});return()=>{active=false;};},[]);
 useEffect(()=>{if(!draftReady)return;const timer=setTimeout(()=>{if(!title&&!body){localStorage.removeItem(draftKey);setSavedAt('');return;}const now=new Date().toISOString();localStorage.setItem(draftKey,JSON.stringify({title,body,savedAt:now}));setSavedAt(now);},500);return()=>clearTimeout(timer);},[title,body,draftReady]);

 async function save(e:React.FormEvent<HTMLFormElement>){
  e.preventDefault();
  const form=e.currentTarget,f=new FormData(form);
  if(!ws.ready)return;
  const link=String(f.get('link')||'');
  if(link&&!safeUrl(link)){setMessage('请输入 HTTPS 链接');return;}
  setBusy(true);
  try{
   const category=String(f.get('category'));
   const personal=['路上随想 / Thought','错题记录 / Mistake','个人总结 / Summary'].includes(category);
   const visibility=personal?'private':String(f.get('visibility')) as 'private'|'class';
   const data={title,text:body,course:f.get('course'),category,link};
   const file=f.get('file') as File;
   let path='';
   if(file?.size){
    if(!cloud||!ws.user)throw Error('请先连接云端并登录以保存文件 / Connect and sign in to upload files');
    if(file.size>20*1024*1024)throw Error('文件须小于 20MB');
    path=ws.user.id+'/'+crypto.randomUUID()+'/'+file.name.replace(/[^a-zA-Z0-9._-]/g,'_');
    const upload=await cloud.storage.from('mba-materials').upload(path,file);
    if(upload.error)throw upload.error;
   }
   const id=crypto.randomUUID();
   if(await ws.put(id,'capture',{...data,file:path,fileName:file?.size?file.name:''},visibility)){
    form.reset();setTitle('');setBody('');localStorage.removeItem(draftKey);setSavedAt('');
    setMessage(ws.user?'已保存并同步 / Saved & synced':'已保存到此设备 / Saved locally');
   }else{
    setMessage('记录未保存，请重试 / Record not saved');
    if(path)await cloud!.storage.from('mba-materials').remove([path]);
   }
  }catch(error){setMessage((error as Error).message);}finally{setBusy(false);}
 }

 async function openFile(path:string){
  if(!cloud){setMessage('当前未连接云端，无法读取附件。');return;}
  const {data,error}=await cloud.storage.from('mba-materials').createSignedUrl(path,60);
  if(error)setMessage(error.message);else window.open(data.signedUrl,'_blank','noopener,noreferrer');
 }

 function exportNotes(format:'md'|'json'){
  const date=new Date().toISOString().slice(0,10);
  if(format==='md')downloadFile(`IMBA-随时记录-${date}.md`,makeNotebookMarkdown(ws.records,ws.ownerId),'text/markdown;charset=utf-8');
  else downloadFile(`IMBA-随时记录-${date}.json`,makeNotebookJSON(ws.records,ws.ownerId),'application/json;charset=utf-8');
  setMessage(`${entries.length} 条记录已完整导出 / Exported`);
 }

 return <div className="content notebook-page">
  <header className="page-header notebook-header"><p className="eyebrow">NOTE ANYTIME</p><h1>随时记录 / Notebook</h1><p>像打开手抄本一样立即写下课堂笔记、要求与灵感。未提交内容会自动保存在此设备。</p></header>
  <div className="capture-grid">
   <form className="panel event-form notebook-form" onSubmit={save}>
    <div className="notebook-status"><span>自动保存草稿</span><small>{savedAt?`最近保存 ${new Date(savedAt).toLocaleTimeString('zh-CN',{hour:'2-digit',minute:'2-digit'})}`:'开始输入后自动保存'}</small></div>
    <label>标题 / Title<input name="title" required maxLength={180} value={title} onChange={event=>setTitle(event.target.value)} placeholder="这一页记什么？"/></label>
    <label>记录内容 / Notes<textarea className="notebook-paper" name="text" maxLength={100000} value={body} onChange={event=>setBody(event.target.value)} placeholder="直接写，不用先整理……"/></label>
    <div className="form-pair"><label>课程 / Course<select name="course">{catalog.courses.map(course=><option value={course.slug} key={course.slug}>{course.title}</option>)}</select></label><label>分类 / Type<select name="category"><option>路上随想 / Thought</option><option>课程要求 / Requirement</option><option>Reflection</option><option>Homework</option><option>错题记录 / Mistake</option><option>课堂笔记 / Class note</option><option>个人总结 / Summary</option></select></label></div>
    <label>要求 / 提交链接 · URL<input name="link" type="url" placeholder="https://"/></label>
    <label>课表 / 资料文件 · File<input name="file" type="file" disabled={!ws.user} accept=".pdf,.ppt,.pptx,.doc,.docx,.txt,.md,.json,.ics"/><small>最多 20MB，需连接云端并登录。文字和链接可先本机保存。文件不会加入公开网站。</small></label>
    <p className="meta">随想、个人总结和错题始终仅个人可见。 / Thoughts, summaries and mistakes stay private.</p>
    <label>可见范围 / Visibility<select name="visibility"><option value="private">仅个人 / Only me</option>{ws.member&&<option value="class">仅班级 / Class</option>}</select></label>
    <button className="button" disabled={!ws.ready||busy}>{busy?'保存中…':(ws.user?'保存并同步 / Save & sync':'保存到此设备 / Save locally')}</button>
    {!ws.user&&<Link href="/account">登录以跨设备同步 / Sign in to sync</Link>}<p role="status">{message||ws.status}</p>
   </form>
   <section>
    <div className="notebook-library-heading"><div><p className="eyebrow">MY NOTEBOOK</p><h2>记录本</h2><small>{entries.length} 条个人记录</small></div><div className="notebook-export"><button className="button secondary" disabled={!entries.length} onClick={()=>exportNotes('md')}>导出 Markdown</button><button className="text-button" disabled={!entries.length} onClick={()=>exportNotes('json')}>完整 JSON 备份</button></div></div>
    {!captures.length&&<p className="panel">这里会按时间收纳你保存的课堂笔记、要求、链接和想法。</p>}
    {captures.map(record=><article className="capture-card" key={record.id}><span className="pill">{record.visibility==='private'?'仅个人':'仅班级'} · {String(record.data.category||'')}</span><h3>{String(record.data.title)}</h3><p>{String(record.data.text||'')}</p>{record.data.link&&safeUrl(String(record.data.link))?<a href={String(record.data.link)} target="_blank" rel="noreferrer">打开链接 / Open link ↗</a>:null}{record.data.file?<button className="text-button" onClick={()=>void openFile(String(record.data.file))}>{String(record.data.fileName)} ↗</button>:null}<button className="text-button danger" onClick={async()=>{if(confirm('删除记录？文件如有将保留在个人资料库。 / Delete record?'))await ws.remove(record);}}>删除记录</button></article>)}
   </section>
  </div>
 </div>;
}
