import { T } from '@/app/components/Language';
import ProgressTools from '@/app/components/ProgressTools';
import NoteEditor from '@/app/components/NoteEditor';
import { catalog } from '@/lib/catalog';
import Link from 'next/link';
export const metadata={title:'My OS · MBA Learning OS'};
export default function MyOS(){return <div className="content"><header className="page-header"><p className="eyebrow"><T>MY OS / LOCAL NOTES</T></p><h1><T>笔记与学习记录</T></h1><p><T>按课程记录疑问、易错点与课后总结。未登录时保存在本机；登录后使用账号空间。</T></p></header><div className="button-row"><Link href="/capture" className="button">随手记 / Quick capture</Link><Link href="/account" className="button secondary">账号与完整备份 / Account & backup</Link></div><ProgressTools/><p className="privacy-note"><T>共用浏览器可能读取本机记录，请勿存放敏感资料。新版日历与收集箱请在「账号与同步」中单独备份。</T></p><div className="private-grid"><T>{catalog.courses.map(c=><section className="panel" id={'course-'+c.slug} key={c.slug}><div className="card-meta"><h2><T>{c.title}</T></h2><Link href={'/courses/'+c.slug}><T>进入课程 →</T></Link></div><NoteEditor id={'course-'+c.slug} label="课程笔记与易错点"/><T>{catalog.lectures.filter(l=>l.course===c.slug).map(l=><Link className="note-link" key={l.slug} href={'/courses/'+c.slug+'/'+l.slug+'#in-class'}><T>Lecture </T><T>{String(l.number).padStart(2,'0')}</T><T> 课堂笔记 →</T></Link>)}</T></section>)}</T></div></div>;}
