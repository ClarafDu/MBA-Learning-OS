import {test} from 'node:test';
import assert from 'node:assert/strict';
import {parseWorkspaceBackup} from '../lib/workspace-backup.mjs';
const record={key:'test',kind:'note',visibility:'class',owner:'somebody-else',data:{text:'private thought'}};
const serialize=records=>JSON.stringify({version:'1.2.1',records});
test('restored records are private and cannot select another owner',()=>{
 const [restored]=parseWorkspaceBackup(serialize([record]));
 assert.equal(restored.visibility,'private');assert.equal(restored.owner,undefined);assert.equal(restored.data.text,'private thought');
});
test('invalid, duplicate, prototype and malicious records are rejected before restore',()=>{
 for(const delta of [{key:'__proto__'},{kind:'admin'},{data:{link:'javascript:alert(1)'}},{data:{text:{}}}])
  assert.throws(()=>parseWorkspaceBackup(serialize([{...record,...delta}])));
 assert.throws(()=>parseWorkspaceBackup(serialize([record,record])));
 assert.throws(()=>parseWorkspaceBackup('{}'));
});
