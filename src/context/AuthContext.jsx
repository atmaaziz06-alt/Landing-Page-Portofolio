// src/context/AuthContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const getStoredToken = () => {
    return sessionStorage.getItem('vezta_admin_token') || localStorage.getItem('vezta_admin_token');
  };

  const getStoredUser = () => {
    try {
      const stored = sessionStorage.getItem('vezta_admin_user') || localStorage.getItem('vezta_admin_user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  };

  const [token, setToken] = useState(getStoredToken);
  const [user, setUser] = useState(getStoredUser);
  const [isLoading, setIsLoading] = useState(true);

  // Validate session on mount
  useEffect(() => {
    async function verifySession() {
      const storedToken = getStoredToken();
      if (!storedToken) {
        setUser(null);
        setIsLoading(false);
        return;
      }

      try {
        const res = await api.getMe();
        if (res.success && res.user) {
          setUser(res.user);
          sessionStorage.setItem('vezta_admin_user', JSON.stringify(res.user));
        } else {
          logout();
        }
      } catch (err) {
        console.warn('Session verification failed:', err.message);
        logout();
      } finally {
        setIsLoading(false);
      }
    }

    verifySession();
  }, []);

  const login = async (identifier, password) => {
    const res = await api.login(identifier, password);
    if (res.success && res.token) {
      setToken(res.token);
      setUser(res.user);
      // Store in sessionStorage so closing the tab/window automatically logs out
      sessionStorage.setItem('vezta_admin_token', res.token);
      sessionStorage.setItem('vezta_admin_user', JSON.stringify(res.user));
      // Clean up legacy localStorage
      localStorage.removeItem('vezta_admin_token');
      localStorage.removeItem('vezta_admin_user');
      return res;
    }
    throw new Error(res.message || 'Login failed');
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    sessionStorage.removeItem('vezta_admin_token');
    sessionStorage.removeItem('vezta_admin_user');
    localStorage.removeItem('vezta_admin_token');
    localStorage.removeItem('vezta_admin_user');
  };

  const value = {
    token,
    user,
    isAuthenticated: Boolean(token && user),
    isLoading,
    login,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
