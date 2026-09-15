const shanghaiOffset = '+08:00';

function parseDate(date) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) throw Error('课表日期格式无效 / Invalid schedule date');
  const value = Date.parse(`${date}T00:00:00Z`);
  if (!Number.isFinite(value)) throw Error('课表日期格式无效 / Invalid schedule date');
  return value;
}

export function expandWeeklySchedule(series) {
  const events = [];
  for (const item of series) {
    const start = parseDate(item.startDate);
    const end = parseDate(item.endDate);
    if (end < start || (end - start) % (7 * 86400000) !== 0) throw Error(`课表区间无效 / Invalid weekly range: ${item.id}`);
    for (let day = start; day <= end; day += 7 * 86400000) {
      const date = new Date(day).toISOString().slice(0, 10);
      const isLast = day === end;
      events.push({
        id: `${item.id}-${date}`,
        title: item.title,
        titleEn: item.titleEn,
        course: item.course,
        kind: 'class',
        start: `${date}T${item.startTime}:00${shanghaiOffset}`,
        end: `${date}T${item.endTime}:00${shanghaiOffset}`,
        created: `${date}T${item.startTime}:00${shanghaiOffset}`,
        visibility: 'public',
        audience: item.audience || 'core',
        description: '',
        location: isLast && item.lastLocation ? item.lastLocation : item.location,
        link: '',
        materialLink: '',
        reminder: 30,
        done: false
      });
    }
  }
  return events.sort((a, b) => a.start.localeCompare(b.start));
}
