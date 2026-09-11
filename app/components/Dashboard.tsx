'use client';
import { T } from '@/app/components/Language';

import Link from 'next/link';
import { catalog } from '@/lib/catalog';
import { useLearning } from './LearningState';
import CourseProgress from './CourseProgress';
export default function Dashboard() {
  const {progress,ready}=useLearning();
  const pending=catalog.lectures.flatMap(l=>l.recallQuestions).filter(q=>progress.reviews[q.id]!=='understood').length;
  const lecture=catalog.lectures[0];
  return <div className="content">
    <header className="page-header"><p className="eyebrow"><T>2026 FALL · FUDAN IMBA</T></p><h1><T>今天，从这里开始。</T></h1><p><T>预习一堂课，理解一个概念，完成一轮回忆。</T></p></header>
    <div className="home-actions">
      <section className="next-action"><div className="card-meta"><span className="eyebrow"><T>继续学习</T></span><span className="pill"><T>PILOT · 示例课程</T></span></div><h2><T>Managerial Economics</T></h2><p><T>Lecture 01 · Demand, Supply &amp; Managerial Decisions</T></p><div className="prep-steps"><span><b><T>20 分钟</T></b><T>浏览课件</T></span><span><b><T>20 分钟</T></b><T>理解概念</T></span><span><b><T>20 分钟</T></b><T>3 Ideas + 1 Question</T></span></div><Link className="button" href={'/courses/'+lecture.course+'/'+lecture.slug}><T>进入 Lecture 01 →</T></Link></section>
      <section className="panel review-preview"><p className="eyebrow"><T>QUICK REVIEW</T></p><strong className="metric"><T>{ready?pending:'—'}</T><small><T>题待复习</T></small></strong><p><T>用 5–10 分钟，检查真正记住了什么。</T></p><Link className="button secondary" href="/review"><T>{pending?'开始复习':'查看已理解题目'}</T><T> →</T></Link></section>
    </div>
    <div className="section-heading"><h2><T>我的课程</T></h2><Link href="/sitemap"><T>查看完整站点地图 →</T></Link></div>
    <div className="course-card-grid"><T>{catalog.courses.map(c=><article className="course-card" key={c.slug}><div className="card-meta"><span className={'course-code '+c.tone}><T>{c.code}</T></span><span className="meta"><T>{c.type}</T></span></div><h3><Link href={'/courses/'+c.slug}><T>{c.title}</T></Link></h3><CourseProgress course={c.slug}/><Link className="course-open" href={'/courses/'+c.slug}><T>打开课程 →</T></Link></article>)}</T></div>
    <div className="home-bottom"><section className="panel"><h3><T>课程安排</T></h3><p><T>课表与作业截止日期待补充。当前没有已确认的下一次上课时间。</T></p></section><section className="panel"><h3><T>整理与备份</T></h3><p><T>把疑问、课堂笔记和易错点放回对应 Lecture。</T></p><Link href="/my-os"><T>打开 My OS →</T></Link></section></div>
  </div>;
}
