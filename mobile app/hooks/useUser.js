// Import the useContext hook from React
import { useContext } from "react";

// Import the UserContext that was created earlier
import { UserContext } from '../contexts/UserContext';

// This is a custom hook named useUser
// It helps you easily access the UserContext values
export function useUser() {
    // Call useContext and pass in UserContext to retrieve its current value
    const context = useContext(UserContext);

    // Safety check:
    // If the hook is used outside a <UserProvider>, context will be undefined or null.
    // So we throw an error to let the developer know they are using it incorrectly.
    if (!context) {
        throw new Error("useUser must be used within a UserProvider");
    }

    // Return the context so the calling component can access user data and auth functions
    return context;
}
