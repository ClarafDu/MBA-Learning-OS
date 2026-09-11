import { T } from '@/app/components/Language';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { catalog,getCourse } from '@/lib/catalog';
import CourseProgress from '@/app/components/CourseProgress';
export function generateStaticParams(){return catalog.courses.map(c=>({course:c.slug}));}
export async function generateMetadata({params}:{params:Promise<{course:string}>}){const {course}=await params;return {title:(getCourse(course)?.title||'Course')+' · MBA Learning OS'};}
export default async function CoursePage({params}:{params:Promise<{course:string}>}){
 const {course:slug}=await params; const c=getCourse(slug);if(!c)notFound();
 const lectures=catalog.lectures.filter(l=>l.course===slug);
 const concepts=catalog.concepts.filter(k=>lectures.some(l=>l.concepts.includes(k.slug)));
 return <div className="content">
 <nav className="breadcrumbs" aria-label="Breadcrumb / 面包屑"><Link href="/"><T>首页</T></Link><span><T>/</T></span><Link href="/courses"><T>2026 Fall</T></Link><span><T>/</T></span><span aria-current="page"><T>{c.code}</T></span></nav>
 <header className="course-heading"><span className={'course-code '+c.tone}><T>{c.code}</T></span><div><p className="eyebrow"><T>{c.type}</T></p><h1><T>{c.title}</T></h1><p><T>{lectures.length?'1 个示例 Lecture · 课表待补充':'课程已建档 · 等待添加第一堂课'}</T></p></div></header>
 <div className="panel course-summary"><div><h3><T>{lectures.length?'下一步：进入 Lecture 01':'下一步：整理本课程资料'}</T></h3><p><T>{lectures.length?'预习、概念理解、课堂笔记与复习都在同一个 Lecture 中。':'课件仍保存在本地课程文件夹；暂无可公开的课堂笔记。'}</T></p></div><CourseProgress course={slug}/></div>
 <nav className="section-tabs" aria-label="Course sections / 课程分区"><a href="#lectures"><T>Lectures</T></a><a href="#concepts"><T>概念与公式</T></a><a href="#materials"><T>课程资料</T></a><a href="#exam"><T>考前复习</T></a><a href="#resources"><T>外部资源</T></a></nav>
 <section className="course-section" id="lectures"><h2><T>Lectures</T></h2><T>{lectures.length?<div className="lecture-list"><T>{lectures.map(l=><Link key={l.slug} href={'/courses/'+slug+'/'+l.slug}><span className="lecture-index"><T>{String(l.number).padStart(2,'0')}</T></span><div><h3><T>{l.title}</T></h3><p><T>流程示例 · 60 分钟预习 / 5–10 分钟复习</T></p></div><b aria-hidden="true"><T>→</T></b></Link>)}</T></div>:<div className="panel"><h3><T>还没有 Lecture</T></h3><p><T>添加课程内容后，会在这里出现独立的课堂页面。</T></p><Link className="button secondary" href={'/my-os#course-'+slug}><T>先记录课程笔记</T></Link></div>}</T></section>
 <section className="course-section" id="concepts"><h2><T>概念与公式</T></h2><T>{concepts.length?<div className="topic-links"><T>{concepts.map(k=><Link href={'/knowledge/'+k.slug} key={k.slug}><T>{k.title}</T></Link>)}</T></div>:<p><T>暂无与本课程关联的概念。</T></p>}</T></section>
 <section className="course-section" id="materials"><h2><T>课程资料</T></h2><div className="panel"><h3><T>课件访问尚未启用</T></h3><p><T>教师课件、Case 和 Reading 不包含在公开安装包中。</T></p><Link href="/classroom"><T>查看 Classroom 访问状态 →</T></Link></div></section>
 <section className="course-section" id="exam"><h2><T>考前复习</T></h2><T>{lectures.length?<div className="panel"><p><T>按概念、公式和回忆题复习。本页为示例内容，考试范围待确认。</T></p><div className="button-row"><Link className="button" href={'/courses/'+slug+'/'+lectures[0].slug+'#quick-review'}><T>本课程回忆题</T></Link><Link className="button secondary" href={'/my-os#course-'+slug}><T>查看笔记与易错点</T></Link></div></div>:<p><T>添加 Lecture 与复习题后，将在这里形成课程复习入口。</T></p>}</T></section>
 <section className="course-section" id="resources"><h2><T>外部资源</T></h2><T>{concepts.length?<div className="resource-list"><Link href="/knowledge"><span><b><T>按概念查找学习资源</T></b><small><T>Learn · 英文解释、公式与管理含义</T></small></span><span><T>→</T></span></Link></div>:<p><T>暂无已审核并关联本课程的外部资源。</T></p>}</T></section>
 </div>;
}
