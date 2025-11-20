import React, { useState } from 'react';
import socket from '../socket';

export default function MessageInput() {
  const [text, setText] = useState('');

  const send = () => {
    if (!text) return;
    socket.emit('chatMessage', { text, createdAt: new Date() });
    setText('');
  };

  return (
    <div>
      <input value={text} onChange={(e) => setText(e.target.value)} placeholder="Type a message" />
      <button onClick={send}>Send</button>
    </div>
  );
}
