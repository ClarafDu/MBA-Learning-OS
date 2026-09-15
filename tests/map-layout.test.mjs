import test from 'node:test';
import assert from 'node:assert/strict';
import { buildMapLayout, clamp } from '../lib/map-layout.mjs';

const courses = [
  { slug: 'economics', code: 'ME', title: 'Managerial Economics' },
  { slug: 'strategy', code: 'SM', title: 'Strategic Management' },
  { slug: 'accounting', code: 'FA', title: 'Financial Accounting' },
];
const concepts = [
  { id: 'cost', courses: ['economics', 'strategy'], related: ['margin'] },
  { id: 'margin', courses: ['economics', 'accounting'], related: ['cost'] },
];

test('map layout keeps one active course in the center and exposes its concepts', () => {
  const graph = buildMapLayout(courses, concepts, 'economics');
  const active = graph.courseNodes.find((node) => node.active);
  assert.equal(active.slug, 'economics');
  assert.equal(active.x, graph.center.x);
  assert.equal(active.y, graph.center.y);
  assert.deepEqual(graph.conceptNodes.map((node) => node.id).sort(), ['cost', 'margin']);
  assert.ok(graph.courseNodes.every((node) => node.x >= 0 && node.x <= graph.width && node.y >= 0 && node.y <= graph.height));
});

test('map layout creates course, related and cross-course navigation edges', () => {
  const graph = buildMapLayout(courses, concepts, 'economics');
  assert.equal(graph.edges.filter((edge) => edge.kind === 'owns').length, 2);
  assert.equal(graph.edges.filter((edge) => edge.kind === 'related').length, 1);
  assert.equal(graph.edges.filter((edge) => edge.kind === 'cross').length, 2);
});

test('map zoom clamp respects supported limits', () => {
  assert.equal(clamp(0.2, 0.65, 1.8), 0.65);
  assert.equal(clamp(1.2, 0.65, 1.8), 1.2);
  assert.equal(clamp(4, 0.65, 1.8), 1.8);
});
