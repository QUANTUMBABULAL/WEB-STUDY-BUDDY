import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { updateProfile } from '../api/userApi';
import { logError } from '../utils/logger';

const emptyProfile = {
  username: '',
  email: '',
  role: 'Student',
  bio: '',
  profileUrl: ''
};

export default function ProfilePage() {
  const { user, updateUserProfile } = useAuth();
  const [form, setForm] = useState(emptyProfile);
  const [status, setStatus] = useState({ type: '', message: '' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user) {
      const next = { ...emptyProfile };
      Object.keys(emptyProfile).forEach((key) => {
        if (user[key] !== undefined) {
          next[key] = user[key];
        }
      });
      setForm(next);
    } else {
      setForm(emptyProfile);
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) return;
    setSaving(true);
    setStatus({ type: '', message: '' });
    try {
      const payload = {
        username: form.username?.trim(),
        email: form.email?.trim(),
        role: form.role,
        bio: form.bio,
        profileUrl: form.profileUrl?.trim()
      };
      const updated = await updateProfile(payload);
      updateUserProfile(updated);
      setStatus({ type: 'success', message: 'Profile updated successfully.' });
    } catch (err) {
      logError('Profile update failed', err);
      const message = err.response?.data?.error || err.error || 'Unable to update profile';
      setStatus({ type: 'error', message });
    } finally {
      setSaving(false);
    }
  };

  if (!user) {
    return (
      <div className="panel" style={{ padding: 24 }}>
        <p>Please log in to edit your profile.</p>
      </div>
    );
  }

  return (
    <div className="profile-page">
      <div className="panel" style={{ maxWidth: 640, margin: '0 auto', padding: 24 }}>
        <h2>Edit Profile</h2>
        <form className="profile-form" onSubmit={handleSubmit}>
          <div className="form-grid">
            <label>
              Username
              <input name="username" value={form.username} onChange={handleChange} required />
            </label>
            <label>
              Email
              <input name="email" type="email" value={form.email} onChange={handleChange} required />
            </label>
            <label>
              Role
              <select name="role" value={form.role} onChange={handleChange}>
                <option value="Student">Student</option>
                <option value="Mentor">Mentor</option>
                <option value="Admin">Admin</option>
                <option value="Guest">Guest</option>
              </select>
            </label>
            <label>
              Profile URL
              <input name="profileUrl" value={form.profileUrl} onChange={handleChange} placeholder="https://" />
            </label>
          </div>
          <label>
            Bio
            <textarea name="bio" value={form.bio} onChange={handleChange} rows={4} />
          </label>

          {status.message && (
            <p className={status.type === 'error' ? 'error' : 'success'} style={{ marginTop: 12 }}>
              {status.message}
            </p>
          )}

          <button type="submit" className="btn btn-primary" disabled={saving}>
            {saving ? 'Saving…' : 'Save Changes'}
          </button>
        </form>
      </div>
    </div>
  );
}
