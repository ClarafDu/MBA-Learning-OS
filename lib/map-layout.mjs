export function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

export function buildMapLayout(courses, concepts, activeCourse, width = 920, height = 640) {
  const center = { x: width / 2, y: height / 2 };
  const otherCourses = courses.filter((course) => course.slug !== activeCourse);
  const courseNodes = [
    { ...courses.find((course) => course.slug === activeCourse), ...center, active: true },
    ...otherCourses.map((course, index) => {
      const angle = -Math.PI / 2 + (index * Math.PI * 2) / Math.max(otherCourses.length, 1);
      return {
        ...course,
        x: center.x + Math.cos(angle) * Math.min(330, width * 0.36),
        y: center.y + Math.sin(angle) * Math.min(245, height * 0.38),
        active: false,
      };
    }),
  ].filter((node) => node.slug);

  const visibleConcepts = concepts.filter((concept) => concept.courses.includes(activeCourse));
  const conceptNodes = visibleConcepts.map((concept, index) => {
    const angle = -Math.PI / 2 + (index * Math.PI * 2) / Math.max(visibleConcepts.length, 1);
    return {
      ...concept,
      x: center.x + Math.cos(angle) * 145,
      y: center.y + Math.sin(angle) * 145,
    };
  });

  const nodeById = new Map(conceptNodes.map((node) => [node.id, node]));
  const courseBySlug = new Map(courseNodes.map((node) => [node.slug, node]));
  const edges = [];
  for (const concept of conceptNodes) {
    edges.push({ id: `owns-${concept.id}`, kind: 'owns', from: center, to: concept });
    for (const related of concept.related) {
      const target = nodeById.get(related);
      if (target && concept.id < target.id) edges.push({ id: `rel-${concept.id}-${related}`, kind: 'related', from: concept, to: target });
    }
    for (const course of concept.courses) {
      if (course === activeCourse) continue;
      const target = courseBySlug.get(course);
      if (target) edges.push({ id: `cross-${concept.id}-${course}`, kind: 'cross', from: concept, to: target });
    }
  }
  return { width, height, center, courseNodes, conceptNodes, edges };
}
