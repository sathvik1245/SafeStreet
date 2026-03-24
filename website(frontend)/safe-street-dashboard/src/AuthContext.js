import React, { createContext, useState, useEffect } from 'react';
import { account } from './components/appwriteConfig';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(null);

  const checkSession = async () => {
    try {
      await account.get(); 
      setIsLoggedIn(true);
    } catch {
      setIsLoggedIn(false);
    }
  };

  useEffect(() => {
    checkSession();
  }, []);

  return (
    <AuthContext.Provider value={{ isLoggedIn, setIsLoggedIn, checkSession }}>
      {children}
    </AuthContext.Provider>
  );
};
