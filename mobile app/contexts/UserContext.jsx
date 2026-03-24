import { createContext, useEffect, useState } from "react";
import { account } from '../lib/appwrite';
import { ID } from 'react-native-appwrite';

// Create a new context object named UserContext.
// This will allow any child component to access the user-related data/functions.
export const UserContext = createContext()

export function UserProvider({ children }) {
    // useState is used to hold the current user data.
    // Initially set to null, meaning no user is logged in.
    const [user, setUser] = useState(null);
    const [authChecked, setAuthChecked] = useState(false)

    // Async function to handle user login.
    // You would typically send email/password to an API here and update the user state.
    async function login(email, password) {
        // Example placeholder:
        // const response = await fetch("/api/login", { method: "POST", body: JSON.stringify({ email, password }) });
        // const data = await response.json();
        // setUser(data.user);

        try {
            await account.createEmailPasswordSession(email, password)
            const response = await account.get()
            setUser(response)
        } catch (error) {
            throw Error(error.message)
        }
    }

    // Async function to handle new user registration.
    // Normally, you'd call your backend API to create a new user and maybe log them in automatically.
    async function register(email, password, username) {
        // Placeholder for registration logic.

        try {
            await account.create(ID.unique(), email, password, username)
            await login(email, password)
        } catch (error) {
            throw Error(error.message)
        }
    }

    // Async function to log out the user.
    // Typically clears the user session/token and resets the user state to null.
    async function logout() {
        // Placeholder for logout logic.
        // Example: await fetch("/api/logout");
        // setUser(null);

        await account.deleteSession('current')
        setUser(null)
    }

    async function getInitialUserValue() {
        try {
            const response = await account.get()
            setUser(response)
        } catch (error) {
            setUser(null)
        } finally {
            setAuthChecked(true)
        }
    }

    useEffect(() => {
        getInitialUserValue()
    }, [])

    // The context provider wraps its children and provides the current user state and auth functions.
    return (
        <UserContext.Provider value={{ user, login, register, logout, authChecked }}>
            { children } 
            {/* This renders any child components inside the provider */}
        </UserContext.Provider>
    );
}