import { useState } from 'react';
import { formatEventTime } from '../utils/calendar';

// Side sheet listing everything planned for the selected day.
// Events you created get Edit and Delete buttons.
function DayAgenda({ day, events, userId, onCreate, onEdit, onDelete }) {
  // Id of the event whose "Delete?" question is showing, if any.
  const [confirmingId, setConfirmingId] = useState(null);

  return (
    <aside className="agenda" aria-live="polite">
      <header className="agenda-header">
        <p className="agenda-weekday">{day.format('dddd')}</p>
        <h2 className="agenda-date">{day.format('D MMMM')}</h2>
      </header>

      {events.length === 0 ? (
        <div className="agenda-empty">
          <p>Nothing planned for this day.</p>
          <button className="button button-outline" onClick={onCreate}>Add an event</button>
        </div>
      ) : (
        // The key replays the list animation when another day is selected.
        <ul key={day.valueOf()} className="agenda-list">
          {events.map((event, index) => {
            const mine = event.createdBy.userId === userId;
            return (
              <li
                key={event.eventId}
                className={`agenda-item ${mine ? 'is-mine' : 'is-invited'}`}
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <p className="agenda-time">{formatEventTime(event)}</p>
                <h3 className="agenda-title">{event.title}</h3>
                {event.description && <p className="agenda-description">{event.description}</p>}
                <p className="agenda-meta">
                  {mine ? 'Created by you' : `Invited by ${event.createdBy.firstName}`}
                </p>
                {event.participants.length > 0 && (
                  <p className="agenda-meta">With {event.participants.join(', ')}</p>
                )}

                {mine && confirmingId !== event.eventId && (
                  <div className="agenda-actions">
                    <button className="button button-small button-on-dark" onClick={() => onEdit(event)}>
                      Edit
                    </button>
                    <button
                      className="button button-small button-on-dark"
                      onClick={() => setConfirmingId(event.eventId)}
                    >
                      Delete
                    </button>
                  </div>
                )}

                {mine && confirmingId === event.eventId && (
                  <div className="agenda-actions agenda-confirm">
                    <p>
                      {event.participants.length
                        ? 'Delete this event for everyone invited?'
                        : 'Delete this event?'}
                    </p>
                    <button className="button button-small button-danger" onClick={() => onDelete(event)}>
                      Delete event
                    </button>
                    <button
                      className="button button-small button-on-dark"
                      onClick={() => setConfirmingId(null)}
                    >
                      Keep it
                    </button>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </aside>
  );
}

export default DayAgenda;
