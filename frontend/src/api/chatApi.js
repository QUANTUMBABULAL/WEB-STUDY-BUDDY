import axios from 'axios';
import { API_BASE } from '../config/api';

export async function fetchMessages() {
  const res = await axios.get(`${API_BASE}/api/messages`);
  return res.data;
}
