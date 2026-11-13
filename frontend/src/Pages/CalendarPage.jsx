import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import Header from '../Components/Header';
import MonthGrid from '../Components/MonthGrid';
import DayAgenda from '../Components/DayAgenda';
import EventDialog from '../Components/EventDialog';
import { useToast } from '../Components/Toast';
import { apiRequest } from '../utils/api';
import { clearSession, getUser } from '../utils/auth';
import { connectSocket, socket } from '../utils/socket';
import { dayKey, getMonthDays, groupEventsByDay } from '../utils/calendar';
import {
  askNotificationPermission,
  getNotificationPermission,
  showNotification,
} from '../utils/notifications';
import '../styles/calendar.css';

function CalendarPage() {
  const [user] = useState(getUser);
  const [events, setEvents] = useState([]);
  const [month, setMonth] = useState(() => dayjs().startOf('month'));
  const [direction, setDirection] = useState('none'); // which way the grid slides
  const [selectedDay, setSelectedDay] = useState(() => dayjs());
  // The event dialog: `event` is the one being edited, or null for a new event.
  const [dialog, setDialog] = useState({ open: false, event: null });
  const [permission, setPermission] = useState(getNotificationPermission);
  const navigate = useNavigate();
  const showToast = useToast();

  // Add an event, or replace it if it is already in the list.
  // Safe to call twice for the same event (API response + socket message).
  const saveEvent = useCallback((event) => {
    setEvents((current) =>
      current.some((item) => item.eventId === event.eventId)
        ? current.map((item) => (item.eventId === event.eventId ? event : item))
        : [...current, event]
    );
  }, []);

  const removeEvent = useCallback((eventId) => {
    setEvents((current) => current.filter((item) => item.eventId !== eventId));
  }, []);

  // Load the events, then listen for live updates.
  useEffect(() => {
    apiRequest('/event')
      .then(setEvents)
      .catch((error) => showToast(error.message, 'error'));

    // Someone invited me: add the event, show a toast and a browser notification.
    const handleInvitation = (event) => {
      saveEvent(event);
      const when = dayjs(event.startDateTime).format('ddd D MMM, HH:mm');
      showToast(`${event.createdBy.firstName} invited you to ${event.title} on ${when}`, 'invite');
      showNotification(`${event.createdBy.firstName} invited you to ${event.title}`, when);
    };

    // An event changed. Say so only when someone else changed it.
    const handleUpdated = (event) => {
      saveEvent(event);
      if (event.createdBy.userId !== user.userId) {
        showToast(`${event.createdBy.firstName} updated ${event.title}`, 'invite');
      }
    };

    // An event was deleted, or I was removed from it.
    const handleDeleted = ({ eventId, message }) => {
      removeEvent(eventId);
      if (message) showToast(message, 'invite');
    };

    connectSocket();
    socket.on('new_event', saveEvent);
    socket.on('event_invitation', handleInvitation);
    socket.on('event_updated', handleUpdated);
    socket.on('event_deleted', handleDeleted);

    return () => {
      socket.off('new_event', saveEvent);
      socket.off('event_invitation', handleInvitation);
      socket.off('event_updated', handleUpdated);
      socket.off('event_deleted', handleDeleted);
      socket.disconnect();
    };
  }, [saveEvent, removeEvent, showToast, user.userId]);

  // Recomputed only when the month or the events change.
  const days = useMemo(() => getMonthDays(month), [month]);
  const eventsByDay = useMemo(() => groupEventsByDay(events, days), [events, days]);
  // The selected day can be outside the month on screen, so it is looked up on its own.
  const selectedDayEvents = useMemo(
    () => groupEventsByDay(events, [selectedDay]).get(dayKey(selectedDay)) || [],
    [events, selectedDay]
  );

  const changeMonth = (step) => {
    setDirection(step > 0 ? 'next' : 'prev');
    setMonth(month.add(step, 'month'));
  };

  const goToToday = () => {
    const today = dayjs();
    if (!today.isSame(month, 'month')) {
      setDirection(today.isAfter(month) ? 'next' : 'prev');
      setMonth(today.startOf('month'));
    }
    setSelectedDay(today);
  };

  const handleSelectDay = (day) => {
    setSelectedDay(day);
    // Clicking a greyed-out day jumps to its month.
    if (!day.isSame(month, 'month')) {
      setDirection(day.isAfter(month) ? 'next' : 'prev');
      setMonth(day.startOf('month'));
    }
  };

  const openDialog = (event = null) => setDialog({ open: true, event });
  const closeDialog = () => setDialog((current) => ({ ...current, open: false }));

  // The dialog created or edited an event.
  const handleSaved = (event, wasEdit) => {
    saveEvent(event);
    closeDialog();
    showToast(wasEdit ? 'Changes saved' : 'Event created', 'success');
    handleSelectDay(dayjs(event.startDateTime));
  };

  const handleDelete = async (event) => {
    try {
      await apiRequest(`/event/${event.eventId}`, 'DELETE');
      removeEvent(event.eventId);
      showToast('Event deleted', 'success');
    } catch (error) {
      showToast(error.message, 'error');
    }
  };

  const handleEnableNotifications = async () => {
    const answer = await askNotificationPermission();
    setPermission(answer);
    if (answer === 'granted') {
      showNotification('Notifications are on', 'You will be told when someone invites you.');
    }
  };

  const handleLogout = () => {
    clearSession();
    navigate('/', { replace: true });
  };

  return (
    <div className="app">
      <Header
        user={user}
        onLogout={handleLogout}
        onEnableNotifications={permission === 'default' ? handleEnableNotifications : null}
      />

      <main className="planner">
        <div className="planner-bar">
          <h1 className="month-title">
            {/* The key replays the roll animation when the month changes. */}
            <span key={month.format('YYYY-MM')} className={`month-name roll-${direction}`}>
              {month.format('MMMM')}
            </span>
            <span className="month-year">{month.format('YYYY')}</span>
          </h1>

          <div className="planner-controls">
            <div className="month-nav">
              <button className="button button-icon" aria-label="Previous month" onClick={() => changeMonth(-1)}>
                ‹
              </button>
              <button className="button button-quiet" onClick={goToToday}>Today</button>
              <button className="button button-icon" aria-label="Next month" onClick={() => changeMonth(1)}>
                ›
              </button>
            </div>
            <button className="button button-primary" onClick={() => openDialog()}>
              New event
            </button>
          </div>
        </div>

        <div className="planner-body">
          <MonthGrid
            month={month}
            days={days}
            direction={direction}
            selectedDay={selectedDay}
            eventsByDay={eventsByDay}
            userId={user.userId}
            onSelectDay={handleSelectDay}
          />
          <DayAgenda
            day={selectedDay}
            events={selectedDayEvents}
            userId={user.userId}
            onCreate={() => openDialog()}
            onEdit={openDialog}
            onDelete={handleDelete}
          />
        </div>
      </main>

      <EventDialog
        open={dialog.open}
        day={selectedDay}
        event={dialog.event}
        onClose={closeDialog}
        onSaved={handleSaved}
      />
    </div>
  );
}

export default CalendarPage;
