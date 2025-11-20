import React, { useRef, useState, useEffect } from 'react';
import { API_BASE } from '../../config/api';
import { useAuth } from '../../context/AuthContext';
import { logError } from '../../utils/logger';

export default function ProfilePane() {
  const { token, updateUserProfile } = useAuth();
  const [profile, setProfile] = useState(null);
  const [draft, setDraft] = useState(null);
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const fileInput = useRef(null);

  // Load profile from database on mount
  useEffect(() => {
    const loadProfile = async () => {
      if (!token) return;
      
      try {
        setLoading(true);
        const response = await fetch(`${API_BASE}/api/user/profile`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          throw new Error('Failed to load profile');
        }

        const data = await response.json();
        setProfile(data);
        updateUserProfile?.(data);
        setError('');
      } catch (err) {
        logError('ProfilePane loadProfile failed', err);
        setError('Failed to load profile');
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [token]);

  const startEdit = () => {
    if (profile) {
      setDraft({ ...profile });
      setEditing(true);
    }
  };

  const cancelEdit = () => {
    setDraft(null);
    setEditing(false);
    setError('');
    if (fileInput.current) fileInput.current.value = '';
  };

  const saveEdit = async () => {
    if (!draft || !token) return;

    try {
      setSaving(true);
      setError('');

      const updateData = {
        username: draft.username,
        email: draft.email,
        role: draft.role,
        bio: draft.bio,
        profileUrl: draft.profileUrl
      };

      const response = await fetch(`${API_BASE}/api/user/profile`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updateData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save profile');
      }

      const data = await response.json();
      setProfile(data);
      updateUserProfile?.(data);
      setEditing(false);
      setDraft(null);
      if (fileInput.current) fileInput.current.value = '';
    } catch (err) {
      logError('ProfilePane saveEdit failed', err);
      setError(err.message || 'Failed to save profile');
    } finally {
      setSaving(false);
    }
  };

  const onFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size (limit to 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setError('Image size must be less than 10MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      setDraft((prev) => ({ ...prev, profileUrl: event.target.result }));
      setError('');
    };
    reader.readAsDataURL(file);
  };

  if (loading) {
    return <div className="profile-pane panel">Loading profile...</div>;
  }

  if (!profile) {
    return <div className="profile-pane panel">No profile data available</div>;
  }

  return (
    <div className="profile-pane panel">
      {error && <div className="error-message" style={{ color: '#ef4444', marginBottom: '12px' }}>{error}</div>}
      
      <div className="profile-header">
        <img src={editing && draft?.profileUrl ? draft.profileUrl : (profile.profileUrl || 'https://via.placeholder.com/82')} alt="avatar" className="avatar" />
        <div>
          <div className="profile-name">{editing && draft ? draft.username : profile.username}</div>
          <div className="profile-role">{editing && draft ? draft.role : profile.role}</div>
          <div className="profile-email">{editing && draft ? draft.email : profile.email}</div>
        </div>
      </div>

      <div className="profile-form">
        {!editing ? (
          <>
            <label>
              Username
              <div style={{ padding: '8px', background: '#f3f4f6', borderRadius: '8px', marginTop: '6px' }}>
                {profile.username}
              </div>
            </label>
            <label>
              Email
              <div style={{ padding: '8px', background: '#f3f4f6', borderRadius: '8px', marginTop: '6px' }}>
                {profile.email}
              </div>
            </label>
            <label>
              Role
              <div style={{ padding: '8px', background: '#f3f4f6', borderRadius: '8px', marginTop: '6px' }}>
                {profile.role}
              </div>
            </label>
            <label>
              Bio
              <div style={{ padding: '8px', background: '#f3f4f6', borderRadius: '8px', marginTop: '6px', whiteSpace: 'pre-wrap', wordBreak: 'break-word', minHeight: '80px' }}>
                {profile.bio || 'No bio added yet'}
              </div>
            </label>
          </>
        ) : (
          <>
            <label>
              Username
              <input
                value={draft ? draft.username : profile.username}
                onChange={(e) => setDraft((prev) => ({ ...prev, username: e.target.value }))}
              />
            </label>
            <label>
              Email
              <input
                value={draft ? draft.email : profile.email}
                onChange={(e) => setDraft((prev) => ({ ...prev, email: e.target.value }))}
              />
            </label>
            <label>
              Role
              <input
                value={draft ? draft.role : profile.role}
                onChange={(e) => setDraft((prev) => ({ ...prev, role: e.target.value }))}
              />
            </label>
            <label>
              Bio
              <textarea
                value={draft ? draft.bio : profile.bio}
                rows={4}
                onChange={(e) => setDraft((prev) => ({ ...prev, bio: e.target.value }))}
              />
            </label>
          </>
        )}
      </div>

      <div className="profile-actions">
        {!editing && (
          <button type="button" className="btn btn-primary" onClick={startEdit}>
            Edit Profile
          </button>
        )}
        {editing && (
          <>
            <label className="upload-btn">
              Upload
              <input ref={fileInput} type="file" accept="image/*" onChange={onFileChange} />
            </label>
            <button type="button" className="btn btn-secondary" onClick={cancelEdit}>
              Cancel
            </button>
            <button type="button" className="btn btn-primary" onClick={saveEdit} disabled={saving}>
              {saving ? 'Saving...' : 'Save'}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
