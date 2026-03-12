import React, { useState, useEffect } from 'react';
import { AuthContext, type User } from './AuthContextInstance';
import { auth } from '../config/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { AuthClient } from '../domain/auth';

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [isInitialized, setIsInitialized] = useState(false);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            if (firebaseUser) {
                try {
                    const idToken = await firebaseUser.getIdToken();
                    setToken(idToken);

                    // Sync with backend to get org context and user ID
                    const data = await AuthClient.sync(idToken);
                    setUser(data.user);
                } catch (error) {
                    console.error('Failed to sync user with backend:', error);
                    setUser(null);
                    setToken(null);
                }
            } else {
                setUser(null);
                setToken(null);
            }
            setIsInitialized(true);
        });

        // Cleanup subscription on unmount
        return () => unsubscribe();
    }, []);

    const login = (newToken: string, newUser: User) => {
        setToken(newToken);
        setUser(newUser);
    };

    const logout = async () => {
        try {
            await auth.signOut();
        } catch (error) {
            console.error('Failed to sign out from Firebase', error);
        }
        setToken(null);
        setUser(null);
    };

    if (!isInitialized) {
        return null; // or a loading spinner
    }

    return (
        <AuthContext.Provider value={{ user, token, login, logout, isAuthenticated: !!token }}>
            {children}
        </AuthContext.Provider>
    );
};


