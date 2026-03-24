import { Pressable, StyleSheet } from 'react-native'
import React from 'react'
import { useTheme } from '../contexts/ThemeContext.js'; // Adjust path as necessary

const ThemedButton = ({style, children, ...props}) => {
  const { colors } = useTheme();

  return (
    <Pressable
      style={({ pressed }) => [
        styles.btn, 
        { backgroundColor: colors.primary }, // Use themed primary color
        pressed && styles.pressed,
        style 
      ]}
      {...props}
    >
      {children}
    </Pressable>
  )
}

const styles = StyleSheet.create({
    btn: {
        padding: 18,
        borderRadius: 6,
        marginVertical: 10
    },
    pressed: {
        opacity: 0.5
    }
})

export default ThemedButton