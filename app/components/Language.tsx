'use client';
import { createContext, useContext, useEffect, useState, type ReactNode, Children } from 'react';
import { translate, languageStorageKey, readLanguage } from '@/lib/language.mjs';
type Language = 'zh' | 'en';
const Context = createContext<{language: Language; toggle: () => void; persistent: boolean}>({language:'zh',toggle:()=>{},persistent:true});
export function LanguageProvider({children}:{children:ReactNode}) {
 const [language,setLanguage]=useState<Language>('zh');
 const [persistent,setPersistent]=useState(true);
 useEffect(()=>{
  const read=()=>{try {setLanguage(readLanguage(localStorage.getItem(languageStorageKey)));} catch {setPersistent(false);}};
  read();window.addEventListener('storage',read);return()=>window.removeEventListener('storage',read);
 },[]);
 useEffect(()=>{document.documentElement.lang=language==='zh'?'zh-CN':'en';},[language]);
 function toggle(){const next=language==='zh'?'en':'zh';setLanguage(next);try{localStorage.setItem(languageStorageKey,next);setPersistent(true);}catch{setPersistent(false);}}
 return <Context.Provider value={{language,toggle,persistent}}>{children}</Context.Provider>;
}
export function useLanguage(){const state=useContext(Context);return {...state,t:(value:string)=>translate(value,state.language) as string};}
export function T({children}:{children:ReactNode}){const {language}=useLanguage();return <>{Children.map(children,child=>typeof child==='string'?translate(child,language):child)}</>;}
export function LanguageSwitch(){const {language,toggle,persistent}=useLanguage();return <div className="language-control"><button type="button" className="language-switch" onClick={toggle} aria-label={language==='zh'?'Switch interface to English':'切换界面为中文'} title={language==='zh'?'切换为英文':'Switch to Chinese'}><span aria-hidden="true">◎</span> {language==='zh'?'English':'中文'}</button>{!persistent&&<span className="sr-only" role="status">{language==='zh'?'语言偏好未保存，刷新后可能恢复中文。':'Language preference could not be saved.'}</span>}</div>;}
