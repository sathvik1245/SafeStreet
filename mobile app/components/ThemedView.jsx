// import { StyleSheet, Text, useColorScheme, View } from 'react-native'
// import React from 'react'

// import { Colors } from '../constants/Colors'

// const ThemedView = ({style, ...props}) => { // Here '...props' take into account any other children

//     const colorScheme = useColorScheme()
//     const theme = Colors[colorScheme] ?? Colors.light

//     return (
//         <View 
//             style={[{ backgroundColor : theme.background}, style]}
//             {...props}
//         />
//         // We make the above View tag to be self closing so that it automatically renders the children present inside it
//     )
// }

// export default ThemedView









// We always have to display contents of our app in such a way that it does not interfere or overlap with the device UI features like the battery icon, time or the WiFi symbol.... To make sure that we always display content this way, we can use the SafeAreaView component or "react-native-safe-area-context". SafeAreaView could be a bit janky in some cases so we are going to use "react-native-safe-area-context"

import { StyleSheet, View } from 'react-native';
import React from 'react';
import { useSafeAreaInsets } from "react-native-safe-area-context";

// Import the useTheme hook from your ThemeContext file
// Adjust the path according to where you placed ThemeContext.js
import { useTheme } from '../contexts/ThemeContext.js'; 

const ThemedView = ({ style, safe = false, ...props }) => {
    // Use the useTheme hook to get the current theme's colors
    const { colors } = useTheme(); 
    const insets = useSafeAreaInsets();

    // Base styles for the view, applying the background color from the theme
    const baseViewStyle = {
        backgroundColor: colors.background,
    };

    // If 'safe' prop is true, add padding from safe area insets
    if (safe) {
        return (
            <View 
                style={[
                    baseViewStyle,
                    { 
                        paddingTop: insets.top,
                        paddingBottom: insets.bottom,
                        // Consider adding horizontal padding if desired, e.g., paddingHorizontal: insets.left, paddingRight: insets.right
                    }, 
                    style
                ]}
                {...props}
            />
        );
    }

    // If 'safe' prop is false, just apply the background and any custom styles
    return (
        <View 
            style={[baseViewStyle, style]}
            {...props}
        />
    );
};

export default ThemedView;

// You can add default styles here if you want any
const styles = StyleSheet.create({
    // Example: flex: 1 if this view typically takes up the whole screen space
    // container: {
    //   flex: 1,
    // },
});