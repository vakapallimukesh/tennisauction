import { io } from 'socket.io-client';

let socket = null;

export function getSocket() {
  if (!socket) {
    const host = typeof window !== 'undefined' ? window.location.hostname : 'localhost';
    const protocol = typeof window !== 'undefined' ? window.location.protocol : 'http:';
    const backendUrl = import.meta.env.VITE_BACKEND_URL || (
      typeof window !== 'undefined' && window.location.port === '5173'
        ? `${protocol}//${host}:5001`
        : window.location.origin
    );

    socket = io(backendUrl, {
      auth: (cb) => {
        const token = typeof localStorage !== 'undefined' ? localStorage.getItem('tennis_admin_token') : null;
        cb({ token });
      },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      timeout: 10000
    });

    socket.on('connect', () => {
      console.log('⚡ Socket.IO Connected successfully. Socket ID:', socket.id);
    });

    socket.on('disconnect', (reason) => {
      console.warn('⚠️ Socket.IO Disconnected:', reason);
    });

    socket.on('connect_error', (err) => {
      console.warn('⚠️ Socket.IO Connection Error:', err.message);
    });
  } else {
    // Ensure auth token is up to date
    const token = typeof localStorage !== 'undefined' ? localStorage.getItem('tennis_admin_token') : null;
    if (token && socket.auth?.token !== token) {
      socket.auth = { token };
    }
  }

  return socket;
}

export function updateSocketAuth(token) {
  const sock = getSocket();
  if (sock) {
    sock.auth = { token };
    if (!sock.connected) {
      sock.connect();
    }
  }
}

export default getSocket;
