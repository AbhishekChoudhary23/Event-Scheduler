import dayjs from 'dayjs';
import { WEEKDAYS, dayKey } from '../utils/calendar';

const MAX_CHIPS = 2;

// The month as a 7-column grid. Each day is a button that selects that day.
function MonthGrid({ month, days, direction, selectedDay, eventsByDay, userId, onSelectDay }) {
  const today = dayjs();

  return (
    <div className="month">
      <div className="weekdays" aria-hidden="true">
        {WEEKDAYS.map((weekday) => <span key={weekday}>{weekday}</span>)}
      </div>

      {/* The key restarts the slide animation every time the month changes. */}
      <div key={month.format('YYYY-MM')} className={`month-grid slide-${direction}`}>
        {days.map((day) => {
          const events = eventsByDay.get(dayKey(day)) || [];
          const className =
            'day' +
            (day.isSame(month, 'month') ? '' : ' is-outside') +
            (day.isSame(today, 'day') ? ' is-today' : '') +
            (day.isSame(selectedDay, 'day') ? ' is-selected' : '');

          return (
            <button
              key={dayKey(day)}
              className={className}
              aria-pressed={day.isSame(selectedDay, 'day')}
              aria-label={`${day.format('dddd D MMMM')}, ${events.length} events`}
              onClick={() => onSelectDay(day)}
            >
              <span className="day-number">{day.date()}</span>
              <span className="day-events">
                {events.slice(0, MAX_CHIPS).map((event) => (
                  <span
                    key={event.eventId}
                    className={`chip ${event.createdBy.userId === userId ? 'chip-mine' : 'chip-invited'}`}
                  >
                    {event.title}
                  </span>
                ))}
                {events.length > MAX_CHIPS && (
                  <span className="chip-more">+{events.length - MAX_CHIPS} more</span>
                )}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default MonthGrid;
