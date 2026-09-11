'use client';
import { T } from '@/app/components/Language';


import { useState } from 'react';

export default function ChineseExplanation({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="chinese-explanation">
      <button type="button" onClick={() => setOpen((value) => !value)} aria-expanded={open}>
        <T>{open ? '收起中文解释' : '查看中文解释'}</T> <span><T>{open ? '−' : '+'}</T></span>
      </button>
      <T>{open ? <p><T>{children}</T></p> : null}</T>
    </div>
  );
}
