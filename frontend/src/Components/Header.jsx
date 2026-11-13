// `onEnableNotifications` is only passed while the user has not yet answered
// the browser's notification prompt, so the button disappears afterwards.
function Header({ user, onLogout, onEnableNotifications }) {
  return (
    <header className="app-header">
      <p className="brand">
        <span className="brand-mark" aria-hidden="true" />
        Event Scheduler
      </p>
      <div className="app-header-user">
        {onEnableNotifications && (
          <button className="button button-outline button-small" onClick={onEnableNotifications}>
            Turn on notifications
          </button>
        )}
        <span className="avatar" aria-hidden="true">{user.firstName[0].toUpperCase()}</span>
        <span className="user-name" title={user.email}>{user.firstName}</span>
        <button className="button button-quiet" onClick={onLogout}>Log out</button>
      </div>
    </header>
  );
}

export default Header;
