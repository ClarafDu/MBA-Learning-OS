import test from 'node:test';
import assert from 'node:assert/strict';
import {emptyProgress,parseProgress,pendingCount} from '../lib/progress.mjs';
import {githubBase} from '../scripts/github-base.mjs';
test('V1 economics results migrate without inventing a strategy source',()=>{const value=parseProgress({'recall-1':'understood','recall-4':'later'});assert.equal(value.reviews['managerial-economics/lecture-01/q1'],'understood');assert.equal(Object.keys(value.reviews).length,1);});
test('V2 notes and reviews roundtrip together',()=>{const original={version:2,reviews:{'course/lecture/q1':'later'},notes:{lecture:'## 中文\nExample'}};assert.deepEqual(parseProgress(JSON.parse(JSON.stringify(original))),original);});
test('Reject invalid backups before overwriting valid data',()=>{for(const value of [[],null,{version:3},{foo:'bar'},{version:2,reviews:{a:'wrong'},notes:{}},{version:2,reviews:{},notes:{a:42}}])assert.throws(()=>parseProgress(value));});
test('Pending includes later; understood removes only the scoped question',()=>{const p=emptyProgress();p.reviews={'a/q1':'understood','b/q1':'later'};assert.equal(pendingCount([{id:'a/q1'},{id:'b/q1'},{id:'c/q1'}],p),2);});
test('Pages works for project repositories, user sites and custom domain roots',()=>{assert.equal(githubBase({GITHUB_PAGES:'true',GITHUB_REPOSITORY:'me/mba'}),'/mba');assert.equal(githubBase({GITHUB_PAGES:'true',GITHUB_REPOSITORY:'me/me.github.io'}),'');assert.equal(githubBase({GITHUB_PAGES:'true',GITHUB_REPOSITORY:'me/mba',PAGES_BASE_PATH:''}),'');});
