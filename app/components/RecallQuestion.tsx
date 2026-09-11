'use client';
import { T } from '@/app/components/Language';

import { useState } from 'react';
import { useLearning } from './LearningState';
export default function RecallQuestion({id,number,question,answer}: {id:string;number:number;question:string;answer:string}) {
  const [shown,setShown] = useState(false);
  const {progress,review,ready,error} = useLearning();
  const status = progress.reviews[id];
  return <article className="recall-card">
    <div className="card-meta"><span className="eyebrow"><T>RECALL </T><T>{String(number).padStart(2,'0')}</T></span><span className="pill"><T>{status==='understood'?'已理解':status==='later'?'稍后复习':'待复习'}</T></span></div>
    <h3><T>{question}</T></h3>
    <button className="button secondary" aria-expanded={shown} onClick={()=>setShown(!shown)}><T>{shown?'收起答案':'显示答案'}</T></button>
    <T>{shown&&<><p className="answer"><T>{answer}</T></p><div className="button-row"><button className="button" disabled={!ready||!!error} onClick={()=>review(id,'understood')}><T>已理解</T></button><button className="button secondary" disabled={!ready||!!error} onClick={()=>review(id,'later')}><T>稍后复习</T></button><T>{status&&<button className="text-button" onClick={()=>review(id,'idle')}><T>重置此题</T></button>}</T></div></>}</T>
  </article>;
}
