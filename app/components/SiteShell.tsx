'use client';
import { T, useLanguage, LanguageProvider, LanguageSwitch } from '@/app/components/Language';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { catalog } from '@/lib/catalog';
import courseMap from '@/content/public/course-map.json';
import {lessonSearchItems} from '@/lib/lecture-notes';
import { LearningProvider } from './LearningState';
import {useWorkspace,WorkspaceProvider} from './WorkspaceState';
const nav = [
  {href:'/calendar',label:'Schedule',icon:'▦'},
  {href:'/map',label:'Map',icon:'◇'},
];
function Shell({children}: {children: React.ReactNode}) {
  const {t,language} = useLanguage();
  const ws=useWorkspace();
  const pathname = usePathname().replace(/\/$/,'') || '/';
  const [query,setQuery] = useState('');
  const [menu,setMenu] = useState(false);
  const searchRef = useRef<HTMLDialogElement>(null);
  const drawerRef = useRef<HTMLDialogElement>(null);
  const searchInput = useRef<HTMLInputElement>(null);
  const active = (href:string) => href === '/' ? pathname === '/' : pathname === href || pathname.startsWith(href+'/');
  const needle = query.trim().toLowerCase();
  const items = [
    ...lessonSearchItems,
    ...courseMap.flatMap(outline=>outline.chapters.flatMap(chapter=>chapter.concepts.map(concept=>({title:concept.titleZh+' · '+concept.titleEn,detail:catalog.courses.find(course=>course.slug===outline.course)?.code+' · 课程导图',href:'/map?course='+outline.course+'&concept='+concept.id,text:concept.summaryZh+' '+concept.summaryEn+' '+concept.caseZh+' '+concept.caseEn})))),
    ...catalog.courses.map(c=>({title:c.title,detail:c.code+' · 课程',href:'/courses/'+c.slug,text:c.type})),
    ...catalog.lectures.map(l=>({title:l.title,detail:'Lecture '+l.number+' · 示例',href:'/courses/'+l.course+'/'+l.slug,text:l.summary})),
    ...catalog.concepts.map(c=>({title:c.title,detail:'Concept / Formula',href:'/knowledge/'+c.slug,text:c.english+' '+c.chinese+' '+c.formula})),
    ...ws.records.filter(record=>record.owner===ws.ownerId&&(record.kind==='capture'||record.kind==='note')).map(record=>({title:String(record.data.title||'我的笔记'),detail:'仅个人 · My note',href:record.kind==='capture'?'/capture':record.key.startsWith('concept-')?'/map?concept='+record.key.slice(8):'/my-os',text:String(record.data.text||'')})),
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
    <nav aria-label={t("主要导航")} className="main-nav core-nav"><T>{nav.map(n=><Link key={n.href} href={n.href} onClick={closeMenu} aria-current={active(n.href)?'page':undefined}><span aria-hidden="true"><T>{n.icon}</T></span><T>{n.label}</T></Link>)}</T></nav>
    <p className="nav-label"><T>辅助工具</T></p>
    <nav className="utility-nav compact-utilities" aria-label={t("辅助工具")}><Link href="/" onClick={closeMenu} aria-current={pathname==='/'?'page':undefined}><T>今日首页</T></Link><Link href="/capture" onClick={closeMenu} aria-current={active('/capture')?'page':undefined}><T>随时记录</T></Link><Link href="/my-os" onClick={closeMenu} aria-current={active('/my-os')?'page':undefined}><T>我的笔记</T></Link><Link href="/account" onClick={closeMenu} aria-current={active('/account')?'page':undefined}><T>账号与备份</T></Link><a href="https://translate.google.com/" target="_blank" rel="noreferrer"><T>Google 翻译</T> ↗</a></nav>
    <div className="sidebar-foot"><b>{ws.user?(language==='en'?'Cloud workspace':'账号学习空间'):<T>学习进度保存在本机</T>}</b><Link onClick={closeMenu} href="/my-os#backup"><T>备份与迁移</T></Link></div>
  </>;
  return <div className="app-shell">
    <a className="skip-link" href="#main-content"><T>跳转到正文</T></a>
    <aside className="sidebar"><T>{navigation}</T></aside>
    <div className="workspace">
      <header className="topbar">
        <button className="mobile-menu icon-button" aria-label={t("打开课程导航")} aria-expanded={menu} onClick={()=>{setMenu(true);drawerRef.current?.showModal();}}><T>☰</T></button>
        <span className="topbar-location"><T>WORKSPACE </T><span><T>/</T></span> <T>{nav.find(n=>active(n.href))?.label||'MBA Learning OS'}</T></span>
        <button className="search-trigger" onClick={search}><span aria-hidden="true"><T>⌕</T></span><span><T>搜索课程、概念与公式</T></span><kbd><T>⌘ K</T></kbd></button>
        <Link href="/capture" className="quick-capture"><T>＋ 随时记录</T></Link><LanguageSwitch/><span className="local-badge">{ws.user?(language==='en'?'Cloud sync':'账号同步'):<T>本机学习空间</T>}</span>
      </header>
      <main id="main-content" tabIndex={-1}><T>{children}</T></main>
      <footer className="page-footer"><span><T>MBA Learning OS · V1.6.4</T></span><Link href="/calendar">Schedule</Link><Link href="/map">Map</Link><Link href="/my-os#backup"><T>数据备份</T></Link></footer>
    </div>
    <Link href="/capture" className="mobile-note-fab" aria-label={t("随时记录")}><span>＋</span></Link>
    <nav className="mobile-bottom two-primary" aria-label={t("移动端导航")}><T>{nav.map(n=><Link key={n.href} href={n.href} aria-current={active(n.href)?'page':undefined}><span aria-hidden="true"><T>{n.icon}</T></span><T>{n.label}</T></Link>)}</T></nav>
    <dialog ref={drawerRef} className="drawer" aria-label={t("课程导航")} onClose={()=>setMenu(false)} onClick={e=>{if(e.target===drawerRef.current)closeMenu();}}><button className="drawer-close" onClick={closeMenu}><T>关闭导航 ×</T></button><T>{navigation}</T></dialog>
    <dialog ref={searchRef} className="search-modal" aria-labelledby="search-title" onClick={e=>{if(e.target===searchRef.current)searchRef.current.close();}}>
      <header><h2 id="search-title"><T>搜索学习内容</T></h2><button className="icon-button" aria-label={t("关闭搜索")} onClick={()=>searchRef.current?.close()}><T>×</T></button></header>
      <label className="sr-only" htmlFor="global-search"><T>搜索关键词</T></label><input id="global-search" ref={searchInput} value={query} onChange={e=>setQuery(e.target.value)} placeholder={t("试试 elasticity / 机会成本")}/>
      <p className="meta" role="status"><T>{needle ? results.length+' 个结果':'课程快捷入口'}</T><T> · 搜索公开内容与本人的私人笔记</T></p>
      <div className="search-results"><T>{results.map(i=><Link key={i.href} href={i.href} onClick={()=>searchRef.current?.close()}><span><b><T>{i.title}</T></b><small><T>{i.detail}</T></small></span><span aria-hidden="true"><T>↗</T></span></Link>)}</T><T>{!results.length&&<p className="empty-state"><T>没有匹配结果，请尝试概念英文名或课程缩写。</T></p>}</T></div>
    </dialog>
  </div>;
}
export default function SiteShell({children}: {children:React.ReactNode}) { return <LanguageProvider><WorkspaceProvider><LearningProvider><Shell><T>{children}</T></Shell></LearningProvider></WorkspaceProvider></LanguageProvider>; }
