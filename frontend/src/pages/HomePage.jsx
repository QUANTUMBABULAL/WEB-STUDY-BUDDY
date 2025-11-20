import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/home/Sidebar';
import Header from '../components/home/Header';
import CalendarPane from '../components/home/CalendarPane';
import ProfilePane from '../components/home/ProfilePane';
import { useAuth } from '../context/AuthContext';
import '../styles/home.css';

export default function HomePage() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [active, setActive] = useState('calendar');

  useEffect(() => {
    document.body.classList.add('friend-theme');
    return () => document.body.classList.remove('friend-theme');
  }, []);

  const handleNav = (section) => {
    if (section === 'chat') {
      navigate('/chat');
      return;
    }
    setActive(section);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="home-shell">
      <Sidebar active={active} onSelect={handleNav} />
      <Header user={user} onLogout={handleLogout} />
      <main className="main">
        <div className="main-container">
          <div className="primary-pane">
            {active === 'calendar' && <CalendarPane />}
            {active === 'profile' && <ProfilePane />}
          </div>
        </div>
      </main>
    </div>
  );
}
