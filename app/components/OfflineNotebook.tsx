'use client';

import {useState} from 'react';
import {collectOfflineNotes,offlineHTML,offlineMarkdown} from '@/lib/offline-notebook.mjs';
import {downloadFile} from '@/lib/planner.mjs';
import {localOwner,useWorkspace,workspaceKey} from './WorkspaceState';

export default function OfflineNotebook(){
 const ws=useWorkspace();
 const [message,setMessage]=useState('');
 function exportNotes(format:'md'|'html'|'pdf'){
  const {notes,failed}=collectOfflineNotes(ws.records,ws.ownerId,localStorage,workspaceKey,localOwner);
  const warning=failed.length?' 部分本机笔记读取失败：'+failed.join('、')+'。':'';
  if(!notes.length){setMessage('没有找到可导出的已保存笔记。'+warning);return;}
  const name='IMBA-学习笔记-'+new Date().toLocaleDateString('sv-SE',{timeZone:'Asia/Shanghai'});
  if(format==='pdf'){
   const preview=window.open('','_blank');
   if(!preview){setMessage('打印页被浏览器拦截，请允许弹窗，或下载离线 HTML 后打开打印。');return;}
   preview.opener=null;
   preview.document.open();
   preview.document.write(offlineHTML(notes));
   preview.document.close();
   preview.focus();
   preview.print();
  }else{
   downloadFile(name+'.'+format,format==='md'?offlineMarkdown(notes):offlineHTML(notes),format==='md'?'text/markdown;charset=utf-8':'text/html;charset=utf-8');
  }
  setMessage(`已汇总 ${notes.length} 条笔记。`+warning);
 }
 return <section className="panel" id="offline-notes">
  <h2>离线笔记导出 / Offline notes</h2>
  <p>汇总当前账号和此浏览器已保存的文字笔记，包括随时记录、课程笔记及会计、DMD、经济学子站笔记。云端附件请单独下载，外链仅保留地址。</p>
  <div className="button-row">
   <button className="button" disabled={!ws.ready} onClick={()=>exportNotes('md')}>下载 Markdown</button>
   <button className="button secondary" disabled={!ws.ready} onClick={()=>exportNotes('html')}>下载离线 HTML</button>
   <button className="button secondary" disabled={!ws.ready} onClick={()=>exportNotes('pdf')}>打印 / 存为 PDF</button>
  </div>
  <p className="meta">先保存笔记并确认账号同步状态。打印时选择「另存为 PDF」，然后按学校允许的方式传到考试平板，在飞行模式下重新打开确认。</p>
  <p className="meta" role="status">{message || ws.status}</p>
 </section>;
}
