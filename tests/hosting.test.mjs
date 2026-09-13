import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {readHostingConfig} from '../scripts/read-hosting-config.mjs';
test('missing optional local hosting file is a safe empty configuration',()=>{
 assert.deepEqual(readHostingConfig(new URL('./fixtures/not-provided-hosting.json',import.meta.url)),{});
});
test('Vite config has no hard JSON module import',async()=>{
 const text=await readFile(new URL('../vite.config.ts',import.meta.url),'utf8');
 assert.ok(!/import\s+\w+\s+from\s+['"]\.\/.openai\/hosting.json/.test(text));
 assert.ok(text.includes('readHostingConfig(hostingPath)'));
});
