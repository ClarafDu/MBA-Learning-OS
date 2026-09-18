// Deadline progress is a private review record; idle keeps it out of flashcard review queues.
export const taskKey = event => 'deadline:' + (event.recordId || event.id);
export function taskState(event, records, owner) {
 const record = records.find(r => r.owner === owner && r.kind === 'review' && r.key === taskKey(event) && r.data.type === 'deadline');
 return {done: record ? record.data.done === true : event.done === true, archived: record?.data.archived === true, record};
}
export function taskStats(tasks) {
 const total = tasks.length, completed = tasks.filter(t => t.done).length;
 return {total, completed, archived: tasks.filter(t => t.archived).length, rate: total ? Math.round(completed / total * 100) : 0};
}
