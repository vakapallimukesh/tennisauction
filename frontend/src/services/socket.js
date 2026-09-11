import { io } from 'socket.io-client';

let socket = null;

export function getSocket() {
  if (!socket) {
    // If running in development with Vite proxy, connecting to '/' auto-proxies '/socket.io'
    const backendUrl = import.meta.env.VITE_BACKEND_URL || (
      typeof window !== 'undefined' && window.location.port === '5173'
        ? 'http://localhost:5001'
        : window.location.origin
    );

    socket = io(backendUrl, {
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
  }

  return socket;
}

export default getSocket;
