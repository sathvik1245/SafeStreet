import { Tabs } from "expo-router";
// --- REMOVE useColorScheme and Colors import ---
// import { useColorScheme } from "react-native";
// import { Colors } from "../../constants/Colors";
import { Ionicons } from "@expo/vector-icons";
import UserOnly from "../../components/auth/UserOnly"; // Assuming this component is theme-agnostic or uses ThemedView/Text internally

// --- NEW: Import useTheme hook ---
import { useTheme } from '../../contexts/ThemeContext.js'; // Adjust path as necessary

export default function DashboardLayout() {
  // --- NEW: Use the useTheme hook to get the current theme colors ---
  const { colors } = useTheme(); 

  return (
    <UserOnly>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarStyle: { 
            backgroundColor: colors.navBackground, // Use themed navBackground
            paddingTop: 10, 
            height: 90 
          },
          tabBarActiveTintColor: colors.iconColorFocused, // Use themed iconColorFocused
          tabBarInactiveTintColor: colors.iconColor,    // Use themed iconColor
          tabBarLabelStyle: {
            // Optional: Adjust label style for better visibility
            // fontSize: 12, 
            // fontWeight: 'bold',
            // marginBottom: 5,
          }
        }}
      >
        <Tabs.Screen 
          name="upload"
          options={{ 
            title: "Upload", 
            tabBarIcon: ({ focused }) => (
              <Ionicons 
                size={24} 
                name={focused ? 'cloud-upload': 'cloud-upload-outline'} 
                color={focused ? colors.iconColorFocused : colors.iconColor} // Use themed icon colors
              />
            )
          }} 
        />
        <Tabs.Screen 
          name="images"
          options={{ 
            title: "Damages", 
            tabBarIcon: ({ focused }) => (
              <Ionicons 
                size={24} 
                name={focused ? 'albums': 'albums-outline'} 
                color={focused ? colors.iconColorFocused : colors.iconColor} // Use themed icon colors
              />
            )
          }} 
        />
        <Tabs.Screen 
          name="profile"
          options={{ 
            title: "Profile", 
            tabBarIcon: ({ focused }) => (
              <Ionicons 
                size={24} 
                name={focused ? 'person': 'person-outline'} 
                color={focused ? colors.iconColorFocused : colors.iconColor} // Use themed icon colors
              />
            )
          }}
        />
      </Tabs>
    </UserOnly>
  );
}