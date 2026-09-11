import { T } from '@/app/components/Language';
import Link from 'next/link';
import { catalog } from '@/lib/catalog';
import CourseProgress from '@/app/components/CourseProgress';
export const metadata={title:'全部课程 · MBA Learning OS'};
export default function CoursesPage(){return <div className="content"><header className="page-header"><p className="eyebrow"><T>IMBA CLASSROOM / 2026 FALL</T></p><h1><T>全部课程</T></h1><p><T>9 门课程，各自独立的 Lecture、概念、资料与复习路径。</T></p></header><div className="section-heading"><h2><T>2026 Fall</T></h2><Link href="/sitemap"><T>站点地图 →</T></Link></div><div className="course-card-grid"><T>{catalog.courses.map(c=><article className="course-card" key={c.slug}><div className="card-meta"><span className={'course-code '+c.tone}><T>{c.code}</T></span><span className="meta"><T>{c.type}</T></span></div><h3><Link href={'/courses/'+c.slug}><T>{c.title}</T></Link></h3><CourseProgress course={c.slug}/><Link className="course-open" href={'/courses/'+c.slug}><T>打开课程 →</T></Link></article>)}</T></div></div>;}
