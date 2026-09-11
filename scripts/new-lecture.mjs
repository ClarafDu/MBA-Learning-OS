import { copyFile, mkdir, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

const [course, lectureNumber, type = 'quantitative'] = process.argv.slice(2);
const supported = new Set(['quantitative', 'case', 'hybrid']);

if (!course || !lectureNumber || !supported.has(type)) {
  console.error('Usage: npm run new:lecture -- <course-slug> <number> [quantitative|case|hybrid]');
  process.exit(1);
}

const padded = String(Number(lectureNumber)).padStart(2, '0');
const source = join(process.cwd(), 'templates', `lecture-${type}.md`);
const directory = join(process.cwd(), 'content', 'private', course);
const target = join(directory, `lecture-${padded}.md`);

await mkdir(directory, { recursive: true });
await copyFile(source, target);
const body = (await readFile(target, 'utf8'))
  .replace('course: ""', `course: "${course}"`)
  .replace('lecture: 1', `lecture: ${Number(lectureNumber)}`)
  .replace('visibility: public', 'visibility: private');
await writeFile(target, body);
console.log(`Created ${target}`);
