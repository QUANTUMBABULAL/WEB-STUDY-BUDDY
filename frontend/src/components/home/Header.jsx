import React, { useMemo } from 'react';

export default function Header({ user, onLogout }) {
  const avatarSrc = useMemo(() => {
    if (user?.profileUrl) return user.profileUrl;
    const seed = encodeURIComponent(user?.username || 'User');
    return `https://api.dicebear.com/6.x/identicon/svg?seed=${seed}`;
  }, [user]);

  return (
    <header className="app-header">
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{ fontWeight: 700, color: 'var(--accent)' }}>StudyGuide</div>
        <div style={{ fontSize: 13, color: '#8b95a8' }}>class progress · calendar · chat</div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <span style={{ color: '#cbd5f5', fontSize: 14 }}>Hi, {user?.username || 'Student'}</span>
        <button
          type="button"
          style={{ padding: '8px 12px', borderRadius: 10, border: 0, background: 'rgba(91,97,246,0.12)', color: '#fff', cursor: 'pointer' }}
          onClick={onLogout}
        >
          Logout
        </button>
        <img
          src={avatarSrc}
          alt="avatar"
          style={{ width: 34, height: 34, borderRadius: 18, background: '#fff', objectFit: 'cover' }}
        />
      </div>
    </header>
  );
}
