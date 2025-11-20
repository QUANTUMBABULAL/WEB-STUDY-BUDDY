const resolveWindowOrigin = () => {
	if (typeof window !== 'undefined' && window.location?.origin) {
		return window.location.origin;
	}
	return 'http://localhost:5173';
};

const fallbackApi = import.meta.env.DEV ? 'http://localhost:5000' : resolveWindowOrigin();
export const API_BASE = (import.meta.env.VITE_API_URL || fallbackApi).replace(/\/$/, '');
export const SOCKET_URL = (import.meta.env.VITE_SOCKET_URL || API_BASE).replace(/\/$/, '');
