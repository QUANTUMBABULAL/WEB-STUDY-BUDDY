import React, { createContext, useContext, useEffect, useState } from 'react';
import { login as apiLogin, register as apiRegister } from '../api/authApi';
import { saveToken, getToken, removeToken } from '../utils/authHelpers';
import axios from 'axios';
import { API_BASE } from '../config/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem("chat_user");
    return stored ? JSON.parse(stored) : null;
  });

  const [token, setToken] = useState(() => getToken());

  // Set default axios base URL
  useEffect(() => {
    axios.defaults.baseURL = API_BASE;
  }, []);

  // Add/remove Authorization header when token changes
  useEffect(() => {
    if (token) {
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    } else {
      delete axios.defaults.headers.common["Authorization"];
    }
  }, [token]);

  // ---------------------------
  // LOGIN
  // ---------------------------
  const login = async (username, password) => {
    const res = await apiLogin(username, password);

    saveToken(res.token);
    setToken(res.token);
    setUser(res.user);

    localStorage.setItem("chat_user", JSON.stringify(res.user));
    return res;
  };

  // ---------------------------
  // REGISTER
  // ---------------------------
  const register = async (username, password) => {
    const res = await apiRegister(username, password);

    saveToken(res.token);
    setToken(res.token);
    setUser(res.user);

    localStorage.setItem("chat_user", JSON.stringify(res.user));
    return res;
  };

  // ---------------------------
  // LOGOUT
  // ---------------------------
  const logout = () => {
    removeToken();
    setToken(null);
    setUser(null);
    localStorage.removeItem("chat_user");
  };

  // ---------------------------
  // UPDATE PROFILE (IMPORTANT)
  // ---------------------------
  const updateUserProfile = (updatedUser) => {
    if (!updatedUser) return;

    setUser(updatedUser); // update React state
    localStorage.setItem("chat_user", JSON.stringify(updatedUser)); // persist
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        login,
        register,
        logout,
        updateUserProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
