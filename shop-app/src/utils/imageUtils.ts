import { BASE_URL } from '../api/config';
import AsyncStorage from '@react-native-async-storage/async-storage';

const IMAGE_CACHE_KEY = 'image_cache_map';

export const getImageUrl = (path: string | undefined | null): string | null => {
    if (!path) return null;

    // specific valid https URLs
    if (path.startsWith('https://') || path.startsWith('http://')) {
        // If it points to localhost, replace with our BASE_URL host
        if (path.includes('localhost')) {
            return path.replace('http://localhost:3000', BASE_URL);
        }
        return path;
    }

    // specific relative paths
    if (path.startsWith('/')) {
        return `${BASE_URL}${path}`;
    }

    // just filename or other relative path
    return `${BASE_URL}/${path}`;
};

export const saveImageMapping = async (remotePath: string, localUri: string) => {
    try {
        const json = await AsyncStorage.getItem(IMAGE_CACHE_KEY);
        const map = json ? JSON.parse(json) : {};
        map[remotePath] = localUri;
        await AsyncStorage.setItem(IMAGE_CACHE_KEY, JSON.stringify(map));
    } catch (e) {
        console.error('Failed to save image mapping', e);
    }
};

export const getImageMappings = async (): Promise<Record<string, string>> => {
    try {
        const json = await AsyncStorage.getItem(IMAGE_CACHE_KEY);
        return json ? JSON.parse(json) : {};
    } catch (e) {
        console.error('Failed to get image mappings', e);
        return {};
    }
};
