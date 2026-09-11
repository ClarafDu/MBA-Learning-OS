export const storageKey = 'mba-learning-progress';
export function emptyProgress() { return { version: 2, reviews: {}, notes: {} }; }
export function parseProgress(input) {
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('不是有效的备份文件');
  const result = emptyProgress();
  if (input.version === 2) {
    if (!input.reviews || !input.notes || Array.isArray(input.reviews) || Array.isArray(input.notes) || typeof input.reviews !== 'object' || typeof input.notes !== 'object') throw new Error('备份格式不完整');
    for (const [id, status] of Object.entries(input.reviews)) {
      if (!['understood', 'later'].includes(status) || id.length > 300 || ['__proto__','constructor','prototype'].includes(id)) throw new Error('复习状态无效');
      result.reviews[id] = status;
    }
    for (const [id, value] of Object.entries(input.notes)) {
      if (typeof value !== 'string' || value.length > 100000 || ['__proto__','constructor','prototype'].includes(id)) throw new Error('笔记格式无效');
      result.notes[id] = value;
    }
    return result;
  }
  // Only the three economics cards have reliable sources in V1.
  if (Object.keys(input).some(k => !/^recall-[1-4]$/.test(k))) throw new Error('无法识别备份版本');
  for (const [key, status] of Object.entries(input)) {
    if (!['understood','later'].includes(status)) throw new Error('复习状态无效');
    if (key !== 'recall-4') result.reviews['managerial-economics/lecture-01/q' + key.slice(7)] = status;
  }
  return result;
}
export function pendingCount(cards, progress) {
  return cards.filter(card => progress.reviews[card.id] !== 'understood').length;
}
