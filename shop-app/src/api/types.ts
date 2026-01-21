// API Types for Shop App

// ============================================
// Common Types
// ============================================

export type BookingStatus = 'HOLD' | 'CONFIRMED' | 'RENTED' | 'RETURNED' | 'CANCELLED' | 'EXPIRED';
export type ItemStatus = 'ACTIVE' | 'RENTED' | 'MAINTENANCE' | 'INACTIVE';
export type Category = 'LEHENGA' | 'SHERWANI' | 'SAREE' | 'ANARKALI' | 'INDO_WESTERN' | 'GOWN' | 'SUIT' | 'OTHER';

// ============================================
// Entity Types
// ============================================

export interface Shop {
    id: string;
    name: string;
    ownerName: string;
    phone: string;
    email?: string;
    emailVerified?: boolean;
    locality: string;
    address: string;
    description?: string;
    lat?: number;
    lng?: number;
    tier: 'STARTER' | 'PRO';
    status: 'PENDING' | 'ACTIVE' | 'SUSPENDED';
}

export interface InventoryItem {
    id: string;
    name: string;
    category: Category;
    size: string;
    color?: string;
    brand?: string;
    description?: string;
    rentalPrice: number; // in paise
    securityDeposit: number; // in paise
    retailPrice?: number;
    images: string[];
    status: ItemStatus;
    shopId: string;
    shop?: {
        id: string;
        name: string;
        locality: string;
    };
    createdAt: string;
}

export interface Booking {
    id: string;
    status: BookingStatus;
    startDate: string;
    endDate: string;
    holdExpiresAt?: string;
    qrCodeHash?: string;
    user: {
        id: string;
        name: string;
        phone: string;
    };
    inventoryItem: InventoryItem;
    createdAt: string;
}

export interface User {
    id: string;
    name: string;
    phone: string;
    email?: string;
}

// ============================================
// API Response Types
// ============================================

export interface LoginResponse {
    success: boolean;
    shop: Shop;
    token?: string;
}

export interface DashboardStats {
    activeHolds: number;
    pendingPickups: number;
    activeRentals: number;
    totalItems: number;
    verifiedLeads: number;
    revenue: {
        thisMonth: number;
        lastMonth: number;
    };
}

export interface PaginatedResponse<T> {
    items: T[];
    total: number;
    page: number;
    limit: number;
    hasMore: boolean;
}

export interface ScanResult {
    verified: boolean;
    booking: {
        id: string;
        status: BookingStatus;
        user: { name: string; phone: string };
        item: { name: string; rentalPrice: number; securityDeposit: number };
        dates: { start: string; end: string };
    };
    canPickup: boolean;
    canReturn: boolean;
    message?: string;
}

// ============================================
// API Request Types
// ============================================

export interface CreateItemRequest {
    name: string;
    category: Category;
    size: string;
    color?: string;
    brand?: string;
    description?: string;
    rentalPrice: number;
    securityDeposit: number;
    retailPrice?: number;
    images?: string[];
}

export interface ScanQRRequest {
    bookingId: string;
    qrCodeHash: string;
    shopId: string;
}
