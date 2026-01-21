import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/v1';

const apiClient = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Types
export interface InventoryItem {
    id: string;
    name: string;
    description: string;
    category: string;
    subcategory: string;
    color: string;
    size: string;
    rentalPrice: number;
    retailPrice: number;
    securityDeposit: number;
    images: string[];
    occasion: string[];
    brand: string;
    status: string;
    condition: string;
    timesRented?: number;
    shop: {
        id: string;
        locality: string;
    };
}

export interface BookingHold {
    id: string;
    userId: string;
    itemId: string;
    shopId: string;
    startDate: string;      // Backend uses startDate
    endDate: string;        // Backend uses endDate
    status: 'HOLD' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED' | 'RENTED' | 'RETURNED' | 'DISPUTED';
    qrCodeHash: string;
    qrCodeUrl?: string;
    holdExpiresAt?: string; // Backend uses holdExpiresAt
    platformPrice?: number;
    depositAmount?: number;
    depositPaid?: boolean;
    verifiedAt?: string;
    pickedUpAt?: string;
    returnedAt?: string;
    cancelledAt?: string;
    cancelReason?: string;
    createdAt: string;
    updatedAt: string;
    inventoryItem: InventoryItem;
    item?: InventoryItem;   // Alias for compatibility
}

export interface CreateHoldRequest {
    userId: string;
    itemId: string;
    startDate: string;  // ISO 8601 format: YYYY-MM-DD
    endDate: string;    // ISO 8601 format: YYYY-MM-DD
}

export interface CreateHoldResponse {
    booking: BookingHold;
    qrCode: string;
}

// API Functions

// Inventory
export async function getMarketplaceItems(params?: {
    occasion?: string;
    size?: string;
    category?: string;
    page?: number;
    limit?: number;
}): Promise<{ items: InventoryItem[]; pagination: any }> {
    const response = await apiClient.get('/inventory/marketplace', { params });
    return response.data;
}

export async function getItemById(itemId: string): Promise<InventoryItem> {
    const response = await apiClient.get(`/inventory/${itemId}`);
    return response.data;
}

// Bookings
export async function createHold(data: CreateHoldRequest): Promise<CreateHoldResponse> {
    const response = await apiClient.post('/bookings/hold', data);
    return response.data;
}

export async function getUserHolds(userId: string): Promise<BookingHold[]> {
    const response = await apiClient.get(`/bookings/user/${userId}/holds`);
    return response.data;
}

export async function cancelHold(bookingId: string): Promise<void> {
    await apiClient.post(`/bookings/${bookingId}/cancel`);
}

// Calendar & Availability
export async function getItemAvailability(itemId: string, params?: {
    startDate?: string;
    endDate?: string;
}): Promise<any> {
    const response = await apiClient.get(`/calendar/item/${itemId}/availability`, { params });
    return response.data;
}

export async function getItemMonthlyCalendar(itemId: string, month: number, year: number): Promise<{
    date: string;
    status: 'available' | 'blocked' | 'hold' | 'maintenance';
    reason?: string;
}[]> {
    const response = await apiClient.get(`/calendar/item/${itemId}`, {
        params: { month, year }
    });
    return response.data;
}

// Search
export async function searchItems(params?: {
    q?: string;
    category?: string;
    size?: string;
    minPrice?: number;
    maxPrice?: number;
    locality?: string;
    page?: number;
    limit?: number;
}): Promise<{ items: InventoryItem[]; pagination: any }> {
    // Temporarily use marketplace endpoint (search has MeiliSearch dependency)
    console.log('🔍 Searching with params:', params);
    const response = await apiClient.get('/inventory/marketplace', { params });
    console.log('📊 Search results:', response.data.items.length, 'items');
    return response.data;
}

// Auth (Legacy OTP - keep for backward compatibility)
export async function sendOTP(phone: string): Promise<void> {
    await apiClient.post('/auth/user/send-otp', { phone });
}

export async function verifyOTP(phone: string, otp: string): Promise<{ token: string; user: any }> {
    const response = await apiClient.post('/auth/user/verify-otp', { phone, otp });
    return response.data;
}

// ============================================
// User Authentication (Email + Password)
// ============================================

export interface RegisterUserData {
    name: string;
    email: string;
    phone: string;
    password: string;
    city?: string;
}

export interface LoginResponse {
    token: string;
    user: {
        id: string;
        name: string;
        email: string;
        phone: string;
        city?: string;
        emailVerified: boolean;
    };
}

export async function registerUser(data: RegisterUserData): Promise<{ success: boolean; message: string; userId: string }> {
    const response = await apiClient.post('/auth/user/register', data);
    return response.data;
}

export async function verifyUserEmail(email: string, otp: string): Promise<{ success: boolean; message: string }> {
    const response = await apiClient.post('/auth/user/verify-email', { email, otp });
    return response.data;
}

export async function loginUser(email: string, password: string): Promise<LoginResponse> {
    const response = await apiClient.post('/auth/user/login', { email, password });
    return response.data;
}

export async function sendUserEmailOTP(email: string): Promise<{ success: boolean; message: string }> {
    const response = await apiClient.post('/auth/user/send-email-otp', { email });
    return response.data;
}

export async function forgotUserPassword(email: string): Promise<{ success: boolean; message: string; maskedEmail: string }> {
    const response = await apiClient.post('/auth/user/forgot-password', { email });
    return response.data;
}

export async function resetUserPassword(email: string, otp: string, newPassword: string): Promise<{ success: boolean; message: string }> {
    const response = await apiClient.post('/auth/user/reset-password', { email, otp, newPassword });
    return response.data;
}

// JWT Token Interceptor
export function setAuthToken(token: string | null) {
    if (token) {
        apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        localStorage.setItem('authToken', token);
    } else {
        delete apiClient.defaults.headers.common['Authorization'];
        localStorage.removeItem('authToken');
    }
}

// Initialize token from localStorage on app start
if (typeof window !== 'undefined') {
    const token = localStorage.getItem('authToken');
    if (token) {
        apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }
}

// Helper: Get Supabase image URL
export function getImageUrl(imagePath: string): string {
    if (!imagePath) {
        console.warn('getImageUrl called with empty imagePath');
        return '';
    }

    // If already a full URL, return as is
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
        console.log('Image already full URL:', imagePath);
        return imagePath;
    }

    // Construct Supabase storage URL
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://zkmkapeuqbyvjxdkiljx.supabase.co';
    const fullUrl = `${supabaseUrl}/storage/v1/object/public/inventory-images/${imagePath}`;
    console.log('Constructed image URL:', fullUrl);
    return fullUrl;
}

// Reviews & Orders
export interface ReviewData {
    rating: number;
    comment: string;
    bookingId: string;
    images?: string[];  // Optional image URLs for review
}

export async function getUserOrders(): Promise<{
    id: string;
    status: string;
    startDate: string;
    endDate: string;
    platformPrice: number;
    depositAmount: number;
    qrCodeUrl?: string;
    qrCodeHash?: string;
    item: InventoryItem;
    review?: {
        rating: number;
        comment: number;
    };
}[]> {
    const response = await apiClient.get('/bookings/user/my-orders');
    return response.data;
}

export async function createReview(data: ReviewData): Promise<void> {
    await apiClient.post('/reviews', data);
}

export async function getItemReviews(itemId: string): Promise<{
    reviews: Array<{
        id: string;
        rating: number;
        comment: string;
        images: string[];
        createdAt: string;
        user: { name: string };
        booking: { createdAt: string };
    }>;
    stats: {
        totalReviews: number;
        avgRating: number;
        distribution: Array<{ rating: number; count: number }>;
    };
}> {
    const response = await apiClient.get(`/reviews/item/${itemId}`);
    return response.data;
}

export async function getRecommendedItems(itemId: string): Promise<InventoryItem[]> {
    const response = await apiClient.get(`/inventory/${itemId}/recommendations`);
    return response.data;
}

// ============================================
// User Profile Management
// ============================================

export interface User {
    id: string;
    name: string;
    email: string;
    phone: string;
    city?: string;
    emailVerified?: boolean;
}

/**
 * Get current user profile
 */
export async function getUserProfile(userId: string): Promise<User> {
    const response = await apiClient.get(`/auth/user/profile`, { params: { userId } });
    return response.data.user; // Backend returns { user: {...} }
}

/**
 * Update user profile
 */
export async function updateUserProfile(userId: string, data: Partial<User>): Promise<User> {
    const response = await apiClient.put(`/auth/user/${userId}`, data);
    return response.data;
}

/**
 * Change user password
 */
export async function changeUserPassword(
    userId: string,
    currentPassword: string,
    newPassword: string
): Promise<{ message: string }> {
    const response = await apiClient.post(`/auth/user/${userId}/change-password`, {
        currentPassword,
        newPassword,
    });
    return response.data;
}

export { apiClient };
export default apiClient;
