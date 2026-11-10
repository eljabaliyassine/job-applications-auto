import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('techstore_token') || '');
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('techstore_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  // Sauvegarde dans localStorage
  useEffect(() => {
    if (token) {
      localStorage.setItem('techstore_token', token);
    } else {
      localStorage.removeItem('techstore_token');
    }
  }, [token]);

  useEffect(() => {
    if (user) {
      localStorage.setItem('techstore_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('techstore_user');
    }
  }, [user]);

  // Connexion
  const login = async (email, password) => {
    const res = await axios.post('/api/auth/login', { email, password });
    setToken(res.data.token);
    setUser(res.data.user);
    return res.data;
  };

  // Inscription
  const register = async (name, email, password) => {
    const res = await axios.post('/api/auth/register', { name, email, password });
    setToken(res.data.token);
    setUser(res.data.user);
    return res.data;
  };

  // Déconnexion
  const logout = () => {
    setToken('');
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        token,
        user,
        isAuthenticated: !!token,
        login,
        register,
        logout
      }}
    >
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

