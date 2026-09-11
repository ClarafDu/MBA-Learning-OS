import test from 'node:test';
import assert from 'node:assert/strict';
import {translate,readLanguage,languageStorageKey} from '../lib/language.mjs';
test('interface copy switches in both directions',()=>{
 assert.equal(translate('复习队列','en'),'Review queue');
 assert.equal(translate('Before class','zh'),'课前预习');
 assert.equal(translate('保存笔记','en'),'Save notes');
 assert.equal(translate(' 题已理解','en'),' questions understood');
 assert.equal(translate('1 / 3 题已理解','en'),'1 / 3 questions understood');
 assert.equal(translate('9 个结果','en'),'9 results');
});
test('course titles, formulas and unknown content are unchanged',()=>{
 for(const value of ['Managerial Economics','MR = MC','我的自定义笔记']) assert.equal(translate(value,'en'),value);
});
test('language preference defaults safely and uses a separate storage key',()=>{
 assert.equal(readLanguage(null),'zh');assert.equal(readLanguage('fr'),'zh');assert.equal(readLanguage('en'),'en');
 assert.notEqual(languageStorageKey,'mba-learning-progress');
});
