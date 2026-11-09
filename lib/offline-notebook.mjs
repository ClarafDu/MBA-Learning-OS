import { notebookEntries } from './notebook.mjs';
import { parseProgress, storageKey } from './progress.mjs';
import { STORAGE_KEY as accountingKey } from '../integrations/accounting/core.js';
import { KEY as dmdKey } from '../integrations/dmd/state.js';
import { KEY as economicsKey } from '../integrations/economics/state.js';

const string = value => typeof value === 'string' ? value : '';
const escape = value => string(value).replace(/[&<>"']/g, char => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
}[char]));

export function collectOfflineNotes(records, owner, storage, workspaceKey, localOwner) {
  const notes = [];
  const failed = [];
  function read(key, label, collect) {
    try {
      const raw = storage.getItem(key);
      if (raw) collect(JSON.parse(raw));
    } catch {
      failed.push(label);
    }
  }
  function add(source, title, body, meta = '') {
    if (string(body).trim() || string(meta).trim()) {
      notes.push({source, title: string(title).trim() || '未命名笔记', body: string(body), meta});
    }
  }
  function workspace(list, id, source) {
    for (const {key, data} of notebookEntries(list, id)) {
      const meta = [data.course, data.category, data.link, data.fileName && `附件文件名：${data.fileName}`]
        .filter(value => typeof value === 'string' && value).join('\n');
      add(source, data.title || key, data.text, meta);
    }
  }
  if (owner !== localOwner) workspace(records, owner, '账号笔记');
  read(workspaceKey, '本机随时记录', list => workspace(list, localOwner, '本机随时记录'));
  read(storageKey, '本机课程笔记', data => {
    for (const [id, body] of Object.entries(parseProgress(data).notes)) add('本机课程笔记', id, body);
  });
  for (const [key, label] of [[accountingKey, '会计'], [dmdKey, 'DMD'], [economicsKey, '经济学']]) {
    read(key, label, data => {
      for (const note of data.notes) {
        if (!note.deleted) add(label, note.nodeId || note.node, note.body, string(note.kind));
      }
      if (key === economicsKey) {
        for (const [id, decision] of Object.entries(data.decisions || {})) {
          const sections = [['初步判断', decision.before], ['复盘', decision.after], ['迁移', decision.transfer]];
          add(label, id, sections.filter(([, value]) => string(value).trim()).map(([name, value]) => `${name}\n${value}`).join('\n\n'));
        }
      }
    });
  }
  return {notes, failed};
}

export function offlineMarkdown(notes) {
  return ['# MBA Learning OS 学习笔记', ...notes.map(({source, title, body, meta}) =>
    [`## ${title.replace(/[\r\n]+/g, ' ')}`, source, meta, body].filter(Boolean).join('\n\n')
  )].join('\n\n---\n\n') + '\n';
}

export function offlineHTML(notes) {
  return `<!doctype html><html lang="zh-CN"><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>MBA Learning OS 学习笔记</title>
<style>body{font:16px/1.6 system-ui,sans-serif;max-width:820px;margin:24px auto;padding:0 16px;color:#172825}h2{font-size:1.2em;margin:0}article{border-top:1px solid #ccc;margin-top:18px;padding-top:14px}p{white-space:pre-wrap;overflow-wrap:anywhere}small{color:#475852}button{font:inherit;padding:8px 12px}@media print{button,.hint{display:none}body{max-width:none;margin:0;padding:0;color:#000;font-size:11pt}h2,small{break-after:avoid}@page{size:A4;margin:16mm}}</style>
<h1>MBA Learning OS 学习笔记</h1><p>共 ${notes.length} 条 · 离线副本</p><button type="button" onclick="print()">打印 / 另存为 PDF</button><p class="hint">可用浏览器的页内查找搜索笔记。</p>
${notes.map(({source,title,meta,body}) => `<article><h2>${escape(title)}</h2><small>${escape(source)}</small>${meta ? `<p>${escape(meta)}</p>` : ''}<p>${escape(body)}</p></article>`).join('\n')}
</html>`;
}
