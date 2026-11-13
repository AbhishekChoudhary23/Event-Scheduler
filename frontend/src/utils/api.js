import { getToken, clearSession } from './auth';

export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

// Calls the backend and returns the `data` part of the response.
// Throws an Error with a readable message when the request fails.
export async function apiRequest(path, method = 'GET', body) {
  const token = getToken();
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers.Authorization = `Bearer ${token}`;

  let response;
  try {
    response = await fetch(API_URL + path, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new Error("Can't reach the server. Check that it is running.");
  }

  const result = await response.json().catch(() => ({}));

  // The saved token expired: log out and go back to the login page.
  if (response.status === 401 && token) {
    clearSession();
    window.location.assign('/');
  }

  if (!response.ok) {
    throw new Error(result.message || 'Request failed');
  }
  return result.data;
}
