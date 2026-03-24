import React, { createContext, useState, useEffect } from 'react';
import { lightTheme, darkTheme } from './theme';

export const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(lightTheme);

  const applyTheme = (themeObj) => {
    const root = document.documentElement;
    root.style.setProperty('--primary', themeObj.primary);
    root.style.setProperty('--secondary', themeObj.secondary);
    root.style.setProperty('--background', themeObj.background);
    root.style.setProperty('--card', themeObj.card);
    root.style.setProperty('--text', themeObj.text);
    root.style.setProperty('--tableHeader', themeObj.tableHeader);
    root.style.setProperty('--buttonText', themeObj.buttonText);
    root.style.setProperty('--btnColour', themeObj.btnColour);
    root.style.setProperty('--btnHover', themeObj.btnHover);
    
  };

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => (prev.name === 'light' ? darkTheme : lightTheme));
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};
