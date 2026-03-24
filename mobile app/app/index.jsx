import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { Link, Stack } from 'expo-router'
import ThemedView from '../components/ThemedView'
import ThemedText from '../components/ThemedText'
import Spacer from '../components/Spacer'
import ThemedLogo from '../components/ThemedLogo'
import { useTheme } from '../contexts/ThemeContext';

const Home = () => {
  
  const { colors } = useTheme();

  return (
    <ThemedView safe={true} style={styles.container}>
      <ThemedLogo 
        style={{ width: '60%', height: '24%' }}
        source={require('../assets/img/updated_logo.jpg')}
      ></ThemedLogo>

      <Spacer height={15}/>
      <ThemedText style={[styles.title, {color: colors.title}]}>Welcome to SafeStreet</ThemedText>
      
      <Spacer />
      <ThemedText style={[{color: colors.text}]}>
        Want to upload your concern?
        <Link href={"/register"} style={[styles.links, {color: colors.links}]}> Register here </Link>
      </ThemedText>

      <Spacer width={'100%'} height={15} />
      <ThemedText style={[{color: colors.text}]}>
        Already have an account?
        <Link href={"/login"} style={[styles.links, {color: colors.links}]}> Login here </Link>
      </ThemedText>

      <Spacer />
      <ThemedText style={[{color: colors.text}]}>
        Are you an Admin?
        <Link href={"/"} style={[styles.links, {color: colors.links}]}> Admin Page </Link>
      </ThemedText>

    </ThemedView>

    
  )
}

export default Home

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center'
  },
  title: {
    fontSize: 22,
    textAlign: 'center',
  },
  links: {
    color: '#4B0082',
  }
})