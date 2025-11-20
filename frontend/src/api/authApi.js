import axios from 'axios';
import { API_BASE } from '../config/api';

export async function login(username, password) {
  const res = await axios.post(`${API_BASE}/api/auth/login`, { username, password });
  return res.data;
}

export async function register(username, password) {
  const res = await axios.post(`${API_BASE}/api/auth/register`, { username, password });
  return res.data;
}
