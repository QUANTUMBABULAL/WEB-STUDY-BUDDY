import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import useSocket from '../hooks/useSocket';
import { fetchMessages } from '../api/chatApi';
import { logError } from '../utils/logger';

export default function ChatPage() {
  const { user, logout, token } = useAuth();
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const listRef = useRef(null);

  useEffect(() => {
    (async () => {
      try {
        const msgs = await fetchMessages();
        setMessages(msgs);
      } catch (err) {
        logError('fetchMessages failed', err);
      }
    })();
  }, []);

  const handleIncomingMessage = useCallback((msg) => {
    setMessages((prev) => [...prev, msg]);
    requestAnimationFrame(() => {
      listRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
    });
  }, []);

  const { sendMessage } = useSocket(handleIncomingMessage);

  const submit = (e) => {
    e.preventDefault();
    const trimmed = text.trim();
    if (!trimmed) return;
    sendMessage(trimmed);
    setText('');
  };

  return (
    <div className="chat-page">
      <header className="chat-header">
        <h3>Global Chat</h3>
        <div>
          <span className="username">{user?.username}</span>
          <button onClick={logout}>Logout</button>
        </div>
      </header>

      <div className="messages-container">
        {messages.map(m => (
          <div key={m._id} className={`message ${m.sender?.username === user?.username ? 'mine' : ''}`}>
            <div className="meta">
              <strong>{m.sender?.username}</strong>
              <small>{new Date(m.createdAt).toLocaleTimeString()}</small>
            </div>
            <div className="text">{m.text}</div>
          </div>
        ))}
        <div ref={listRef} />
      </div>

      <form onSubmit={submit} className="message-form">
        <input placeholder="Type a message..." value={text} onChange={e => setText(e.target.value)} />
        <button type="submit">Send</button>
      </form>
    </div>
  );
}
