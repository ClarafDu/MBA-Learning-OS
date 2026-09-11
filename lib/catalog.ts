import catalog from '@/content/public/catalog.json';

export type Course = (typeof catalog.courses)[number];
export type Lecture = (typeof catalog.lectures)[number];
export type Concept = (typeof catalog.concepts)[number];

export { catalog };

export function getCourse(slug: string) {
  return catalog.courses.find((course) => course.slug === slug);
}

export function getLecture(course: string, slug: string) {
  return catalog.lectures.find((lecture) => lecture.course === course && lecture.slug === slug);
}

export function getConcept(slug: string) {
  return catalog.concepts.find((concept) => concept.slug === slug);
}
