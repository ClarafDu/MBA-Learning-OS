import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { test } from 'node:test';

test('deadline sync preserves explicit times in Excel date serials', () => {
  const code = `
import importlib.util
spec = importlib.util.spec_from_file_location('sync_deadlines', 'scripts/sync-deadlines.py')
module = importlib.util.module_from_spec(spec)
spec.loader.exec_module(module)
date, confirmed = module.deadline_datetime('46291.7083333333')
print(date.isoformat(), confirmed)
`;
  const result = execFileSync('python3', ['-c', code], { encoding: 'utf8' }).trim();
  assert.equal(result, '2026-09-26T17:00:00 True');
});

test('deadline sync reads explicit notice times and preserves date-only tasks as unconfirmed', () => {
 const code = `
import importlib.util
spec = importlib.util.spec_from_file_location('sync_deadlines', 'scripts/sync-deadlines.py')
module = importlib.util.module_from_spec(spec)
spec.loader.exec_module(module)
for value, details in [('46312', 'ddl:10/17 17:00'), ('46319', 'Submission deadline: 11pm Saturday Oct. 24.'), ('46317', '')]:
    date, confirmed = module.confirm_due_time(*module.deadline_datetime(value), details)
    print(date.isoformat(), confirmed)
`;
 const result=execFileSync('python3',['-c',code],{encoding:'utf8'}).trim();
 assert.equal(result,'2026-10-17T17:00:00 True\n2026-10-24T23:00:00 True\n2026-10-22T23:59:00 False');
});

test('sheet import retains the accounting task identity and supplemental DMD deadline', () => {
 const code = `
import importlib.util
spec = importlib.util.spec_from_file_location('sync_deadlines', 'scripts/sync-deadlines.py')
module = importlib.util.module_from_spec(spec)
spec.loader.exec_module(module)
module.workbook_rows = lambda _: [(1,['发布日期','课程','事项','截止日期','','','']), (25,['46310','02Accounting','个人作业','46319','','','Submission deadline: 11pm Saturday Oct. 24.'])]
events, skipped = module.build_deadlines()
accounting = next(e for e in events if e['course']=='financial-accounting')
assert accounting['id']=='financial-accounting-homework-3-2026-10-17-2300'
assert accounting['start']=='2026-10-24T23:00:00+08:00'
assert any(e['id']=='data-models-decisions-homework-3-2026-10-22' for e in events)
assert not skipped
print('ok')
`;
 assert.equal(execFileSync('python3',['-c',code],{encoding:'utf8'}).trim(),'ok');
});
