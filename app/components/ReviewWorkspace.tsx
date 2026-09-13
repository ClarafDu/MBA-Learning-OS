'use client';
import { T, useLanguage } from '@/app/components/Language';

import Link from 'next/link';
import { useState } from 'react';
import { knowledge } from '@/lib/knowledge';
import { catalog } from '@/lib/catalog';
import { useLearning } from './LearningState';

export default function ReviewWorkspace() {
 const {t,language} = useLanguage();
 const cards = [...catalog.lectures.flatMap(l=>l.recallQuestions.map(q=>({...q,course:l.course,courses:[l.course],href:'/courses/'+l.course+'/'+l.slug+'#quick-review',label:'ME · 示例题 / Sample'}))),...knowledge.map(k=>({id:'concept/'+k.id,question:language==='en'?'Explain '+k.en.toLowerCase()+' and give a managerial example.':'请解释「'+k.zh+'」，并给出一个管理场景的例子。',answer:language==='en'?k.definitionEn+' '+k.exampleEn:k.definitionZh+' '+k.exampleZh,course:k.courses[0],courses:k.courses,href:'/map?concept='+k.id,label:language==='en'?k.en:k.zh}))];
  const {progress,review,ready,error} = useLearning();
  const [filter,setFilter]=useState('pending');
  const [course,setCourse]=useState('all');
  const [index,setIndex]=useState(0);
  const [shown,setShown]=useState(false);
  const [notice,setNotice]=useState('');
  const [undo,setUndo]=useState<{id:string;status:string}|null>(null);
  const pending=cards.filter(c=>progress.reviews[c.id]!=='understood').length;
  const scoped=cards.filter(c=>(course==='all'||c.courses.includes(course))&&(filter==='all'||(filter==='pending'?progress.reviews[c.id]!=='understood':progress.reviews[c.id]===filter)));
  const position=scoped.length ? index%scoped.length:0;
  const card=scoped[position];
  async function mark(status:string) {
    if(!card)return;
    setUndo({id:card.id,status:progress.reviews[card.id]||'idle'});
    if (!await review(card.id,status)) { setNotice('保存未成功，请检查存储提示。'); setUndo(null); return; }
    setShown(false);
    setNotice(status==='understood'?'已标记为理解，可撤销。':'已放入稍后复习；不会自动设置学习日期。');
    if(status==='later'||filter==='all')setIndex(position+1);
  }
  function changeFilter(value:string) {setFilter(value);setIndex(0);setShown(false);}
  return <div className="content">
    <header className="page-header"><p className="eyebrow"><T>MY OS / QUICK REVIEW</T></p><h1><T>复习队列</T></h1><p><T>先回忆，再查看答案。每次留出 5–10 分钟。</T></p></header>
    <div className="review-layout">
      <section>
        <div className="review-toolbar"><div className="segmented" aria-label={t("复习状态")}><T>{[['pending','待复习'],['later','稍后'],['understood','已理解'],['all','全部']].map(([value,label])=><button key={value} aria-pressed={filter===value} onClick={()=>changeFilter(value)}><T>{label}</T></button>)}</T></div><label className="select-label"><T>课程</T><select value={course} onChange={e=>{setCourse(e.target.value);setIndex(0);setShown(false);}}><option value="all"><T>全部课程</T></option><T>{catalog.courses.map(c=><option key={c.slug} value={c.slug}><T>{c.title}</T></option>)}</T></select></label></div>
        <T>{!ready ? <div className="panel empty-state" role="status"><T>正在读取学习进度…</T></div> : card ? <article className="study-card">
          <div className="card-meta"><span className="pill"><T>{card.label}</T></span><span className="meta"><T>{position+1}</T><T> / </T><T>{scoped.length}</T></span></div>
          <h2><T>{card.question}</T></h2><p className="study-prompt"><T>用自己的话回答，再检查你的推理。</T></p>
          <T>{shown?<div className="answer" id="review-answer"><span className="eyebrow"><T>参考答案</T></span><p><T>{card.answer}</T></p></div>:<button className="button" onClick={()=>setShown(true)} aria-expanded={false}><T>显示答案</T></button>}</T>
          <T>{shown&&<div className="button-row"><button className="button secondary" disabled={!!error} onClick={()=>mark('later')}><T>稍后复习</T></button><button className="button" disabled={!!error} onClick={()=>mark('understood')}><T>已理解 ✓</T></button></div>}</T>
          <div className="study-footer"><Link href={card.href}>{language==='en'?'Review the source concept':'回到知识点'} →</Link><button className="text-button" onClick={()=>{setIndex(position+1);setShown(false);}}><T>下一题 →</T></button></div>
        </article>:<div className="panel empty-state"><span className="empty-symbol"><T>✓</T></span><h2><T>{filter==='pending'&&course==='all'?'本轮复习已完成':'这里暂时没有题目'}</T></h2><p><T>{filter==='pending'?'可以回到课程继续学习，或切到“全部”重新练习。':'切换课程或状态，查看其他题目。'}</T></p><Link className="button" href="/courses"><T>返回全部课程</T></Link></div>}</T>
        <div className="inline-feedback" role="status"><T>{notice}</T><T>{undo&&<button className="text-button" disabled={!!error} onClick={()=>{review(undo.id,undo.status);setUndo(null);setNotice('已撤销上一次标记。');setIndex(0);}}><T>撤销</T></button>}</T></div>
      </section>
      <aside className="review-aside">
        <div className="panel"><p className="eyebrow"><T>你的复习进度</T></p><strong className="metric"><T>{ready?pending:'—'}</T><small><T>题待复习</T></small></strong><progress aria-label={t("已理解题目比例")} max={cards.length||1} value={cards.length-pending}/><p className="meta"><T>{cards.length-pending}</T><T> / </T><T>{cards.length}</T><T> 题已理解</T></p><p><T>标记会同步到首页、课程页与 Lecture，并在刷新后保留。</T></p></div>
        <div className="panel subtle"><h3><T>需要再理解一下？</T></h3><p><T>回到概念、公式与管理含义，再试一次。</T></p><Link href="/knowledge"><T>打开知识库 →</T></Link></div>
        <p className="meta"><T>当前题目用于体验学习流程，不代表真实课堂或考试内容。</T></p>
      </aside>
    </div>
  </div>;
}
