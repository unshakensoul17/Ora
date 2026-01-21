'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import {
    loginUser,
    setAuthToken,
    getUserProfile,
    LoginResponse,
    updateUserProfile,
} from '@/lib/api';

interface User {
    id: string;
    name: string;
    email: string;
    phone: string;
    city?: string;
    emailVerified?: boolean;
}

interface AuthContextType {
    user: User | null;
    loading: boolean;
    login: (email: string, password: string) => Promise<void>;
    logout: () => void;
    updateProfile: (data: { name?: string; phone?: string; city?: string }) => Promise<void>;
    refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    // Load user from token on mount
    useEffect(() => {
        loadUserFromToken();
    }, []);

    async function loadUserFromToken() {
        try {
            const token = localStorage.getItem('authToken');
            const userId = localStorage.getItem('userId');

            if (!token || !userId) {
                setLoading(false);
                return;
            }

            // Set token for API calls
            setAuthToken(token);

            // Fetch user profile
            const userData = await getUserProfile(userId);
            setUser(userData);
        } catch (error) {
            console.error('Failed to load user:', error);
            // Invalid token, clear it
            setAuthToken(null);
            localStorage.removeItem('userId');
        } finally {
            setLoading(false);
        }
    }

    async function login(email: string, password: string) {
        const response: LoginResponse = await loginUser(email, password);
        setAuthToken(response.token);
        localStorage.setItem('userId', response.user.id);
        setUser(response.user);
    }

    function logout() {
        setAuthToken(null);
        localStorage.removeItem('userId');
        setUser(null);
    }

    async function updateProfile(data: { name?: string; phone?: string; city?: string }) {
        if (!user) throw new Error('No user logged in');

        const updatedUser = await updateUserProfile(user.id, data);
        setUser(updatedUser);
    }

    async function refreshUser() {
        if (!user) return;
        const userData = await getUserProfile(user.id);
        setUser(userData);
    }

    const value = {
        user,
        loading,
        login,
        logout,
        updateProfile,
        refreshUser,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
