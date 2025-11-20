import { io } from 'socket.io-client';
import { SOCKET_URL } from './config/api';

const socket = io(SOCKET_URL, {
	transports: ['websocket'],
	withCredentials: true,
	autoConnect: true,
	reconnectionAttempts: 5,
});

export default socket;
