'use client';
import {useEffect,useRef,useState,useSyncExternalStore} from 'react';
import type {EventItem} from './Planner';
import {useWorkspace} from './WorkspaceState';
import {deadline,deadlineUrgency,deadlineScope} from '@/lib/planner.mjs';
import {taskKey,taskState,taskStats} from '@/lib/task-progress.mjs';
const subscribeToLocation=()=>()=>{};
const focusedTaskFromUrl=()=>new URLSearchParams(window.location.search).get('task')||'';

export default function DeadlineOverview({events,en,now}:{events:EventItem[];en:boolean;now:number}){
 const ws=useWorkspace(),[filter,setFilter]=useState('action'),[busy,setBusy]=useState(false),[message,setMessage]=useState('');
 const focusedTaskId=useSyncExternalStore(subscribeToLocation,focusedTaskFromUrl,()=> '');
 const scrolledTask=useRef('');
 const tasks=events.filter(e=>e.kind!=='class').map(event=>({event,...taskState(event,ws.records,ws.ownerId)}));
 const stats=taskStats(tasks);
 const focusedTask=tasks.find(t=>t.event.id===focusedTaskId);
 const activeFilter=filter==='action'&&focusedTask?(focusedTask.archived?'archived':focusedTask.done?'completed':deadline(focusedTask.event,now).days<0?'overdue':'all'):filter;
 const matches=(t:typeof tasks[number],value:string)=>value==='archived'?t.archived:!t.archived&&(value==='completed'?t.done:value==='all'?!t.done:value==='overdue'?!t.done&&deadline(t.event,now).days<0:!t.done&&deadlineScope(t.event,now));
 const count=(value:string)=>tasks.filter(t=>matches(t,value)).length;
 const shown=tasks.filter(t=>matches(t,activeFilter)).sort((a,b)=>a.event.start.localeCompare(b.event.start));
 useEffect(()=>{if(!focusedTaskId||!ws.ready||!now||scrolledTask.current===focusedTaskId)return;const card=document.getElementById('task-'+focusedTaskId);if(!card)return;card.querySelector('details')!.open=true;card.scrollIntoView({block:'start'});scrolledTask.current=focusedTaskId;},[focusedTaskId,activeFilter,ws.ready,now]);
 async function update(task:typeof tasks[number],patch:{done?:boolean;archived?:boolean}){
  setBusy(true);setMessage('');
  try{const ok=await ws.put(taskKey(task.event),'review',{type:'deadline',status:'idle',eventId:task.event.id,done:task.done,archived:task.archived,...patch},'private',task.record?.revision);
   setMessage(ok?(en?'Task status saved.':'任务状态已保存。'):(en?'Not saved. Please retry.':'保存失败，请重试。'));
  }finally{setBusy(false);}
 }
 return <section className="deadline-overview compact-deadlines" aria-labelledby="deadline-overview-title">
  <div className="rail-heading"><h2 id="deadline-overview-title">{en?'Deadlines & progress':'倒计时与进度'}</h2><p>{en?'Open a card for submission links. Your completion status is private.':'点击卡片查看提交链接；完成状态仅属于你。'}</p></div>
  <div className="task-overview"><p><b>{ws.ready?stats.rate:'—'}%</b> {en?'completed':'完成率'} <span>{ws.ready?`${stats.completed} / ${stats.total}`:'—'} · {en?'including archived tasks':'包含已归档任务'}</span></p><nav className="segmented" aria-label={en?'Task status':'任务状态'}>{[['action',en?'Next 7 days':'未来 7 天'],['all',en?'All unfinished':'全部未完成'],['overdue',en?'Overdue':'已逾期'],['completed',en?'Completed':'已完成'],['archived',en?'Archived':'已归档']].map(([value,label])=><button key={value} aria-pressed={activeFilter===value} onClick={()=>setFilter(value)}>{label} · {count(value)}</button>)}</nav></div>
  <div className="deadline-cards">{ws.ready&&now>0&&shown.map(task=>{const e=task.event,d=deadline(e,now),title=en&&e.titleEn?e.titleEn:e.title;return <article id={'task-'+e.id} className={'deadline-card '+(task.done?'completed':deadlineUrgency(d.days))} key={taskKey(e)}>
   <details><summary><span>{e.kind==='other'?(en?'OTHER TASK':'其他事项'):e.kind.toUpperCase()}</span><h3>{title}</h3><time>{new Date(e.start).toLocaleString(en?'en-GB':'zh-CN',{timeZone:'Asia/Shanghai',month:'short',day:'numeric',hour:e.timeConfirmed===false?undefined:'2-digit',minute:e.timeConfirmed===false?undefined:'2-digit'})}{e.timeConfirmed===false?(en?' · time pending':' · 时间待确认'):''}</time><strong>{task.done?(en?'Completed':'已完成'):d.days<0?`${en?'Overdue':'已逾期'} ${Math.abs(d.days)} ${en?'days':'天'}`:`${en?'In':'还有'} ${d.days} ${en?'days':'天'}`}</strong><span className="deadline-open-hint">{e.kind==='other'?(en?'Service link & details':'办理入口与详情'):(en?'Submission & details':'提交入口与详情')} <b aria-hidden="true">＋</b></span></summary>
   <div className="deadline-card-details"><p>{e.publicDetails||e.description||(en?'No additional notes.':'暂无补充信息。')}</p>{(e.submissionLink||e.link)&&<a href={e.submissionLink||e.link} target="_blank" rel="noreferrer">{e.submissionLabel||(en?'Open submission':'打开提交入口')} ↗</a>}{e.detailsLink&&<a href={e.detailsLink} target="_blank" rel="noreferrer">{en?'Additional link':'补充链接'} ↗</a>}<small className="source-line">{e.timeConfirmed===false?(en?'Date confirmed · time pending':'日期已确认 · 具体时间待核实'):(en?'Date and time confirmed':'日期与时间已确认')}{e.source?' · '+(en?'Source: ':'来源：')+e.source:''}</small>{e.visibility==='public'&&<a className="correction-link" href={'https://github.com/ClarafDu/MBA-Learning-OS/issues/new?title='+encodeURIComponent('核对任务信息：'+e.title)} target="_blank" rel="noreferrer">{en?'Report incorrect information':'报告信息有误'} ↗</a>}<progress max={100} value={d.percent} aria-label={en?'Planning time elapsed':'计划时间已过'}/><small>{Math.round(d.percent)}% {en?'of planning time elapsed, not task completion':'计划时间已过，非任务完成度'}</small></div></details>
   <div className="task-actions"><label><input type="checkbox" checked={task.done} disabled={busy||!ws.ready} aria-label={`${en?'Completed':'已完成'}：${title}`} onChange={event=>void update(task,{done:event.target.checked})}/>{task.done?(en?'Completed':'已完成'):(en?'Mark complete':'标记完成')}</label><button className="text-button" disabled={busy||!ws.ready} onClick={()=>void update(task,{archived:!task.archived})}>{task.archived?(en?'Restore':'恢复'):(en?'Archive':'归档')}</button></div>
  </article>;})}</div>
  {ws.ready&&now>0&&!shown.length&&<p className="task-empty">{en?'No tasks in this view.':'此分类暂无任务。'}</p>}
  <p className="meta" role="status">{message} {ws.user?(en?'Saved privately to your account.':'私密保存至个人账号。'):(en?'Saved in this browser; included in workspace backups.':'保存在当前浏览器，工作台备份包含任务状态。')}</p>
 </section>;
}
