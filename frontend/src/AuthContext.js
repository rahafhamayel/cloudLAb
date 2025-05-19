import React, { createContext, useContext, useState, useEffect } from 'react';
// NEW IMPORTS for Amplify v6
import {
    getCurrentUser,
    signOut as amplifySignOut // Use an alias if 'signOut' is already defined in this scope
} from '@aws-amplify/auth';
// Correct import for listening to auth events in Amplify v6
import { Hub } from 'aws-amplify/utils'; // Import Hub from 'aws-amplify/utils'

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const checkUser = async () => {
            try {
                const cognitoUser = await getCurrentUser();
                setUser(cognitoUser);
                setIsAuthenticated(true);
            } catch (e) {
                setUser(null);
                setIsAuthenticated(false);
            }
            setLoading(false);
        };

        checkUser();

        // Use Hub.listen for auth events in Amplify v6
        const unsubscribe = Hub.listen('auth', ({ payload }) => {
            setLoading(true); // Set loading during auth state transitions
            switch (payload.event) {
                case 'signedIn':
                case 'autoSignIn': // Handles session restoration, Cognito Hosted UI success
                    checkUser(); // Re-check user on signIn or session restoration
                    break;
                case 'signedOut':
                    setUser(null);
                    setIsAuthenticated(false);
                    setLoading(false);
                    break;
                case 'signInWithRedirect_failure': // Hosted UI failure
                case 'signIn_failure': // Programmatic sign-in failure (if you add it)
                    console.error('Sign in failure', payload.data);
                    setUser(null);
                    setIsAuthenticated(false);
                    setLoading(false);
                    break;
                default:
                    setLoading(false); // Ensure loading is false for unhandled events
                    break;
            }
        });

        // Cleanup listener
        return unsubscribe; // The function returned by Hub.listen is the unsubscriber
    }, []);

    const signOut = async () => {
        setLoading(true);
        try {
            await amplifySignOut();
            // The Hub listener will handle setting user to null
        } catch (error) {
            console.error('Error signing out: ', error);
            setLoading(false);
        }
    };

    if (loading && !user) {
        return <div>Loading authentication status...</div>;
    }

    return (
        <AuthContext.Provider value={{ user, isAuthenticated, signOut, loading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);