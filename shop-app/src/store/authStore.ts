import { create } from 'zustand';
import { Shop } from '../api/types';
import {
    saveToken,
    getToken,
    saveShopData,
    getShopData,
    clearAuthData
} from './secureStore';

interface AuthState {
    isAuthenticated: boolean;
    isInitialized: boolean;
    shop: Shop | null;
    token: string | null;
    isLoading: boolean;

    // Actions
    initialize: () => Promise<void>;
    login: (shop: Shop, token: string) => Promise<void>;
    logout: () => Promise<void>;
    setLoading: (loading: boolean) => void;
    setShop: (shop: Shop) => void;
    updateShop: (shop: Partial<Shop>) => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
    isAuthenticated: false,
    isInitialized: false,
    shop: null,
    token: null,
    isLoading: false,

    /**
     * Initialize auth state from secure storage
     * Call this on app startup
     */
    initialize: async () => {
        try {
            console.log('Initializing auth store...');
            const [token, shop] = await Promise.all([
                getToken(),
                getShopData(),
            ]);

            console.log('Auth data loaded:', { hasToken: !!token, hasShop: !!shop });

            if (token && shop) {
                set({
                    isAuthenticated: true,
                    token,
                    shop,
                    isInitialized: true,
                    isLoading: false,
                });
                console.log('User authenticated');
            } else {
                set({ isInitialized: true, isLoading: false });
                console.log('No saved auth data found');
            }
        } catch (error) {
            console.error('Failed to initialize auth:', error);
            // Even if initialization fails, mark as initialized to show login screen
            set({
                isInitialized: true,
                isLoading: false,
                isAuthenticated: false,
                token: null,
                shop: null,
            });
        }
    },

    /**
     * Login user and persist auth data
     */
    login: async (shop: Shop, token: string) => {
        await Promise.all([
            saveToken(token),
            saveShopData(shop),
        ]);
        set({
            isAuthenticated: true,
            shop,
            token,
            isLoading: false,
        });
    },

    /**
     * Logout user and clear all auth data
     */
    logout: async () => {
        await clearAuthData();
        set({
            isAuthenticated: false,
            shop: null,
            token: null,
            isLoading: false,
        });
    },

    setLoading: (isLoading: boolean) => {
        set({ isLoading });
    },

    /**
     * Set shop data (complete replacement, e.g., after fetching fresh data)
     */
    setShop: (shop: Shop) => {
        set({ shop });
        saveShopData(shop);
    },

    /**
     * Update shop data (e.g., after profile edit)
     */
    updateShop: (updates: Partial<Shop>) => {
        const current = get().shop;
        if (current) {
            const updated = { ...current, ...updates };
            set({ shop: updated });
            saveShopData(updated);
        }
    },
}));
