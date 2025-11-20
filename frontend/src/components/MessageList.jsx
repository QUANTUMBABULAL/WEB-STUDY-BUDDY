import React, { useState, useEffect } from 'react';
import useSocket from '../hooks/useSocket';

export default function MessageList() {
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    // Could fetch initial messages via API
  }, []);

  useSocket((msg) => {
    setMessages((m) => [...m, msg]);
  });

  return (
    <ul>
      {messages.map((m, i) => (
        <li key={i}>{m.text}</li>
      ))}
    </ul>
  );
}
