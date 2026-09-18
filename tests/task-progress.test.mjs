import test from 'node:test';
import assert from 'node:assert/strict';
import {taskKey,taskState,taskStats} from '../lib/task-progress.mjs';
import {parseWorkspaceBackup} from '../lib/workspace-backup.mjs';
const event={id:'homework',done:false};
test('deadline state belongs only to its owner and does not change shared tasks',()=>{
 const record={key:taskKey(event),owner:'me',kind:'review',data:{type:'deadline',status:'idle',done:true,archived:true}};
 assert.equal(taskState(event,[record],'other').done,false);
 assert.equal(taskState(event,[record],'me').archived,true);
 assert.equal(event.done,false);
 assert.notEqual(taskKey({...event,recordId:'other-event'}),taskKey(event));
 assert.equal(taskState({...event,done:true},[],'me').done,true);
 assert.equal(taskState({...event,done:true},[{...record,data:{...record.data,done:false}}],'me').done,false);
});
test('archiving unfinished work never increases completion rate',()=>{
 assert.deepEqual(taskStats([{done:true,archived:true},{done:false,archived:true},{done:false,archived:false}]),{total:3,completed:1,archived:2,rate:33});
 assert.equal(taskStats([]).rate,0);
});
test('private deadline progress survives workspace backup restore',()=>{
 const result=parseWorkspaceBackup(JSON.stringify({version:'1.2.1',records:[{key:taskKey(event),kind:'review',visibility:'class',data:{type:'deadline',status:'idle',done:true,archived:false}}]}));
 assert.equal(result[0].visibility,'private');
 assert.equal(result[0].data.done,true);
});
