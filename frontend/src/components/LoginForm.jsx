import React, { useState, useContext } from 'react';
import { login } from '../api/authApi';
import { AuthContext } from '../context/AuthContext';
import { saveToken } from '../utils/authHelpers';

export default function LoginForm() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const { setUser } = useContext(AuthContext);

  const submit = async (e) => {
    e.preventDefault();
    const data = await login({ username, password });
    saveToken(data.token);
    setUser(data.user);
  };

  return (
    <form onSubmit={submit}>
      <input value={username} onChange={(e) => setUsername(e.target.value)} placeholder="username" />
      <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="password" />
      <button type="submit">Login</button>
    </form>
  );
}
