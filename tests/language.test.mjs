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

test('English navigation and public schedule details do not retain Chinese UI copy',()=>{
 for(const [zh,en] of [
  ['辅助工具','Tools'],['今日首页','Today'],['随时记录','Quick notes'],['我的笔记','My notes'],['账号与备份','Account & backup'],['Google 翻译','Google Translate'],['＋ 随时记录','＋ Quick notes'],
  ['政立院区 A419 教室','Zhengli Campus · Room A419'],['注意时效','Please observe the deadline'],['00IMBA_Deadlines.xlsx 第 7 行','Deadline spreadsheet · row 7'],['周菲','Zhou Fei'],['下节课上课的时候交给助教；Finish the following exercises in the textbook. 2.2, 2.11','Hand it to the teaching assistant at the next class; Finish the following exercises in the textbook. 2.2, 2.11']
 ]) assert.equal(translate(zh,'en'),en);
});
