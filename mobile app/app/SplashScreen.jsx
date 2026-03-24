import React, { useEffect } from 'react';
import { StyleSheet, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useUser } from '../hooks/useUser'; // Import useUser hook
import ThemedView from '../components/ThemedView';
import ThemedLogo from '../components/ThemedLogo';
import ThemedText from '../components/ThemedText';
import { useTheme } from '../contexts/ThemeContext'; // Import useTheme to get colors for ActivityIndicator

const SplashScreen = () => {
  const router = useRouter();
  const { user, authChecked } = useUser(); // Get user and authChecked from UserContext
  const { colors } = useTheme(); // Get theme colors for the activity indicator

  useEffect(() => {
    // Set a timeout for the splash screen duration
    const SPLASH_SCREEN_DURATION = 2000; // 2 seconds

    const timer = setTimeout(() => {
      // Only attempt to redirect if authentication status has been checked
      if (authChecked) {
        if (user) {
          // User is logged in, navigate to the dashboard
          router.replace('/(dashboard)/images'); 
        } else {
          // User is not logged in, navigate to the login/initial auth page
          router.replace('/'); 
        }
      } else {
        // If authChecked is still false after the timeout, it means the auth check
        // is taking longer than the splash screen duration.
        // In this case, we still want to wait for authChecked to be true before redirecting.
        // The useEffect dependency array handles this, as the effect will re-run when authChecked changes.
        // For a smoother UX, you might want to extend the splash screen if authChecked isn't true yet,
        // or show a persistent loading indicator. For now, we'll let the existing useEffect logic handle it.
        // The ActivityIndicator below will remain visible until authChecked is true.
      }
    }, SPLASH_SCREEN_DURATION);

    // Clean up the timer if the component unmounts before the timeout
    return () => clearTimeout(timer);
  }, [user, authChecked, router]); // Keep dependencies to react to auth changes

  return (
    <ThemedView style={styles.container} safe={true}>
      <ThemedLogo 
        style={styles.logo}
        source={require('../assets/img/updated_logo.jpg')}
      />
      {/* Show activity indicator while authentication status is being checked */}
      {!authChecked && (
        <ActivityIndicator size="large" color={colors.primary} style={styles.activityIndicator} />
      )}
      {!authChecked && (
        <ThemedText style={styles.loadingText}>Loading app...</ThemedText>
      )}
    </ThemedView>
  );
};

export default SplashScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    width: '60%', 
    height: '24%',
    resizeMode: 'contain',
    marginBottom: 20,
  },
  activityIndicator: {
    marginTop: 20,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
  },
});