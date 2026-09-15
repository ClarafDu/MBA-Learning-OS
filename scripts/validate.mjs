import { readFile, readdir, stat } from 'node:fs/promises';
import { join, relative } from 'node:path';
import {validateEvent} from '../lib/planner.mjs';
import {expandWeeklySchedule} from '../lib/schedule.mjs';

const root = process.cwd();
const catalogPath = join(root, 'content/public/catalog.json');
const errors = [];
const requiredCourseFields = ['slug', 'code', 'title', 'type', 'progress', 'nextClass', 'tone'];
const requiredConceptFields = ['slug', 'title', 'course', 'english', 'chinese', 'managerialMeaning', 'visibility'];

const catalog = JSON.parse(await readFile(catalogPath, 'utf8'));
const knowledge = JSON.parse(await readFile(join(root,'content/public/knowledge.json'),'utf8'));
const scheduleSeries = JSON.parse(await readFile(join(root,'content/public/schedule.json'),'utf8'));
const schedule = expandWeeklySchedule(scheduleSeries);

function requireFields(item, fields, label) {
  for (const field of fields) {
    if (item[field] === undefined || item[field] === '') errors.push(`${label}: missing ${field}`);
  }
}

function findDuplicates(items, field, label) {
  const seen = new Set();
  for (const item of items) {
    if (seen.has(item[field])) errors.push(`${label}: duplicate ${field} "${item[field]}"`);
    seen.add(item[field]);
  }
}

catalog.courses.forEach((course, index) => requireFields(course, requiredCourseFields, `course[${index}]`));
catalog.concepts.forEach((concept, index) => requireFields(concept, requiredConceptFields, `concept[${index}]`));
findDuplicates(catalog.courses, 'slug', 'courses');
findDuplicates(catalog.concepts, 'slug', 'concepts');

findDuplicates(catalog.lectures.flatMap(l => l.recallQuestions), 'id', 'recallQuestions');
for (const question of catalog.lectures.flatMap(l => l.recallQuestions)) requireFields(question, ['id', 'question', 'answer'], 'recallQuestion');

const courseSlugs = new Set(catalog.courses.map((course) => course.slug));
const conceptSlugs = new Set(catalog.concepts.map((concept) => concept.slug));
const nodeIds=new Set(knowledge.map(k=>k.id));
findDuplicates(knowledge,'id','knowledge');
for(const node of knowledge){
 requireFields(node,['id','zh','en','definitionZh','definitionEn','exampleZh','exampleEn','courses','related'],'knowledge:'+node.id);
 for(const slug of node.courses)if(!courseSlugs.has(slug))errors.push('Unknown knowledge course: '+slug);
 for(const id of node.related)if(!nodeIds.has(id))errors.push('Broken concept relationship: '+id);
}
for(const slug of courseSlugs)if(!knowledge.some(k=>k.courses.includes(slug)))errors.push('Missing course map: '+slug);
findDuplicates(schedule,'id','schedule');
for(const item of schedule){try{validateEvent(item);if(item.visibility!=='public'||!courseSlugs.has(item.course))throw Error('Public calendar permissions/course invalid');}catch(e){errors.push(e.message);}}
for (const lecture of catalog.lectures) {
  requireFields(lecture, ['slug', 'course', 'number', 'title', 'status', 'summary', 'concepts', 'recallQuestions'], `lecture:${lecture.slug}`);
  if (!courseSlugs.has(lecture.course)) errors.push(`lecture:${lecture.slug}: unknown course "${lecture.course}"`);
  for (const concept of lecture.concepts) if (!conceptSlugs.has(concept)) errors.push(`lecture:${lecture.slug}: unknown concept "${concept}"`);
}

for (const concept of catalog.concepts) {
  if (concept.visibility !== 'public') errors.push(`concept:${concept.slug}: public catalog contains visibility "${concept.visibility}"`);
}

async function walk(directory) {
  const entries = await readdir(directory, { withFileTypes: true }).catch(() => []);
  const files = [];
  for (const entry of entries) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) files.push(...await walk(path));
    else files.push(path);
  }
  return files;
}

for (const directory of ['app', 'lib', 'public']) {
  for (const file of await walk(join(root, directory))) {
    const body = await readFile(file, 'utf8').catch(() => '');
    if (/content\/(class|private)|restricted-assets/.test(body)) errors.push(`${relative(root, file)} imports or exposes a restricted path`);
  }
}

for (const outputDirectory of ['out', 'dist']) {
  for (const file of await walk(join(root, outputDirectory))) {
    if (/\.(pdf|pptx?|docx?|mp4|mov|mp3)$/i.test(file)) errors.push(`${relative(root, file)}: restricted-looking asset found in public output`);
  }
}

for (const path of ['content/class', 'content/private', 'restricted-assets']) {
  const directory = join(root, path);
  for (const file of await walk(directory)) {
    if (relative(directory, file) !== 'README.md' && (await stat(file)).size > 0) errors.push(`${relative(root, file)}: real restricted content must not ship in this public package`);
  }
}

if (errors.length) {
  console.error(`Validation failed with ${errors.length} error(s):`);
  errors.forEach((error) => console.error(`- ${error}`));
  process.exit(1);
}

console.log(`Validation passed: ${catalog.courses.length} courses, ${knowledge.length} bilingual map concepts, ${schedule.length} public class meetings; public output contains no restricted assets.`);
