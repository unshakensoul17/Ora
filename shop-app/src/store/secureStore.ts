import * as SecureStore from 'expo-secure-store';
import { Shop } from '../api/types';

const TOKEN_KEY = 'ora_shop_token';
const SHOP_KEY = 'ora_shop_data';

/**
 * Save authentication token securely
 */
export async function saveToken(token: string): Promise<void> {
    try {
        await SecureStore.setItemAsync(TOKEN_KEY, token);
    } catch (error) {
        console.error('Failed to save token:', error);
    }
}

/**
 * Get saved authentication token
 */
export async function getToken(): Promise<string | null> {
    try {
        return await SecureStore.getItemAsync(TOKEN_KEY);
    } catch (error) {
        console.error('Failed to get token:', error);
        return null;
    }
}

/**
 * Delete authentication token
 */
export async function deleteToken(): Promise<void> {
    try {
        await SecureStore.deleteItemAsync(TOKEN_KEY);
    } catch (error) {
        console.error('Failed to delete token:', error);
    }
}

/**
 * Save shop data
 */
export async function saveShopData(shop: Shop): Promise<void> {
    try {
        await SecureStore.setItemAsync(SHOP_KEY, JSON.stringify(shop));
    } catch (error) {
        console.error('Failed to save shop data:', error);
    }
}

/**
 * Get saved shop data
 */
export async function getShopData(): Promise<Shop | null> {
    try {
        const data = await SecureStore.getItemAsync(SHOP_KEY);
        return data ? JSON.parse(data) : null;
    } catch (error) {
        console.error('Failed to get shop data:', error);
        return null;
    }
}

/**
 * Delete shop data
 */
export async function deleteShopData(): Promise<void> {
    try {
        await SecureStore.deleteItemAsync(SHOP_KEY);
    } catch (error) {
        console.error('Failed to delete shop data:', error);
    }
}

/**
 * Clear all auth data (logout)
 */
export async function clearAuthData(): Promise<void> {
    await Promise.all([deleteToken(), deleteShopData()]);
}
