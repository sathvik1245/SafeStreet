import { Text, StyleSheet } from 'react-native';
import React from 'react';

// Import the useTheme hook from your ThemeContext file
// Adjust the path according to where you placed ThemeContext.js
import { useTheme } from '../contexts/ThemeContext.js'; 

const ThemedText = ({ style, title = false, ...props }) => {
    // Use the useTheme hook to get the current theme's colors
    const { colors } = useTheme(); 

    // Determine the text color based on the 'title' prop
    // If 'title' is true, use colors.title; otherwise, use colors.text
    const textColor = title ? colors.title : colors.text;
 
    return (
        <Text 
            style={[{ color: textColor }, style]} // Apply the dynamically determined color
            {...props}
        />
    );
};

export default ThemedText;

const styles = StyleSheet.create({
    // You can add any default text styles here if you want
    // For example:
    // defaultText: {
    //   fontSize: 16,
    //   fontFamily: 'System', // Or a custom font
    // },
});