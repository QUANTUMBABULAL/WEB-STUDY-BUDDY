import axios from 'axios';
import { API_BASE } from '../config/api';

export const listEvents = async () => {
  const { data } = await axios.get(`${API_BASE}/api/events`);
  return data;
};

export const createEvent = async (payload) => {
  const { data } = await axios.post(`${API_BASE}/api/events`, payload);
  return data;
};

export const updateEvent = async (id, payload) => {
  const { data } = await axios.put(`${API_BASE}/api/events/${id}`, payload);
  return data;
};

export const deleteEvent = async (id) => {
  await axios.delete(`${API_BASE}/api/events/${id}`);
  return true;
};
