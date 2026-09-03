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

  // Auto-sync saved currentUser against live employee list (handles re-seeded IDs)
  useEffect(() => {
    if (currentUser && currentUser.name) {
      import('../api').then(({ api }) => {
        api.getEmployees().then(emps => {
          if (Array.isArray(emps) && emps.length > 0) {
            const matched = emps.find(e => 
              (currentUser.code && e.code === currentUser.code) ||
              (e.name && e.name.trim().toLowerCase() === currentUser.name.trim().toLowerCase())
            );
            if (matched && matched.id !== currentUser.id) {
              setCurrentUser(matched);
              localStorage.setItem('company_drink_employee', JSON.stringify(matched));
            }
          }
        }).catch(() => {});
      });
    }
  }, []);

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
