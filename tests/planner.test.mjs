import {test} from 'node:test';
import assert from 'node:assert/strict';
import {validateEvent,deadline,makeICS,parseCalendarJSON,safeUrl} from '../lib/planner.mjs';
const event={id:'test-event',title:'复旦课程, reflection; review',course:'managerial-economics',kind:'reflection',start:'2026-09-20T23:59:00+08:00',end:'2026-09-21T00:00:00+08:00',created:'2026-09-13T00:00:00+08:00',visibility:'private',description:'A\r\nB',location:'上海',link:'https://example.com/submit',materialLink:'',reminder:30,done:false};
test('calendar validates timezone, order, kind, id and URLs',()=>{
 assert.equal(validateEvent(event).title,event.title);
 for(const delta of [{end:event.start},{start:'bad'},{id:''},{kind:'other'},{reminder:-1},{description:{}},{course:''},{start:'2026-09-20T23:59:00'},{link:'javascript:alert(1)'}])assert.throws(()=>validateEvent({...event,...delta}));
 assert.equal(safeUrl('https://example.com'),true);assert.equal(safeUrl('http://example.com'),false);
});
test('public calendar cannot expose submission links, private notes or material links',()=>{
 assert.throws(()=>validateEvent({...event,visibility:'public'}));
 const pub={...event,visibility:'public',kind:'class',link:'',description:'',materialLink:''};
 assert.equal(validateEvent(pub).visibility,'public');
 const publicICS=makeICS([event,pub],{publicOnly:true});
 assert.equal((publicICS.match(/BEGIN:VEVENT/g)||[]).length,1);
 assert.ok(!publicICS.includes('example.com'));assert.ok(!publicICS.includes('VALARM'));
});
test('ICS uses UTC, escaped text, CRLF, stable UID and alarm',()=>{
 const ics=makeICS([event]);
 assert.ok(ics.includes('DTSTART:20260920T155900Z'));
 assert.ok(ics.includes('DTEND:20260920T160000Z'));
 assert.ok(ics.includes('UID:test-event@mba-learning-os'));
 assert.ok(ics.includes('TRIGGER:-PT30M'));
 assert.ok(ics.includes('A\\nB'));assert.ok(ics.includes('\\, reflection\\;'));
 assert.ok(ics.endsWith('END:VCALENDAR\r\n'));
});
test('ICS folding preserves UTF-8 and prevents multiline field injection',()=>{
 const ics=makeICS([{...event,title:'中'.repeat(80)+'\rBEGIN:VEVENT'}]);
 for(const line of ics.split('\r\n'))assert.ok(Buffer.byteLength(line)<=75);
 assert.equal((ics.match(/\r\nBEGIN:VEVENT\r\n/g)||[]).length,1);
 assert.ok(ics.replace(/\r\n /g,'').includes('中'.repeat(80)));
});
test('deadline time progress clamps and treats even one minute late as overdue',()=>{
 assert.equal(deadline(event,Date.parse(event.created)).percent,0);
 assert.equal(deadline(event,Date.parse(event.start)+60000).days,-1);
 assert.equal(deadline(event,Date.parse(event.start)+60000).percent,100);
 assert.equal(deadline(event,Date.parse(event.created)-100).percent,0);
});
test('calendar import is all validated before writes and rejects duplicates',()=>{
 assert.equal(parseCalendarJSON(JSON.stringify([event]))[0].id,event.id);
 assert.throws(()=>parseCalendarJSON(JSON.stringify([event,event])));
 assert.throws(()=>parseCalendarJSON(JSON.stringify([event,{...event,id:'e2',start:'bad'}])));
 assert.throws(()=>parseCalendarJSON(JSON.stringify(Array(301).fill(event))));
});
