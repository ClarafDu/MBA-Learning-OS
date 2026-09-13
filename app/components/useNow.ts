'use client';
import {useEffect,useState} from 'react';
export function useNow(){const [now,setNow]=useState(0);useEffect(()=>{const tick=()=>setNow(Date.now());queueMicrotask(tick);const timer=setInterval(tick,60000);return()=>clearInterval(timer);},[]);return now;}
