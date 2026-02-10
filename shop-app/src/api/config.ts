// API Configuration
// Change this to your computer's local IP address if running on a real phone
// e.g., 'http://192.168.1.5:3000/api/v1'
// For Android emulator, use '10.0.2.2' instead of 'localhost'

export const API_BASE_URL = "http://10.206.206.252:3000/api/v1";

// Endpoint paths
export const endpoints = {
    // Auth
    sendOtp: '/auth/shop/send-otp',
    verifyOtp: '/auth/shop/verify-otp',

    // Shop
    shopDashboard: (shopId: string) => `/shops/${shopId}/dashboard`,
    shopProfile: (shopId: string) => `/shops/${shopId}`,

    // Inventory
    shopInventory: (shopId: string) => `/inventory/shop/${shopId}`,
    createItem: (shopId: string) => `/inventory/shop/${shopId}`,
    updateItem: (itemId: string) => `/inventory/${itemId}`,
    deleteItem: (itemId: string) => `/inventory/${itemId}`,

    // Uploads
    uploadInventoryImage: (shopId: string) => `/uploads/inventory/${shopId}`,

    // Bookings
    shopHolds: (shopId: string) => `/bookings/shop/${shopId}/holds`,
    shopBookings: (shopId: string) => `/bookings/shop/${shopId}/all`,
    verifyQR: '/bookings/verify-qr',
    markPickup: (bookingId: string) => `/bookings/${bookingId}/pickup`,
    markReturn: (bookingId: string) => `/bookings/${bookingId}/return`,

    // Attribution (QR Scanning)
    scan: '/attribution/scan',

    // Calendar
    itemCalendar: (itemId: string) => `/calendar/${itemId}`,
};
