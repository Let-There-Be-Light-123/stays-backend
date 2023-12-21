import React, { createContext, useContext, useState } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState({});
  const [token, setToken] = useState(localStorage.getItem('ACCESS_TOKEN') || '');

  const login = ( authToken) => {
    setToken(authToken);
    localStorage.setItem('ACCESS_TOKEN', authToken);
  };

  const logout = () => {
    setUser({});
    setToken('');
    localStorage.removeItem('ACCESS_TOKEN');
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
