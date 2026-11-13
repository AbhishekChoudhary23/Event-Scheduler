import dayjs from 'dayjs';
import { WEEKDAYS, getMonthDays } from '../utils/calendar';
import '../styles/auth.css';

// Shared frame for the login and signup pages:
// this month's planner on one side, the form on the other.
function AuthLayout({ title, children, footer }) {
  const today = dayjs();

  return (
    <main className="auth">
      <section className="auth-planner" aria-hidden="true">
        <p className="auth-brand">Event Scheduler</p>
        <p className="auth-headline">Plans everyone can see the moment you save them.</p>

        <div className="mini-month">
          <p className="mini-month-name">{today.format('MMMM YYYY')}</p>
          <div className="mini-month-grid">
            {WEEKDAYS.map((weekday) => (
              <span key={weekday} className="mini-weekday">{weekday[0]}</span>
            ))}
            {getMonthDays(today).map((day) => (
              <span
                key={day.valueOf()}
                className={
                  'mini-day' +
                  (day.isSame(today, 'day') ? ' is-today' : '') +
                  (day.isSame(today, 'month') ? '' : ' is-outside')
                }
              >
                {day.date()}
              </span>
            ))}
          </div>
        </div>
      </section>

      <section className="auth-form-side">
        <div className="auth-form-box">
          <h1 className="auth-title">{title}</h1>
          {children}
          <p className="auth-footer">{footer}</p>
        </div>
      </section>
    </main>
  );
}

export default AuthLayout;
