import {validateEvent,safeUrl} from './planner.mjs';
export function parseWorkspaceBackup(text){
 const value=JSON.parse(text);
 if(value?.version!=='1.2.1'||!Array.isArray(value.records)||value.records.length>3000)throw Error('无法识别工作台备份 / Invalid workspace backup');
 const keys=new Set();
 return value.records.map(r=>{
  if(!r||typeof r.key!=='string'||r.key.length>200||!r.key||keys.has(r.key)||['__proto__','constructor','prototype'].includes(r.key))throw Error('重复或无效记录 / Invalid record key');
  keys.add(r.key);
  if(!['event','note','capture','review'].includes(r.kind)||!r.data||typeof r.data!=='object'||Array.isArray(r.data)||JSON.stringify(r.data).length>150000)throw Error('记录格式无效 / Invalid record');
  if(r.kind==='event')validateEvent({...r.data,visibility:'private'});
  for(const k of ['text','title','file','fileName','course','category'])if(r.data[k]!==undefined&&typeof r.data[k]!=='string')throw Error('文字字段无效 / Invalid text field');
  if(r.data.link&&!safeUrl(r.data.link))throw Error('不安全的链接 / Invalid link');
  if(r.kind==='review'&&!['understood','later','idle'].includes(r.data.status))throw Error('Invalid review status');
  // Restores cannot widen visibility or impersonate another owner.
  return {key:r.key,kind:r.kind,data:r.data,visibility:'private'};
 });
}
