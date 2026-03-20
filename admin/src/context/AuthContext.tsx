'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { loginAdmin } from '@/lib/api';

interface AuthContextType {
    isAuthenticated: boolean;
    loading: boolean;
    login: (password: string) => Promise<void>;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
        if (typeof window !== 'undefined') {
            return !!localStorage.getItem('admin_token');
        }
        return false;
    });
    const [loading, setLoading] = useState<boolean>(true);
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        const token = localStorage.getItem('admin_token');
        if (token) {
            setIsAuthenticated(true);
        } else if (pathname !== '/login') {
            setIsAuthenticated(false);
            router.push('/login');
        } else {
            setIsAuthenticated(false);
        }
        setLoading(false);
    }, [pathname, router]);

    const login = async (password: string) => {
        try {
            const data = await loginAdmin(password);
            if (data.token) {
                localStorage.setItem('admin_token', data.token);
                setIsAuthenticated(true);
                router.push('/');
            }
        } catch (error) {
            console.error('Login failed:', error);
            throw error;
        }
    };

    const logout = () => {
        localStorage.removeItem('admin_token');
        setIsAuthenticated(false);
        router.push('/login');
    };

    return (
        <AuthContext.Provider value={{ isAuthenticated, loading, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
