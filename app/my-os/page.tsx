import { T } from '@/app/components/Language';
import ProgressTools from '@/app/components/ProgressTools';
import NoteEditor from '@/app/components/NoteEditor';
import { catalog } from '@/lib/catalog';
import Link from 'next/link';
export const metadata={title:'My OS · MBA Learning OS'};
export default function MyOS(){return <div className="content"><header className="page-header"><p className="eyebrow"><T>MY OS / LOCAL NOTES</T></p><h1><T>笔记与学习记录</T></h1><p><T>按课程记录疑问、易错点与课后总结。此页面的记录仅保存在当前浏览器。</T></p></header><ProgressTools/><p className="privacy-note"><T>本机记录不等于账号权限保护：共用此浏览器的人可能读取这些笔记，请勿输入敏感资料。Classroom 登录尚未启用。</T></p><div className="private-grid"><T>{catalog.courses.map(c=><section className="panel" id={'course-'+c.slug} key={c.slug}><div className="card-meta"><h2><T>{c.title}</T></h2><Link href={'/courses/'+c.slug}><T>进入课程 →</T></Link></div><NoteEditor id={'course-'+c.slug} label="课程笔记与易错点"/><T>{catalog.lectures.filter(l=>l.course===c.slug).map(l=><Link className="note-link" key={l.slug} href={'/courses/'+c.slug+'/'+l.slug+'#in-class'}><T>Lecture </T><T>{String(l.number).padStart(2,'0')}</T><T> 课堂笔记 →</T></Link>)}</T></section>)}</T></div></div>;}
