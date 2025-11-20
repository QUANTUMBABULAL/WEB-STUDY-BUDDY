import axios from 'axios';
import { getToken } from '../utils/authHelpers';
import { API_BASE } from '../config/api';
import { logError } from '../utils/logger';

export async function updateProfile(data) {
  const token = getToken();

  try {
    const res = await axios.put(
      `${API_BASE}/api/user/profile`,
      data,
      {
        headers: {
          Authorization: token ? `Bearer ${token}` : '',
          'Content-Type': 'application/json'
        },
        withCredentials: true
      }
    );

    return res.data;
  } catch (err) {
    logError('updateProfile request failed', err.response?.data || err.message);
    throw err.response?.data || { error: 'Profile update failed' };
  }
}
