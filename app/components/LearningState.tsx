'use client';
import { T } from '@/app/components/Language';

import { createContext, useContext, useEffect, useState } from 'react';
import { emptyProgress, parseProgress, storageKey } from '@/lib/progress.mjs';
type Progress = { version: number; reviews: Record<string,string>; notes: Record<string,string> };
type Context = { progress: Progress; ready: boolean; error: string; save: (next: Progress) => boolean; review: (id: string,status: string) => boolean };
const LearningContext = createContext<Context | null>(null);
export function LearningProvider({children}: {children: React.ReactNode}) {
  const [progress,setProgress] = useState<Progress>(emptyProgress());
  const [ready,setReady] = useState(false);
  const [error,setError] = useState('');
  useEffect(() => {
    const read = () => {
      try { const raw = localStorage.getItem(storageKey); setProgress(raw ? parseProgress(JSON.parse(raw)) : emptyProgress()); setError(''); }
      catch { setError('无法读取本机数据。原数据已保留，请先导出备份，再检查浏览器存储设置。'); }
      setReady(true);
    };
    read();
    window.addEventListener('storage',read);
    return () => window.removeEventListener('storage',read);
  },[]);
  function save(next: Progress) {
    if (!ready || error) return false;
    try { localStorage.setItem(storageKey,JSON.stringify(next)); setProgress(next); return true; }
    catch { setError('保存失败：请检查浏览器存储空间，并导出当前数据备份。'); return false; }
  }
  function review(id: string,status: string) {
    const reviews = {...progress.reviews};
    if (status === 'idle') delete reviews[id]; else reviews[id] = status;
    return save({...progress,reviews});
  }
  return <LearningContext.Provider value={{progress,ready,error,save,review}}><T>{error && <div role="alert" className="storage-alert"><T>{error}</T></div>}</T><T>{children}</T></LearningContext.Provider>;
}
export function useLearning() { const value = useContext(LearningContext); if (!value) throw new Error('LearningProvider missing'); return value; }
