import React, { useEffect } from 'react';
import { ActivityIndicator, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useUser } from '../hooks/useUser'; // Adjust path as needed
import ThemedView from '../components/ThemedView'; // Assuming this path is correct
import ThemedText from '../components/ThemedText'; // Assuming this path is correct

const InitialAuthRedirect = () => {
  const { user, authChecked } = useUser();
  const router = useRouter();

  useEffect(() => {
    // Only redirect once authentication status has been checked
    if (authChecked) {
      if (user) {
        // User is logged in, navigate to the dashboard
        // Replace '/(dashboard)' with '/Home' if your Stack.Screen name is literally 'Home'
        // and that's where your DashboardLayout is rendered.
        router.replace('/(dashboard)/upload'); 
      } else {
        // User is not logged in, navigate to the login/initial auth page
        router.replace('/'); // Assuming your login page is at /login
      }
    }
  }, [user, authChecked, router]);

  // Show a loading indicator while authentication status is being checked
  return (
    <ThemedView style={styles.container} safe={true}>
      <ActivityIndicator size="large" />
      <ThemedText>Checking authentication status...</ThemedText>
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default InitialAuthRedirect;