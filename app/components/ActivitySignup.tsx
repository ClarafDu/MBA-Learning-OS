import activity from '@/content/public/activity.json';

type CampusItem={id:string;title:string;titleEn?:string;start:string;submissionLink?:string};
export default function ActivitySignup({en,items}:{en:boolean;items:CampusItem[]}) {
  const url = activity.webAppUrl;
  return <section id="campus-activities" className="activity-section" aria-labelledby="activity-heading">
    <div className="activity-heading"><p className="eyebrow">CAMPUS LIFE</p><h2 id="activity-heading">{en?'Campus matters & activities':'校园事项与活动'}</h2><p>{en?'Practical class updates and meetups, without another group-chat search.':'补贴办理和班级活动集中查看，不用再翻群聊。'}</p></div>
    <div className="campus-items">{items.map(item=><article key={item.id}><span className="status-label">{en?'CAMPUS MATTER':'校园事项'}</span><h3>{en&&item.titleEn?item.titleEn:item.title}</h3><p>{new Date(item.start).toLocaleString(en?'en-GB':'zh-CN',{timeZone:'Asia/Shanghai',month:'long',day:'numeric',hour:'2-digit',minute:'2-digit'})}{' · '}{en?'Deadline':'截止'}</p>{item.submissionLink&&<a href={item.submissionLink} target="_blank" rel="noreferrer">{en?'Open application':'打开办理入口'} ↗</a>}</article>)}</div>
    <div className="activity-heading"><span className="status-label">{en?'CLASS ACTIVITY':'班级活动'}</span><h3>{en?'Badminton meetup':'羽毛球小型活动'}</h3><p>{en?'October 20, 15:00–17:00 · time and venue to be confirmed':'10 月 20 日（周二）15:00–17:00 · 时间和地点待确认'}</p></div>
    {url?<iframe title={en?'Badminton signup and live attendance':'羽毛球报名与实时人数'} src={url+'?event='+encodeURIComponent(activity.id)} loading="lazy" referrerPolicy="no-referrer"/>:<div className="activity-pending"><strong>{en?'Registration is not open yet':'报名尚未开放'}</strong><p>{en?'The organizer is connecting the private signup service. Please check back later.':'组织者正在接入私有报名服务。接入并验证后才会开放站内报名。'}</p></div>}
  </section>;
}
