import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import React from 'react';
import ThemedView from '../../components/ThemedView';
import ThemedText from '../../components/ThemedText';
import { useUser } from '../../hooks/useUser';
import ThemedButton from '../../components/ThemedButton';
import Spacer from '../../components/Spacer';

import { useTheme } from '../../contexts/ThemeContext.js';

const Profile = () => {
  const { logout, user } = useUser();
  const { colors, mode, setThemeMode } = useTheme();

  // --- NEW: Debug log for Profile.jsx ---
  console.log('Profile.jsx: Received colors:', colors, 'Current mode:', mode);

  return (
    <ThemedView style={styles.container} safe={true}>
      <ThemedText>
        Logged in as
      </ThemedText>

      <Spacer height={15}/>
      <ThemedText title={true} style={styles.heading}>
        {user.name}
      </ThemedText>

      <Spacer height={30}/>

      <ThemedText style={styles.themeModeLabel}>Choose Theme Mode:</ThemedText>
      <View style={[
          styles.themeButtonContainer, 
          { borderColor: colors.text }
      ]}>
        <TouchableOpacity
          style={[
            styles.themeButton,
            { backgroundColor: mode === 'light' ? colors.primary : 'transparent' },
            { borderRightColor: colors.text } 
          ]}
          onPress={() => setThemeMode('light')}
        >
          <ThemedText style={[styles.themeButtonText, mode === 'light' && { color: 'white' }]}>Light</ThemedText>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.themeButton,
            { backgroundColor: mode === 'dark' ? colors.primary : 'transparent' },
            { borderRightColor: colors.text } 
          ]}
          onPress={() => setThemeMode('dark')}
        >
          <ThemedText style={[styles.themeButtonText, mode === 'dark' && { color: 'white' }]}>Dark</ThemedText>
        </TouchableOpacity>

        {/* <TouchableOpacity
          style={[
            styles.themeButton,
            { backgroundColor: mode === 'system' ? colors.primary : 'transparent' },
            { borderRightWidth: 0 } 
          ]}
          onPress={() => setThemeMode('system')}
        >
          <ThemedText style={[styles.themeButtonText, mode === 'system' && { color: 'white' }]}>System</ThemedText>
        </TouchableOpacity> */}
      </View>
      
      <Spacer/>
      <ThemedButton onPress={logout} style={{backgroundColor: colors.primary}}>
        <ThemedText style={{ color: '#fff' }}>Log out</ThemedText> 
      </ThemedButton>
    </ThemedView>
  );
}

export default Profile;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  heading: {
    fontWeight: "bold",
    fontSize: 18,
    textAlign: "center",
  },
  themeModeLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  themeButtonContainer: {
    flexDirection: 'row',
    marginBottom: 20,
    borderRadius: 10,
    overflow: 'hidden',
    borderWidth: 1,
  },
  themeButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 15,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
    borderRightWidth: 1, 
  },
  themeButtonText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  logoutButton: {
    color: '#99582A'
  }
});