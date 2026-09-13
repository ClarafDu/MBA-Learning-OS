'use client';
import Link from 'next/link';
import {useState} from 'react';
import {cloud} from '@/lib/cloud';
import {safeUrl} from '@/lib/planner.mjs';
import {useWorkspace} from './WorkspaceState';
export default function ClassroomWorkspace(){
 const ws=useWorkspace(),[q,setQ]=useState(''),[message,setMessage]=useState('');
 const records=ws.records.filter(r=>r.visibility==='class'&&JSON.stringify(r.data).toLowerCase().includes(q.toLowerCase()));
 async function openFile(path:string){if(!cloud)return;const {data,error}=await cloud.storage.from('mba-materials').createSignedUrl(path,60);if(error)setMessage(error.message);else window.open(data.signedUrl,'_blank','noopener,noreferrer');}
 return <section className="panel"><span className="pill">{!cloud?'云端待配置 / Setup pending':ws.member?'已核验班级身份 / Verified class member':'班级身份待核验 / Verification required'}</span><h2>IMBA 班级资料 / Class library</h2>{!ws.member?<><p>公开页面不提供课件。需配置云端、验证邮箱，再由管理员核验班级身份。个人账号不自动获得班级资料权限。</p><Link className="button" href="/account">账号与访问权限 / Account</Link></>:<><div className="button-row"><label>搜索资料 / Search<input value={q} onChange={e=>setQ(e.target.value)} placeholder="标题、课程、笔记关键词…"/></label><Link href="/capture" className="button">补充班级资料 / Add material</Link></div>{!records.length&&<p>没有匹配的班级资料 / No matching class content</p>}{records.map(r=><article className="capture-card" key={r.id}><small>{String(r.data.course||r.kind)}</small><h3>{String(r.data.title||'Class note')}</h3><p>{String(r.data.text||r.data.description||'')}</p>{!!r.data.start&&<p>{new Date(String(r.data.start)).toLocaleString('zh-CN',{timeZone:'Asia/Shanghai'})}</p>}{r.data.file?<button className="text-button" onClick={()=>void openFile(String(r.data.file))}>{String(r.data.fileName)} ↗</button>:null}{['link','materialLink'].map(k=>r.data[k]&&safeUrl(String(r.data[k]))?<a key={k} href={String(r.data[k])} target="_blank" rel="noreferrer">打开链接 / Open link ↗</a>:null)}</article>)}</>}<p role="status">{message}</p><p className="meta">资料不会自动变为公开。班级分享只供学习参考，没有教师后台或多人协作编辑。</p></section>;
}
