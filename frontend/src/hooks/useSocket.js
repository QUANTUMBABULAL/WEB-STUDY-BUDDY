import { useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import { getToken } from '../utils/authHelpers';
import { SOCKET_URL } from '../config/api';
import { logError } from '../utils/logger';

export default function useSocket(onMessage, onConnect) {
  const socketRef = useRef(null);
  const handlersRef = useRef({ onMessage, onConnect });

  useEffect(() => {
    handlersRef.current = { onMessage, onConnect };
  }, [onMessage, onConnect]);

  useEffect(() => {
    const token = getToken();
    const socket = io(SOCKET_URL, {
      auth: { token },
      transports: ['websocket'],
      withCredentials: true,
      autoConnect: true,
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      handlersRef.current.onConnect?.(socket);
    });

    socket.on('message', (msg) => {
      handlersRef.current.onMessage?.(msg);
    });

    socket.on('errorMessage', (err) => {
      logError('socket errorMessage', err);
    });

    return () => {
      socket.off('connect');
      socket.off('message');
      socket.off('errorMessage');
      socket.disconnect();
      socketRef.current = null;
    };
  }, []);

  const sendMessage = (text) => {
    const payload = text?.trim();
    if (!socketRef.current || !payload) return;
    socketRef.current.emit('sendMessage', { text: payload });
  };

  return { sendMessage };
}
