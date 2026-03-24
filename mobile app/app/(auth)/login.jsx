import { StyleSheet, Text, Keyboard, TouchableWithoutFeedback, View, TouchableOpacity } from 'react-native'; // Added View, TouchableOpacity
import { Link } from 'expo-router';
import { useState } from 'react';
import { useUser } from '../../hooks/useUser';
import { Ionicons } from '@expo/vector-icons'; // Import Ionicons

import ThemedView from '../../components/ThemedView';
import ThemedText from '../../components/ThemedText';
import Spacer from '../../components/Spacer';
import ThemedButton from '../../components/ThemedButton';
import ThemedTextInput from "../../components/ThemedTextInput";
// --- REMOVE Colors import ---
// import { Colors } from '../../constants/Colors'; 
// --- NEW: Import useTheme hook ---
import { useTheme } from '../../contexts/ThemeContext'; // Adjust path as necessary

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(null);
    // --- NEW: State for password visibility ---
    const [showPassword, setShowPassword] = useState(false);

    const { user, login } = useUser();
    // --- NEW: Get theme colors ---
    const { colors } = useTheme();

    const handleSubmit = async () => {
        setError(null);

        try {
            await login(email, password);
            console.log('Current User is:', user);
        } catch (error) {
            setError(error.message);
        }

        console.log('Login form submitted!', email, password);
    };

    // --- NEW: Function to toggle password visibility ---
    const toggleShowPassword = () => {
        setShowPassword(!showPassword);
    };

    return (
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <ThemedView style={styles.container} safe={true}>
                <Spacer/>
                <ThemedText title={true} style={styles.title}>
                    Login to Your Account
                </ThemedText>

                <ThemedTextInput 
                    style={[styles.textInput, {backgroundColor: colors.credContainer}]} // Applied common style
                    placeholder="Email"
                    keyboardType="email-address"
                    onChangeText={setEmail}
                    value={email}
                />

                {/* --- NEW: Password input with eye icon --- */}
                <View style={styles.passwordInputContainer}>
                    <ThemedTextInput 
                        style={[styles.textInput, styles.passwordInput, {backgroundColor: colors.credContainer}]} // Applied common and specific styles
                        placeholder="Password"
                        onChangeText={setPassword}
                        value={password}
                        secureTextEntry={!showPassword} // Toggle visibility
                    />
                    <TouchableOpacity 
                        style={styles.eyeIcon} 
                        onPress={toggleShowPassword}
                    >
                        <Ionicons 
                            name={showPassword ? 'eye-off-outline' : 'eye-outline'} // Change icon based on state
                            size={24} 
                            color={colors.backgroundColor} // Use themed icon color
                        />
                    </TouchableOpacity>
                </View>
                {/* --- END Password input with eye icon --- */}

                <ThemedButton onPress={handleSubmit} style={{backgroundColor: colors.primary}}>
                    <ThemedText style={{ color: 'white' }}>Login</ThemedText>
                </ThemedButton>

                <Spacer/>
                {error && (
                    <ThemedText style={[styles.error, {color: colors.warning, backgroundColor: colors.uiBackground, borderColor: colors.warning}]}>
                        {error}
                    </ThemedText>
                )}

                <Spacer height={100} />
                <Link href='/register'>
                    <ThemedText style={{textAlign : 'center'}}>Register Instead</ThemedText>
                </Link>
            </ThemedView>
        </TouchableWithoutFeedback>
    );
};

export default Login;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20, // Added padding for better layout
    },
    title: {
        textAlign: 'center',
        fontSize: 24, // Increased font size for title
        marginBottom: 30,
    },
    textInput: { // Common style for text inputs
        width: '90%', 
        marginBottom: 20,
        color: '#000'
    },
    passwordInputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        width: '90%',
        marginBottom: 20,
        position: 'relative', // Needed for absolute positioning of icon
    },
    passwordInput: {
        flex: 1, // Take up available space
        paddingRight: 50, // Make space for the icon
        marginBottom: 0, // Remove margin from ThemedTextInput style
    },
    eyeIcon: {
        position: 'absolute',
        right: 15, // Position inside the input field
        padding: 5, // Make it easier to tap
    },
    error: {
        // color: Colors.warning, // REMOVED - Set inline below
        padding: 10,
        // backgroundColor: '#f5c1c8', // REMOVED - Set inline below
        // borderColor: Colors.warning, // REMOVED - Set inline below
        borderWidth: 1,
        borderRadius: 6,
        marginHorizontal: 10,
        textAlign: 'center', // Center error text
    }
});