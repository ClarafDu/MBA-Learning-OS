import {catalog} from './catalog';
import courseMap from '@/content/public/course-map.json';
import {lessonSearchItems} from './lecture-notes';

export type SearchItem={title:string;detail:string;href:string;text:string};
// This module is requested only when search opens, not by the shared page shell.
export const publicSearchItems:SearchItem[]=[
 ...lessonSearchItems,
 ...courseMap.flatMap(outline=>outline.chapters.flatMap(chapter=>chapter.concepts.map(concept=>({title:concept.titleZh+' · '+concept.titleEn,detail:catalog.courses.find(course=>course.slug===outline.course)?.code+' · 课程导图',href:'/map?course='+outline.course+'&concept='+concept.id,text:concept.summaryZh+' '+concept.summaryEn+' '+concept.caseZh+' '+concept.caseEn})))),
 ...catalog.courses.map(c=>({title:c.title,detail:c.code+' · 课程',href:'/courses/'+c.slug,text:c.type})),
 ...catalog.lectures.map(l=>({title:l.title,detail:'Lecture '+l.number+' · 示例',href:'/courses/'+l.course+'/'+l.slug,text:l.summary})),
 ...catalog.concepts.map(c=>({title:c.title,detail:'Concept / Formula',href:'/knowledge/'+c.slug,text:c.english+' '+c.chinese+' '+c.formula})),
];
