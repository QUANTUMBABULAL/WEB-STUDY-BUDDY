import React from 'react';
import MessageList from './MessageList';
import MessageInput from './MessageInput';

export default function ChatWindow() {
  return (
    <div>
      <h3>Chat</h3>
      <MessageList />
      <MessageInput />
    </div>
  );
}
