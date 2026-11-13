import { io } from 'socket.io-client';
import { API_URL } from './api';
import { getToken } from './auth';

// One socket for the whole app. It connects only after login.
export const socket = io(API_URL, { autoConnect: false });

export function connectSocket() {
  socket.auth = { token: getToken() };
  socket.connect();
}
