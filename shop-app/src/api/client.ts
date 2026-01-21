import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';
import { API_BASE_URL } from './config';
import { getToken } from '../store/secureStore';

// Create axios instance with defaults
const apiClient: AxiosInstance = axios.create({
    baseURL: API_BASE_URL,
    timeout: 15000,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor - add auth token
apiClient.interceptors.request.use(
    async (config: InternalAxiosRequestConfig) => {
        // Get token from secure storage
        const token = await getToken();
        if (token && config.headers) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        console.log(`[API] ${config.method?.toUpperCase()} ${config.url}`);
        return config;
    },
    (error) => {
        console.error('[API] Request error:', error);
        return Promise.reject(error);
    }
);

// Response interceptor - handle common errors
apiClient.interceptors.response.use(
    (response) => {
        return response;
    },
    (error: AxiosError) => {
        if (error.response) {
            const status = error.response.status;
            const data = error.response.data as any;

            console.error(`[API] Error ${status}:`, data?.message || error.message);

            // Handle specific status codes
            if (status === 401) {
                // Unauthorized - token expired or invalid
                // The auth store will handle logout if needed
                console.warn('[API] Unauthorized - token may be expired');
            }

            // Return a user-friendly error message
            const message = data?.message || 'Something went wrong. Please try again.';
            return Promise.reject(new Error(message));
        } else if (error.request) {
            // Network error
            console.error('[API] Network error:', error.message);
            return Promise.reject(new Error('Unable to connect to server. Please check your internet connection.'));
        }

        return Promise.reject(error);
    }
);

export default apiClient;
