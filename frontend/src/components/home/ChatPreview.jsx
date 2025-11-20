import React, { useState } from 'react';

const seedMessages = [
  { id: 1, sender: 'Teacher', text: 'Today we completed linked lists.' },
  { id: 2, sender: 'You', text: 'Thanks! Can you share the notes?' }
];

export default function ChatPreview({ onOpenChat }) {
  const [messages] = useState(seedMessages);

  return (
    <div className="home-chat-card panel">
      <h2>Chats</h2>
      <p className="chat-subtitle">Jump into the global room to collaborate with classmates.</p>
      <div className="chat-preview-list">
        {messages.map((message) => (
          <div key={message.id} className={`chat-preview ${message.sender === 'You' ? 'self' : ''}`}>
            <div className="chat-preview-meta">
              <strong>{message.sender}</strong>
            </div>
            <div className="chat-preview-text">{message.text}</div>
          </div>
        ))}
      </div>
      <button type="button" className="btn btn-primary" onClick={onOpenChat}>
        Open Global Chat
      </button>
    </div>
  );
}
