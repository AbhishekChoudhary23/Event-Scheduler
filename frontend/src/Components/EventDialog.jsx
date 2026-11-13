import { useEffect, useRef, useState } from 'react';
import dayjs from 'dayjs';
import { apiRequest } from '../utils/api';

const INPUT_FORMAT = 'YYYY-MM-DDTHH:mm'; // what <input type="datetime-local"> expects

// A new event starts at the next full hour of the chosen day and lasts one hour.
function emptyForm(day) {
  const start = day.hour(dayjs().hour() + 1).minute(0);
  return {
    title: '',
    description: '',
    start: start.format(INPUT_FORMAT),
    end: start.add(1, 'hour').format(INPUT_FORMAT),
    participants: '',
  };
}

// The form filled with an existing event, for editing.
function formFromEvent(event) {
  return {
    title: event.title,
    description: event.description || '',
    start: dayjs(event.startDateTime).format(INPUT_FORMAT),
    end: dayjs(event.endDateTime).format(INPUT_FORMAT),
    participants: event.participants.join(', '),
  };
}

// One dialog for both jobs: pass `event` to edit it, or leave it empty to create a new one.
function EventDialog({ open, day, event, onClose, onSaved }) {
  const dialogRef = useRef(null);
  const [form, setForm] = useState(() => emptyForm(day));
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const editing = Boolean(event);

  // Open or close the native <dialog>, starting from a fresh form each time.
  useEffect(() => {
    const dialog = dialogRef.current;
    if (open && !dialog.open) {
      setForm(event ? formFromEvent(event) : emptyForm(day));
      setError('');
      dialog.showModal();
    } else if (!open && dialog.open) {
      dialog.close();
    }
  }, [open, day, event]);

  const handleChange = (e) => {
    const next = { ...form, [e.target.name]: e.target.value };
    // Keep the end after the start.
    if (e.target.name === 'start' && next.end < next.start) {
      next.end = dayjs(next.start).add(1, 'hour').format(INPUT_FORMAT);
    }
    setForm(next);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.end < form.start) {
      setError('The event ends before it starts. Pick a later end time.');
      return;
    }

    const body = {
      title: form.title,
      description: form.description,
      startDateTime: dayjs(form.start).toISOString(),
      endDateTime: dayjs(form.end).toISOString(),
      participants: form.participants.split(/[\s,;]+/).filter(Boolean),
    };

    setSaving(true);
    setError('');
    try {
      const saved = editing
        ? await apiRequest(`/event/${event.eventId}`, 'PUT', body)
        : await apiRequest('/event/create', 'POST', body);
      onSaved(saved, editing);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const submitLabel = editing
    ? (saving ? 'Saving…' : 'Save changes')
    : (saving ? 'Creating…' : 'Create event');

  return (
    <dialog ref={dialogRef} className="dialog" onClose={onClose} aria-labelledby="event-dialog-title">
      <form className="form" onSubmit={handleSubmit}>
        <h2 id="event-dialog-title" className="dialog-title">{editing ? 'Edit event' : 'New event'}</h2>

        <label className="field">
          <span>Title</span>
          <input name="title" required maxLength={255} autoFocus value={form.title} onChange={handleChange} />
        </label>

        <div className="field-row">
          <label className="field">
            <span>Starts</span>
            <input name="start" type="datetime-local" required value={form.start} onChange={handleChange} />
          </label>
          <label className="field">
            <span>Ends</span>
            <input name="end" type="datetime-local" required min={form.start} value={form.end} onChange={handleChange} />
          </label>
        </div>

        <label className="field">
          <span>Description</span>
          <textarea name="description" rows={3} value={form.description} onChange={handleChange} />
        </label>

        <label className="field">
          <span>Invite people</span>
          <input
            name="participants"
            placeholder="asha@example.com, ravi@example.com"
            value={form.participants}
            onChange={handleChange}
          />
          <small>
            {editing
              ? 'Remove an email to take that person off the event'
              : 'Emails of people who already have an account, separated by commas'}
          </small>
        </label>

        {error && <p className="form-error" role="alert">{error}</p>}

        <div className="dialog-actions">
          <button type="button" className="button button-quiet" onClick={onClose}>Cancel</button>
          <button className="button button-primary" disabled={saving}>{submitLabel}</button>
        </div>
      </form>
    </dialog>
  );
}

export default EventDialog;
