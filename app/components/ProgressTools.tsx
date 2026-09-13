'use client';
import { T, useLanguage } from '@/app/components/Language';

import { useRef,useState } from 'react';
import { useLearning } from './LearningState';
import { parseProgress,storageKey } from '@/lib/progress.mjs';
import {useWorkspace} from './WorkspaceState';
import WorkspaceBackup from './WorkspaceBackup';
export default function ProgressTools(){
 const {user}=useWorkspace();
 const {t} = useLanguage();
 const input=useRef<HTMLInputElement>(null);const {progress,save,ready,error}=useLearning();const [message,setMessage]=useState('备份包含本机笔记和复习状态。导入会合并记录；同名记录以导入文件为准。');
 function backup(){try{const raw=error?(localStorage.getItem(storageKey)||JSON.stringify(progress)):JSON.stringify(progress,null,2);const url=URL.createObjectURL(new Blob([raw],{type:'application/json'}));const a=document.createElement('a');a.href=url;a.download='mba-learning-backup-'+new Date().toISOString().slice(0,10)+'.json';a.click();URL.revokeObjectURL(url);setMessage('备份已导出，请妥善保存。');}catch{setMessage('导出失败，请检查浏览器是否允许下载。');}}
 async function restore(file?:File){if(!file)return;try{if(file.size>5000000)throw new Error('文件不能超过 5MB');const incoming=parseProgress(JSON.parse(await file.text()));if(save({version:2,reviews:{...progress.reviews,...incoming.reviews},notes:{...progress.notes,...incoming.notes}}))setMessage('已导入并合并，复习队列同步更新。');else setMessage('导入未保存，请检查浏览器存储提示。');}catch(e){setMessage(e instanceof Error?e.message:'无法识别备份文件');}finally{if(input.current)input.current.value='';}}
 if(user)return <div id="backup"><WorkspaceBackup/></div>;
 return <section className="progress-tools" id="backup"><div><p className="eyebrow"><T>BACKUP & RESTORE</T></p><h2><T>学习数据备份</T></h2><p role="status"><T>{message}</T></p></div><div className="tool-actions"><button className="button" onClick={backup} disabled={!ready}><T>导出 JSON</T></button><button className="button secondary" onClick={()=>input.current?.click()} disabled={!ready||!!error}><T>导入 JSON</T></button><input ref={input} hidden type="file" accept=".json,application/json" aria-label={t("导入学习备份")} onChange={e=>restore(e.target.files?.[0])}/></div></section>;
}
