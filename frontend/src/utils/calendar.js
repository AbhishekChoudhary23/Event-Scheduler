import dayjs from 'dayjs';

export const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export const dayKey = (day) => day.format('YYYY-MM-DD');

// The 42 days (6 weeks) shown for a month, starting on the Sunday before the 1st.
export function getMonthDays(month) {
  const first = month.startOf('month').startOf('week');
  return Array.from({ length: 42 }, (_, index) => first.add(index, 'day'));
}

// Map of "YYYY-MM-DD" -> events on that day, for the given days.
// An event that spans several days appears on each of them.
export function groupEventsByDay(events, days) {
  const firstDay = days[0].startOf('day');
  const lastDay = days[days.length - 1].endOf('day');
  const byDay = new Map();

  for (const event of events) {
    const start = dayjs(event.startDateTime);
    // An event ending exactly at midnight does not count for the next day.
    const realEnd = dayjs(event.endDateTime);
    const end = realEnd.isAfter(start) ? realEnd.subtract(1, 'millisecond') : realEnd;
    if (end.isBefore(firstDay) || start.isAfter(lastDay)) continue;

    let day = (start.isBefore(firstDay) ? firstDay : start).startOf('day');
    const stop = end.isAfter(lastDay) ? lastDay : end;
    while (!day.isAfter(stop)) {
      const key = dayKey(day);
      if (!byDay.has(key)) byDay.set(key, []);
      byDay.get(key).push(event);
      day = day.add(1, 'day');
    }
  }

  for (const list of byDay.values()) {
    list.sort((a, b) => dayjs(a.startDateTime).diff(dayjs(b.startDateTime)));
  }
  return byDay;
}

// "10:00 – 11:30" for a same-day event, "13 Nov 10:00 – 15 Nov 12:00" otherwise.
export function formatEventTime(event) {
  const start = dayjs(event.startDateTime);
  const end = dayjs(event.endDateTime);
  if (start.isSame(end, 'day')) {
    return `${start.format('HH:mm')} – ${end.format('HH:mm')}`;
  }
  return `${start.format('D MMM HH:mm')} – ${end.format('D MMM HH:mm')}`;
}
