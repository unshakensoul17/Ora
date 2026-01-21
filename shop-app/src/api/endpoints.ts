import apiClient from './client';
import { endpoints } from './config';
import {
    Shop,
    InventoryItem,
    Booking,
    DashboardStats,
    PaginatedResponse,
    ScanResult,
    CreateItemRequest,
    ScanQRRequest,
    LoginResponse,
} from './types';

// ============================================
// Authentication (Real API)
// ============================================

/**
 * Send OTP to shop owner phone
 */
export async function sendOtp(phone: string): Promise<{ success: boolean; message: string }> {
    const response = await apiClient.post(endpoints.sendOtp, { phone });
    return response.data;
}

/**
 * Verify OTP and login - returns JWT token and shop data
 */
export async function verifyOtp(phone: string, otp: string): Promise<LoginResponse> {
    const response = await apiClient.post(endpoints.verifyOtp, { phone, otp });
    return response.data;
}

// ============================================
// NEW: Password-Based Authentication
// ============================================

/**
 * Register shop with email + password
 */
export async function registerShop(data: {
    name: string;
    ownerName: string;
    ownerPhone: string;
    email: string;
    password: string;
    address: string;
    locality: string;
    city?: string;
    pincode: string;
    lat: number;
    lng: number;
}): Promise<{ success: boolean; message: string; shopId: string }> {
    const response = await apiClient.post('/auth/shop/register', data);
    return response.data;
}

/**
 * Verify email with OTP
 */
export async function verifyEmail(email: string, otp: string): Promise<{ success: boolean; message: string }> {
    const response = await apiClient.post('/auth/shop/verify-email', { email, otp });
    return response.data;
}

/**
 * Login with phone + password
 */
export async function loginWithPassword(phone: string, password: string): Promise<LoginResponse> {
    const response = await apiClient.post('/auth/shop/login', { phone, password });
    return response.data;
}

/**
 * Login with email + OTP (backup method)
 */
export async function loginWithEmailOTP(email: string, otp: string): Promise<LoginResponse> {
    const response = await apiClient.post('/auth/shop/login-email', { email, otp });
    return response.data;
}

/**
 * Send OTP to email
 */
export async function sendEmailOTP(email: string): Promise<{ success: boolean; message: string }> {
    const response = await apiClient.post('/auth/shop/send-email-otp', { email });
    return response.data;
}

/**
 * Forgot password - send OTP to email
 */
export async function forgotPassword(phone: string): Promise<{ success: boolean; message: string; maskedEmail: string }> {
    const response = await apiClient.post('/auth/shop/forgot-password', { phone });
    return response.data;
}

/**
 * Reset password with email OTP
 */
export async function resetPassword(email: string, otp: string, newPassword: string): Promise<{ success: boolean; message: string }> {
    const response = await apiClient.post('/auth/shop/reset-password', { email, otp, newPassword });
    return response.data;
}

// ============================================
// Shop Dashboard
// ============================================

/**
 * Get shop dashboard statistics
 */
export async function getShopDashboard(shopId: string): Promise<DashboardStats> {
    const response = await apiClient.get(endpoints.shopDashboard(shopId));
    return response.data;
}

/**
 * Get shop profile
 */
export async function getShopProfile(shopId: string): Promise<Shop> {
    const response = await apiClient.get(endpoints.shopProfile(shopId));
    return response.data;
}

/**
 * Update shop profile
 */
export async function updateShopProfile(shopId: string, data: Partial<Shop>): Promise<Shop> {
    const response = await apiClient.patch(endpoints.shopProfile(shopId), data);
    return response.data;
}

// ============================================
// Inventory
// ============================================

/**
 * Get shop's inventory items
 */
export async function getShopInventory(
    shopId: string,
    page = 1,
    limit = 20
): Promise<PaginatedResponse<InventoryItem>> {
    const response = await apiClient.get(endpoints.shopInventory(shopId), {
        params: { page, limit }
    });
    return response.data;
}

/**
 * Get single inventory item
 */
export async function getInventoryItem(itemId: string): Promise<InventoryItem> {
    const response = await apiClient.get(`/inventory/${itemId}`);
    return response.data;
}

/**
 * Create new inventory item
 */
export async function createInventoryItem(
    shopId: string,
    data: CreateItemRequest
): Promise<InventoryItem> {
    const response = await apiClient.post(endpoints.createItem(shopId), data);
    return response.data;
}

/**
 * Update inventory item
 */
export async function updateInventoryItem(
    itemId: string,
    data: Partial<CreateItemRequest>
): Promise<InventoryItem> {
    const response = await apiClient.patch(endpoints.updateItem(itemId), data);
    return response.data;
}

/**
 * Delete inventory item
 */
export async function deleteInventoryItem(itemId: string): Promise<void> {
    await apiClient.delete(endpoints.deleteItem(itemId));
}

/**
 * Upload inventory image to Supabase Storage
 */
export async function uploadInventoryImage(
    shopId: string,
    imageUri: string
): Promise<{ url: string; path: string }> {
    const formData = new FormData();

    // Get file info from URI
    const filename = imageUri.split('/').pop() || 'image.jpg';
    const match = /\.(\w+)$/.exec(filename);
    const type = match ? `image/${match[1]}` : 'image/jpeg';

    formData.append('file', {
        uri: imageUri,
        name: filename,
        type,
    } as any);

    const response = await apiClient.post(
        endpoints.uploadInventoryImage(shopId),
        formData,
        {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        }
    );

    return response.data;
}

// ============================================
// Bookings / Holds
// ============================================

/**
 * Get shop's active holds
 */
export async function getShopHolds(shopId: string): Promise<Booking[]> {
    const response = await apiClient.get(endpoints.shopHolds(shopId));
    return response.data.bookings || response.data;
}

/**
 * Get all shop bookings (for calendar)
 */
export async function getShopBookings(shopId: string): Promise<{ bookings: Booking[] }> {
    const response = await apiClient.get(endpoints.shopBookings(shopId));
    return { bookings: response.data.bookings || response.data || [] };
}

/**
 * Get booking details
 */
export async function getBookingDetails(bookingId: string): Promise<Booking> {
    const response = await apiClient.get(`/bookings/${bookingId}`);
    return response.data;
}

/**
 * Scan QR code to verify booking
 */
export async function scanQRCode(data: ScanQRRequest): Promise<ScanResult> {
    const response = await apiClient.post(endpoints.scan, data);
    return response.data;
}

/**
 * Mark booking as picked up
 */
export async function markPickedUp(bookingId: string): Promise<Booking> {
    const response = await apiClient.patch(endpoints.markPickup(bookingId));
    return response.data;
}

/**
 * Mark booking as returned
 */
export async function markReturned(bookingId: string): Promise<Booking> {
    const response = await apiClient.patch(endpoints.markReturn(bookingId));
    return response.data;
}

/**
 * Cancel booking
 */
export async function cancelBooking(bookingId: string, reason?: string): Promise<Booking> {
    const response = await apiClient.patch(`/bookings/${bookingId}/cancel`, { reason });
    return response.data;
}

// ============================================
// Calendar
// ============================================

/**
 * Get calendar availability for an item
 */
export async function getItemCalendar(
    itemId: string,
    startDate: string,
    endDate: string
): Promise<any[]> {
    const response = await apiClient.get(endpoints.itemCalendar(itemId), {
        params: { startDate, endDate }
    });
    return response.data;
}

// ============================================
// NEW: Extended Booking Management
// ============================================

/**
 * Get shop's pending holds (awaiting pickup)
 */
export async function getShopPendingHolds(shopId: string): Promise<Booking[]> {
    const response = await apiClient.get(`/bookings/shop/${shopId}/pending-holds`);
    return response.data;
}

/**
 * Get shop's active rentals (currently rented out)
 */
export async function getShopActiveRentals(shopId: string): Promise<Booking[]> {
    const response = await apiClient.get(`/bookings/shop/${shopId}/active-rentals`);
    return response.data;
}

/**
 * Get shop's booking history (completed/cancelled)
 */
export async function getShopBookingHistory(
    shopId: string,
    page = 1,
    limit = 20
): Promise<PaginatedResponse<Booking>> {
    const response = await apiClient.get(`/bookings/shop/${shopId}/history`, {
        params: { page, limit },
    });
    return response.data;
}

/**
 * Scan QR code to get booking details
 */
export async function scanBookingQR(qrCodeHash: string, shopId: string): Promise<{
    booking: Booking;
    canPickup: boolean;
    canReturn: boolean;
}> {
    const response = await apiClient.post('/bookings/scan-qr', {
        qrCodeHash,
        shopId,
    });
    return response.data;
}

// ============================================
// NEW: Extended Inventory Management
// ============================================

/**
 * Toggle inventory item status (ACTIVE <-> INACTIVE)
 */
export async function toggleInventoryStatus(itemId: string): Promise<InventoryItem> {
    const response = await apiClient.patch(`/inventory/${itemId}/toggle-status`);
    return response.data;
}

// ============================================
// NEW: Profile Management
// ============================================

/**
 * Change shop password
 */
export async function changeShopPassword(
    shopId: string,
    currentPassword: string,
    newPassword: string
): Promise<{ message: string }> {
    const response = await apiClient.post(`/shops/${shopId}/change-password`, {
        currentPassword,
        newPassword,
    });
    return response.data;
}
