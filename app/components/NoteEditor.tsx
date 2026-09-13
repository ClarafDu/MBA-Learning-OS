'use client';
import { T, useLanguage } from '@/app/components/Language';

import { useState } from 'react';
import { useLearning } from './LearningState';
import CloudNote from './CloudNote';
import {useWorkspace} from './WorkspaceState';
export default function NoteEditor({id,label}:{id:string;label:string}) {
  const {t} = useLanguage();
 const {user}=useWorkspace();
 const {progress,save,ready,error}=useLearning();const [draft,setDraft]=useState<string|null>(null);const [message,setMessage]=useState('');
 const value=draft??progress.notes[id]??'';
 function commit(){const notes={...progress.notes,[id]:value};if(save({...progress,notes})){setMessage('已保存到本机。');setDraft(null);}else setMessage('未保存，请复制笔记并检查存储提示。');}
 if(user)return <CloudNote noteKey={id} title={label}/>;
 return <div className="note-editor"><label htmlFor={'note-'+id}><T>{label}</T></label><p className="meta"><T>Markdown 文本 · 仅本机保存 · 不会向班级或公开站点发布</T></p><textarea id={'note-'+id} value={value} disabled={!ready} onChange={e=>{setDraft(e.target.value);setMessage('有未保存的修改，请保存后再切换页面。');}} placeholder={t("记录要点、例子、疑问和易错点…")} maxLength={100000}/><div className="button-row"><button className="button" disabled={!ready||!!error} onClick={commit}><T>保存笔记</T></button><span className="meta" role="status"><T>{message}</T></span></div></div>;
}
