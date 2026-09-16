import notes from '@/content/public/lecture-notes.json';
export {notes};
export type Lesson=(typeof notes)[number];
export const lessonSearchItems=notes.flatMap(lesson=>lesson.topics.map(topic=>({
 title:topic.titleZh+' · '+topic.titleEn,
 detail:lesson.date+' · '+lesson.titleZh,
 href:'/map?course='+lesson.course+'&lesson='+lesson.id+'&topic='+topic.id,
 text:[lesson.titleEn,...topic.pointsZh,...topic.pointsEn,topic.caseZh,topic.caseEn].join(' '),
 course:lesson.course,lesson:lesson.id,topic:topic.id,
})));
