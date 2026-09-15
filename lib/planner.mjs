export const zone = 'Asia/Shanghai';
export const eventKinds = ['class','reflection','homework','midterm','final'];
export function validateEvent(value) {
 if(!value||typeof value.id!=='string'||!value.id||value.id.length>200||/[\r\n\x00]/.test(value.id))throw Error('每条日程须有唯一 id（最多 200 字） / Event ID required');
 if (!value || typeof value.title !== 'string' || !value.title.trim() || value.title.length > 180) throw Error('请填写标题 / Title required');
 if(typeof value.course!=='string'||!/^[-a-z0-9]+$/.test(value.course))throw Error('课程标识无效 / Course slug required');
 for(const k of ['description','location','link','materialLink'])if(value[k]!=null&&(typeof value[k]!=='string'||value[k].length>10000))throw Error('日程文字格式无效 / Invalid event text');
 for(const k of ['start','end'])if(typeof value[k]!=='string'||!/(Z|[+-]\d{2}:\d{2})$/.test(value[k]))throw Error('时间需要明确时区，如 +08:00 / An explicit timezone is required');
 if (!eventKinds.includes(value.kind) || !['private','class','public'].includes(value.visibility)) throw Error('日程类型或权限无效 / Invalid event type or visibility');
 if (!Number.isFinite(Date.parse(value.start)) || !Number.isFinite(Date.parse(value.end)) || Date.parse(value.end) <= Date.parse(value.start)) throw Error('结束时间必须晚于开始时间 / End must follow start');
 if(value.created && (!Number.isFinite(Date.parse(value.created)) || Date.parse(value.created)>Date.parse(value.start))) throw Error('计划开始时间必须早于截止时间 / Planning start must precede deadline');
 for (const key of ['link','materialLink']) if(value[key] && !safeUrl(value[key])) throw Error('链接须使用 https / Use an HTTPS link');
 if(value.visibility==='public' && (value.link || value.materialLink || value.description)) throw Error('公开日历仅含事项的时间、标题和地点 / Public calendar must exclude restricted details');
 if(value.reminder!=null&&(!Number.isInteger(value.reminder)||value.reminder<0||value.reminder>10080))throw Error('提醒应为 0–10080 分钟 / Invalid reminder');
 return {id:value.id,title:value.title.trim(),course:value.course,kind:value.kind,start:value.start,end:value.end,created:value.created||value.start,visibility:value.visibility,description:value.description||'',location:value.location||'',link:value.link||'',materialLink:value.materialLink||'',reminder:value.reminder||0,done:value.done===true};
}
export function safeUrl(value) {try {const u=new URL(value);return u.protocol==='https:';}catch{return false;}}
export function deadline(event, now=Date.now()) {
 const due=Date.parse(event.start),from=Date.parse(event.created||event.start),range=due-from;
 return {days:due<now?-Math.ceil((now-due)/86400000):Math.ceil((due-now)/86400000),percent:range>0?Math.max(0,Math.min(100,(now-from)/range*100)):(now>=due?100:0)};
}
export function courseSessionProgress(events, course, now=Date.now()) {
 const sessions=events.filter(event=>event.kind==='class'&&event.course===course&&Number.isFinite(Date.parse(event.end)));
 const completed=sessions.filter(event=>Date.parse(event.end)<=now).length;
 return {completed,total:sessions.length,percent:sessions.length?completed/sessions.length*100:0};
}
const escapeICS = value => String(value||'').replace(/\\/g,'\\\\').replace(/\r\n|\r|\n/g,'\\n').replace(/;/g,'\\;').replace(/,/g,'\\,');
const stamp=value=>new Date(value).toISOString().replace(/[-:]/g,'').replace(/\.\d{3}/,'');
function fold(line){let parts=[],current='';for(const char of line){if(new TextEncoder().encode(current+char).length>73){parts.push(current);current=' '+char;}else current+=char;}parts.push(current);return parts.join('\r\n');}
export function makeICS(events,{publicOnly=false,now=new Date().toISOString()}={}) {
 const lines=['BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//MBA Learning OS//V1.2.1//CN','CALSCALE:GREGORIAN','METHOD:PUBLISH','X-WR-CALNAME:IMBA Learning','X-WR-TIMEZONE:Asia/Shanghai'];
 for(const event of events.filter(e=>!publicOnly||e.visibility==='public')){validateEvent(event);lines.push('BEGIN:VEVENT','UID:'+escapeICS(event.id)+'@mba-learning-os','DTSTAMP:'+stamp(now),'DTSTART:'+stamp(event.start),'DTEND:'+stamp(event.end),'SUMMARY:'+escapeICS(event.title),'LOCATION:'+escapeICS(event.location),'CLASS:'+(event.visibility==='public'?'PUBLIC':'PRIVATE'));
  if(!publicOnly)lines.push('DESCRIPTION:'+escapeICS([event.description,event.link].filter(Boolean).join('\n')));
  if(!publicOnly&&event.reminder){lines.push('BEGIN:VALARM','ACTION:DISPLAY','TRIGGER:-PT'+Math.max(1,Math.min(10080,Number(event.reminder)||30))+'M','DESCRIPTION:'+escapeICS(event.title),'END:VALARM');}
  lines.push('END:VEVENT');
 }return [...lines,'END:VCALENDAR',''].map(fold).join('\r\n');
}
export function downloadFile(name,contents,type='text/plain'){const url=URL.createObjectURL(new Blob([contents],{type}));const a=document.createElement('a');a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}
export function parseCalendarJSON(text){const values=JSON.parse(text);if(!Array.isArray(values)||values.length>300)throw Error('请导入日程数组，最多 300 条 / Up to 300 events');const seen=new Set();return values.map(e=>{const item=validateEvent({...e,visibility:e.visibility||'private'});if(seen.has(item.id))throw Error('日程 id 重复 / Duplicate event ID');seen.add(item.id);return item;});}
