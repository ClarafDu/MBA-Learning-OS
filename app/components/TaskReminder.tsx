'use client';
import Link from 'next/link';
import {useRef} from 'react';
import {useEvents,eventTitle} from './Planner';
import {useWorkspace} from './WorkspaceState';
import {useLanguage} from './Language';
import {taskState} from '@/lib/task-progress.mjs';
export default function TaskReminder(){
 const events=useEvents(),ws=useWorkspace(),{language}=useLanguage(),en=language==='en',dialog=useRef<HTMLDialogElement>(null);
 const tasks=ws.ready?events.filter(e=>{const s=taskState(e,ws.records,ws.ownerId);return e.kind!=='class'&&!s.done&&!s.archived;}):[];
 return <><button className="task-reminder" aria-label={en?`${tasks.length} unfinished tasks`:`${tasks.length}项未完成任务`} onClick={()=>dialog.current?.showModal()}><svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true"><path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M9 21h6"/></svg>{tasks.length>0&&<span className="red-count" aria-hidden="true">{tasks.length>99?'99+':tasks.length}</span>}</button><dialog ref={dialog} className="reminder-dialog" aria-label={en?'Unfinished tasks':'未完成任务'} onClick={e=>{if(e.target===dialog.current)dialog.current.close();}}><header><h2>{en?'Unfinished tasks':'未完成任务'} · {tasks.length}</h2><button className="icon-button" aria-label={en?'Close':'关闭'} onClick={()=>dialog.current?.close()}>×</button></header><p>{en?'Mark completed or archive tasks in Schedule.':'在 Schedule 中勾选完成或归档，提醒数量会自动更新。'}</p><div>{tasks.map(e=><Link key={e.id} href={'/calendar?task='+encodeURIComponent(e.id)+'#countdown'} onClick={()=>dialog.current?.close()}><b>{eventTitle(e,en)}</b><small>{new Date(e.start).toLocaleDateString(en?'en-GB':'zh-CN',{timeZone:'Asia/Shanghai',month:'short',day:'numeric'})} →</small></Link>)}</div>{!tasks.length&&<p>{en?'All tasks are complete.':'暂无未完成任务。'}</p>}</dialog></>;
}
