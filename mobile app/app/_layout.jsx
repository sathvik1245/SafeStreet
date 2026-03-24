import { StyleSheet, Text, View } from 'react-native';
import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { Stack } from 'expo-router';
import { UserProvider } from '../contexts/UserContext';

import { ThemeProvider, useTheme } from '../contexts/ThemeContext'; 

// --- REMOVE this import as InitialAuthRedirect is no longer needed ---
// import InitialAuthRedirect from './initial-auth-redirect'; 

function ThemedStatusBar() {
  const { colors, mode } = useTheme();
  const barStyle = mode === 'dark' ? 'light-content' : 'dark-content';
  const backgroundColor = colors.background;

  return (
    <StatusBar style={barStyle} backgroundColor={backgroundColor} />
  );
}

const RootLayout = () => {
  return (
    <ThemeProvider>
      <UserProvider>
        <ThemedStatusBar /> 
        
        <Stack initialRouteName="SplashScreen" screenOptions={{ headerShown: false, animation: "none" }}>
          {/* --- CRITICAL CHANGE: SplashScreen is now the initial route --- */}
          <Stack.Screen name="SplashScreen" /> 
          
          {/* --- REMOVE this screen as its logic is now in SplashScreen --- */}
          {/* <Stack.Screen name="initial-auth-redirect" /> */}
          
          {/* Your main dashboard group (e.g., app/(dashboard)/_layout.jsx) */}
          <Stack.Screen name="(dashboard)" /> 
          
          {/* Your authentication group/screens (e.g., app/(auth)/_layout.jsx) */}
          <Stack.Screen name="/" /> 

          {/* If you have a direct login.jsx at app/login.jsx */}
          {/* <Stack.Screen name="login" />  */}
          {/* If you have a direct register.jsx at app/register.jsx */}
          {/* <Stack.Screen name="register" />  */}

        </Stack>
      </UserProvider>
    </ThemeProvider>
  );
};

export default RootLayout;

const styles = StyleSheet.create({});