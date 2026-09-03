import React, { createContext, useContext, useState } from 'react';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [isAdmin, setIsAdmin] = useState(() => {
    return localStorage.getItem('company_drink_admin_token') === 'admin-token-secret-session';
  });
  const [adminTab, setAdminTab] = useState('dashboard'); // 'dashboard', 'stores', 'session', 'employees', 'history', 'settings'

  const loginAdmin = (token) => {
    localStorage.setItem('company_drink_admin_token', token);
    setIsAdmin(true);
  };

  const logoutAdmin = () => {
    localStorage.removeItem('company_drink_admin_token');
    setIsAdmin(false);
  };

  return (
    <AuthContext.Provider value={{ isAdmin, loginAdmin, logoutAdmin, adminTab, setAdminTab }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
