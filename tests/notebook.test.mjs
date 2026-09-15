import {test} from 'node:test';
import assert from 'node:assert/strict';
import {makeNotebookJSON,makeNotebookMarkdown,notebookEntries} from '../lib/notebook.mjs';

const records=[
 {owner:'me',key:'capture-1',kind:'capture',visibility:'class',updated_at:'2026-09-15T02:00:00.000Z',data:{title:'课堂\n想法',text:'完整正文',course:'managerial-economics',link:'https://example.com',fileName:'note.pdf'}},
 {owner:'me',key:'note-1',kind:'note',visibility:'private',updated_at:'2026-09-14T02:00:00.000Z',data:{title:'概念笔记',text:'边际收益'}},
 {owner:'other',key:'capture-2',kind:'capture',updated_at:'2026-09-16T02:00:00.000Z',data:{title:'他人内容'}},
 {owner:'me',key:'event-1',kind:'event',updated_at:'2026-09-16T02:00:00.000Z',data:{title:'日程'}}
];

test('notebook export contains only the owner notes and keeps complete data',()=>{
 const entries=notebookEntries(records,'me');
 assert.equal(entries.length,2);
 assert.equal(entries[0].key,'capture-1');
 assert.equal(entries[0].visibility,'private');
 const json=JSON.parse(makeNotebookJSON(records,'me','2026-09-15T03:00:00.000Z'));
 assert.equal(json.records[0].data.fileName,'note.pdf');
 assert.ok(!JSON.stringify(json).includes('他人内容'));
});

test('markdown export is readable and flattens multiline headings',()=>{
 const markdown=makeNotebookMarkdown(records,'me','2026-09-15T03:00:00.000Z');
 assert.ok(markdown.includes('## 课堂 想法'));
 assert.ok(markdown.includes('完整正文'));
 assert.ok(markdown.includes('链接：https://example.com'));
 assert.ok(markdown.includes('共 2 条记录'));
});
