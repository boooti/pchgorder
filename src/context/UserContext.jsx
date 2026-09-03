import React, { createContext, useContext, useState, useEffect } from 'react';

const UserContext = createContext();

export function UserProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const saved = localStorage.getItem('company_drink_employee');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const selectUser = (employee) => {
    setCurrentUser(employee);
    if (employee) {
      localStorage.setItem('company_drink_employee', JSON.stringify(employee));
    } else {
      localStorage.removeItem('company_drink_employee');
    }
  };

  const logoutUser = () => {
    setCurrentUser(null);
    localStorage.removeItem('company_drink_employee');
  };

  return (
    <UserContext.Provider value={{ currentUser, setCurrentUser: selectUser, isUserSelected: !!currentUser, logoutUser }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  return useContext(UserContext);
}
