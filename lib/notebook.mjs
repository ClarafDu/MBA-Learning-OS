function text(value) {
  return typeof value === 'string' ? value : '';
}

export function notebookEntries(records, owner) {
  return records
    .filter(record => record?.owner === owner && ['capture', 'note'].includes(record.kind))
    .map(record => ({
      key: record.key,
      kind: record.kind,
      visibility: 'private',
      updatedAt: text(record.updated_at),
      data: JSON.parse(JSON.stringify(record.data || {}))
    }))
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

function heading(value) {
  return (text(value).trim() || '未命名记录').replace(/[\r\n]+/g, ' ');
}

export function makeNotebookMarkdown(records, owner, exportedAt = new Date().toISOString()) {
  const entries = notebookEntries(records, owner);
  const blocks = entries.map(entry => {
    const data = entry.data;
    const meta = [text(data.category), text(data.course), entry.updatedAt].filter(Boolean).join(' · ');
    const lines = [`## ${heading(data.title)}`, meta ? `_${meta}_` : '', text(data.text)];
    if (text(data.link)) lines.push(`链接：${data.link}`);
    if (text(data.fileName)) lines.push(`附件：${data.fileName}`);
    return lines.filter(Boolean).join('\n\n');
  });
  return [`# MBA Learning OS 随时记录`, `导出时间：${exportedAt}`, `共 ${entries.length} 条记录`, ...blocks].join('\n\n---\n\n') + '\n';
}

export function makeNotebookJSON(records, owner, exportedAt = new Date().toISOString()) {
  return JSON.stringify({version: '1.4.1-notebook', exportedAt, records: notebookEntries(records, owner)}, null, 2);
}
