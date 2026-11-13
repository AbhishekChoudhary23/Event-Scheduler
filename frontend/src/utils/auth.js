// The login session lives in localStorage: the token and the logged-in user.

export const getToken = () => localStorage.getItem('token');

export const getUser = () => JSON.parse(localStorage.getItem('user') || 'null');

export function saveSession({ token, user }) {
  localStorage.setItem('token', token);
  localStorage.setItem('user', JSON.stringify(user));
}

export function clearSession() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
}
