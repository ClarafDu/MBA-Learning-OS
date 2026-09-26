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
