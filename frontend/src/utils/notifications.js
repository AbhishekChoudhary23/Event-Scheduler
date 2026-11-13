// Browser notifications: the small system pop-ups shown outside the page.
// They work while the app is open in a tab, even when that tab is in the background.

const supported = 'Notification' in window;

// 'granted', 'denied', or 'default' (the user has not been asked yet).
export const getNotificationPermission = () => (supported ? Notification.permission : 'denied');

// Shows the browser's "Allow notifications?" prompt. Must be called from a click.
export const askNotificationPermission = () =>
  supported ? Notification.requestPermission() : Promise.resolve('denied');

export function showNotification(title, body) {
  if (getNotificationPermission() !== 'granted') return;

  const notification = new Notification(title, { body, icon: '/favicon.svg' });
  // Clicking the notification brings the calendar tab to the front.
  notification.onclick = () => {
    window.focus();
    notification.close();
  };
}
