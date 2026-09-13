'use client';
import {useEffect,useState} from 'react';
import {useWorkspace} from './WorkspaceState';
type Draft={text:string;revision?:number};
export default function CloudNote({noteKey,title='补充笔记 / Add a thought'}:{noteKey:string;title?:string}){
 const {ownerId}=useWorkspace();
 return <Editor key={ownerId+noteKey} noteKey={noteKey} title={title}/>;
}
function Editor({noteKey,title}:{noteKey:string;title:string}){
 const ws=useWorkspace(),record=ws.records.find(r=>r.owner===ws.ownerId&&r.key===noteKey);
 const draftKey='mba-draft:'+ws.ownerId+':'+noteKey;
 const [draft,setDraft]=useState<Draft|null>(null),[busy,setBusy]=useState(false),[cacheError,setCacheError]=useState(false);
 useEffect(()=>{
  let active=true;
  queueMicrotask(()=>{try{const value=JSON.parse(sessionStorage.getItem(draftKey)||'null');if(active&&value&&typeof value.text==='string')setDraft(value);}catch{if(active)setCacheError(true);}});
  return()=>{active=false;};
 },[draftKey]);
 useEffect(()=>{const warn=(e:BeforeUnloadEvent)=>{if(draft){e.preventDefault();}};window.addEventListener('beforeunload',warn);return()=>window.removeEventListener('beforeunload',warn);},[draft]);
 function change(text:string){const next={text,revision:draft?draft.revision:record?.revision};setDraft(next);try{sessionStorage.setItem(draftKey,JSON.stringify(next));setCacheError(false);}catch{setCacheError(true);}}
 async function save(){if(!draft)return;setBusy(true);try{if(await ws.put(noteKey,'note',{text:draft.text,title},'private',draft.revision)){setDraft(null);try{sessionStorage.removeItem(draftKey);}catch{setCacheError(true);}}}finally{setBusy(false);}}
 return <div className="note-editor"><label htmlFor={'cloud-'+noteKey}>{title}</label><textarea id={'cloud-'+noteKey} value={draft?.text??String(record?.data.text||'')} disabled={!ws.ready} onChange={e=>change(e.target.value)} placeholder="一句启发，一个问题，一段双语表达… / Capture an idea…" maxLength={100000}/><div className="button-row"><span className="meta">仅个人 / Only me</span><button className="button" disabled={busy||!draft||!ws.ready} onClick={()=>void save()}>{busy?'保存中…':ws.user?'保存并同步 / Save & sync':'保存到此设备 / Save locally'}</button></div><p className="meta" role="status">{cacheError?'草稿缓存失败，请先复制文本 / Draft cache failed. Copy text before leaving.':draft?'草稿保留在当前标签页；请保存后关闭页面 / Draft retained in this tab. Save before closing.':ws.status}</p></div>;
}
