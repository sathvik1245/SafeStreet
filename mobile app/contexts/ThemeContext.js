import React, { createContext, useState, useContext, useEffect } from 'react';
import { Appearance, useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Colors } from '../constants/Colors'; // Assuming Colors.js is in the same directory or adjust path

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [themeMode, setThemeMode] = useState('system'); 
  const systemColorScheme = useColorScheme();

  const getEffectiveColorScheme = () => {
    if (themeMode === 'system') {
      return systemColorScheme || 'light';
    }
    return themeMode;
  };

  const currentColorScheme = getEffectiveColorScheme();

  useEffect(() => {
    const loadTheme = async () => {
      try {
        const savedTheme = await AsyncStorage.getItem('userThemeMode');
        if (savedTheme) {
          setThemeMode(savedTheme);
        }
      } catch (error) {
        console.error('Failed to load theme from storage:', error);
      }
    };
    loadTheme();
  }, []);

  useEffect(() => {
    const saveTheme = async () => {
      try {
        await AsyncStorage.setItem('userThemeMode', themeMode);
      } catch (error) {
        console.error('Failed to save theme to storage:', error);
      }
    };
    saveTheme();
  }, [themeMode]);

  const theme = {
    mode: themeMode,
    colors: Colors[currentColorScheme], // This is the object being passed
    setThemeMode,
  };

  // --- NEW: Debug log for ThemeContext.js ---
  console.log('ThemeContext: currentColorScheme =', currentColorScheme, 'Provided colors:', theme.colors);

  return (
    <ThemeContext.Provider value={theme}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};