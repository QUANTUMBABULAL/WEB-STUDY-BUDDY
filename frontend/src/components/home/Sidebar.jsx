import React, { useState } from 'react';

export default function Sidebar({ active, onSelect = () => {} }) {
  const [expanded, setExpanded] = useState(false);

  const Item = ({ keyName, icon, label }) => (
    <button
      type="button"
      className={`side-item${active === keyName ? ' active' : ''}`}
      onClick={() => onSelect(keyName)}
      aria-pressed={active === keyName}
    >
      <span className="icon" aria-hidden>
        {icon}
      </span>
      <span className="label">{label}</span>
    </button>
  );

  return (
    <aside
      className={`sidebar${expanded ? ' expanded' : ' collapsed'}`}
      onMouseEnter={() => setExpanded(true)}
      onMouseLeave={() => setExpanded(false)}
      aria-label="Main navigation"
    >
      <div className="brand-block">
        <div className="sb-brand">StudyGuide</div>
        <div className="sb-sub">class progress · calendar · chat</div>
      </div>

      <nav className="nav" role="navigation">
        <Item keyName="calendar" icon="📅" label="Calendar" />
        <Item keyName="chat" icon="💬" label="Chats" />
        <Item keyName="profile" icon="👤" label="Profile" />
      </nav>

      <div className="section-title">Subjects</div>
      <div className="class-item">
        <span className="icon">🔗</span>
        <span className="label">DSA</span>
      </div>
      <div className="class-item">
        <span className="icon">📊</span>
        <span className="label">MATHS</span>
      </div>
      <div className="class-item">
        <span className="icon">⚙️</span>
        <span className="label">DDCO</span>
      </div>
      <div className="class-item">
        <span className="icon">📝</span>
        <span className="label">AFLL</span>
      </div>
      <div className="class-item">
        <span className="icon">🌐</span>
        <span className="label">WT</span>
      </div>
      <div className="class-item">
        <span className="icon">✅</span>
        <span className="label">CIE</span>
      </div>

      <div className="footer">
        <button className="settings" aria-label="Settings">
          ⚙️
        </button>
      </div>
    </aside>
  );
}
