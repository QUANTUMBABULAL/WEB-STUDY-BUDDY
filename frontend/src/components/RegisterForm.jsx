import React, { useState } from 'react';
import { register } from '../api/authApi';

export default function RegisterForm() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const submit = async (e) => {
    e.preventDefault();
    await register({ username, password });
    alert('Registered (placeholder)');
  };

  return (
    <form onSubmit={submit}>
      <input value={username} onChange={(e) => setUsername(e.target.value)} placeholder="username" />
      <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="password" />
      <button type="submit">Register</button>
    </form>
  );
}
