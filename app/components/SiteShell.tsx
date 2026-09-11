'use client';
import { T, useLanguage, LanguageProvider, LanguageSwitch } from '@/app/components/Language';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { catalog } from '@/lib/catalog';
import { LearningProvider, useLearning } from './LearningState';
const nav = [
  {href:'/',label:'学习首页',icon:'⌂'},
  {href:'/courses',label:'全部课程',icon:'▦'},
  {href:'/review',label:'复习队列',icon:'↻'},
  {href:'/knowledge',label:'知识库',icon:'◇'},
];
function Shell({children}: {children: React.ReactNode}) {
  const {t} = useLanguage();
  const pathname = usePathname().replace(/\/$/,'') || '/';
  const [query,setQuery] = useState('');
  const [menu,setMenu] = useState(false);
  const searchRef = useRef<HTMLDialogElement>(null);
  const drawerRef = useRef<HTMLDialogElement>(null);
  const searchInput = useRef<HTMLInputElement>(null);
  const {progress,ready} = useLearning();
  const pending = catalog.lectures.flatMap(l=>l.recallQuestions).filter(q=>progress.reviews[q.id]!=='understood').length;
  const active = (href:string) => href === '/' ? pathname === '/' : pathname === href || pathname.startsWith(href+'/');
  const needle = query.trim().toLowerCase();
  const items = [
    ...catalog.courses.map(c=>({title:c.title,detail:c.code+' · 课程',href:'/courses/'+c.slug,text:c.type})),
    ...catalog.lectures.map(l=>({title:l.title,detail:'Lecture '+l.number+' · 示例',href:'/courses/'+l.course+'/'+l.slug,text:l.summary})),
    ...catalog.concepts.map(c=>({title:c.title,detail:'Concept / Formula',href:'/knowledge/'+c.slug,text:c.english+' '+c.chinese+' '+c.formula})),
  ];
  const results = needle ? items.filter(i=>(i.title+' '+i.detail+' '+i.text).toLowerCase().includes(needle)) : items.slice(0,4);
  function search() { searchRef.current?.showModal(); searchInput.current?.focus(); }
  function closeMenu() { drawerRef.current?.close(); setMenu(false); }
  useEffect(()=>{
    const key = (e:KeyboardEvent) => { if ((e.metaKey||e.ctrlKey)&&e.key.toLowerCase()==='k') { e.preventDefault(); searchRef.current?.showModal(); searchInput.current?.focus(); } };
    document.addEventListener('keydown',key); return ()=>document.removeEventListener('keydown',key);
  },[]);
  const navigation = <>
    <Link href="/" className="brand" onClick={closeMenu}><span className="brand-mark"><T>M</T></span><span><T>MBA Learning OS</T><small><T>FUDAN IMBA · 2026 FALL</T></small></span></Link>
    <nav aria-label={t("主要导航")} className="main-nav"><T>{nav.map(n=><Link key={n.href} href={n.href} onClick={closeMenu} aria-current={active(n.href)?'page':undefined}><span aria-hidden="true"><T>{n.icon}</T></span><T>{n.label}</T><T>{n.href==='/review'&&ready&&<span className="count"><T>{pending}</T></span>}</T></Link>)}</T></nav>
    <p className="nav-label"><T>课程目录 </T><span><T>{catalog.courses.length}</T></span></p>
    <nav aria-label={t("学期课程")} className="course-tree"><T>{catalog.courses.map(c=><details key={c.slug} open={pathname.includes('/courses/'+c.slug)||undefined}><summary><span className={'course-dot '+c.tone}/><span><T>{c.title}</T></span></summary><Link onClick={closeMenu} href={'/courses/'+c.slug}><T>课程总览</T></Link><T>{catalog.lectures.filter(l=>l.course===c.slug).map(l=><Link key={l.slug} onClick={closeMenu} href={'/courses/'+c.slug+'/'+l.slug}><T>Lecture </T><T>{String(l.number).padStart(2,'0')}</T><T> · 示例</T></Link>)}</T></details>)}</T></nav>
    <nav className="utility-nav" aria-label={t("其他空间")}><Link href="/my-os" onClick={closeMenu} aria-current={active('/my-os')?'page':undefined}><T>My OS · 本机笔记</T></Link><Link href="/classroom" onClick={closeMenu}><T>IMBA Classroom</T></Link><Link href="/sitemap" onClick={closeMenu} aria-current={active('/sitemap')?'page':undefined}><T>站点地图</T></Link></nav>
    <div className="sidebar-foot"><b><T>学习进度保存在本机</T></b><Link onClick={closeMenu} href="/my-os#backup"><T>备份与迁移</T></Link></div>
  </>;
  return <div className="app-shell">
    <a className="skip-link" href="#main-content"><T>跳转到正文</T></a>
    <aside className="sidebar"><T>{navigation}</T></aside>
    <div className="workspace">
      <header className="topbar">
        <button className="mobile-menu icon-button" aria-label={t("打开课程导航")} aria-expanded={menu} onClick={()=>{setMenu(true);drawerRef.current?.showModal();}}><T>☰</T></button>
        <span className="topbar-location"><T>WORKSPACE </T><span><T>/</T></span> <T>{nav.find(n=>active(n.href))?.label||'MBA Learning OS'}</T></span>
        <button className="search-trigger" onClick={search}><span aria-hidden="true"><T>⌕</T></span><span><T>搜索课程、概念与公式</T></span><kbd><T>⌘ K</T></kbd></button>
        <LanguageSwitch/><span className="local-badge"><T>本机学习空间</T></span>
      </header>
      <main id="main-content" tabIndex={-1}><T>{children}</T></main>
      <footer className="page-footer"><span><T>MBA Learning OS · V1.1</T></span><Link href="/sitemap"><T>站点地图</T></Link><Link href="/my-os#backup"><T>数据备份</T></Link></footer>
    </div>
    <nav className="mobile-bottom" aria-label={t("移动端导航")}><T>{nav.map(n=><Link key={n.href} href={n.href} aria-current={active(n.href)?'page':undefined}><span aria-hidden="true"><T>{n.icon}</T></span><T>{n.label}</T></Link>)}</T><Link href="/my-os" aria-current={active('/my-os')?'page':undefined}><span aria-hidden="true"><T>☷</T></span><T>我的</T></Link></nav>
    <dialog ref={drawerRef} className="drawer" aria-label={t("课程导航")} onClose={()=>setMenu(false)} onClick={e=>{if(e.target===drawerRef.current)closeMenu();}}><button className="drawer-close" onClick={closeMenu}><T>关闭导航 ×</T></button><T>{navigation}</T></dialog>
    <dialog ref={searchRef} className="search-modal" aria-labelledby="search-title" onClick={e=>{if(e.target===searchRef.current)searchRef.current.close();}}>
      <header><h2 id="search-title"><T>搜索学习内容</T></h2><button className="icon-button" aria-label={t("关闭搜索")} onClick={()=>searchRef.current?.close()}><T>×</T></button></header>
      <label className="sr-only" htmlFor="global-search"><T>搜索关键词</T></label><input id="global-search" ref={searchInput} value={query} onChange={e=>setQuery(e.target.value)} placeholder={t("试试 elasticity / 机会成本")}/>
      <p className="meta" role="status"><T>{needle ? results.length+' 个结果':'课程快捷入口'}</T><T> · 仅搜索公开内容</T></p>
      <div className="search-results"><T>{results.map(i=><Link key={i.href} href={i.href} onClick={()=>searchRef.current?.close()}><span><b><T>{i.title}</T></b><small><T>{i.detail}</T></small></span><span aria-hidden="true"><T>↗</T></span></Link>)}</T><T>{!results.length&&<p className="empty-state"><T>没有匹配结果，请尝试概念英文名或课程缩写。</T></p>}</T></div>
    </dialog>
  </div>;
}
export default function SiteShell({children}: {children:React.ReactNode}) { return <LanguageProvider><LearningProvider><Shell><T>{children}</T></Shell></LearningProvider></LanguageProvider>; }
