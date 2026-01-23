import axios, { AxiosInstance } from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/v1';

const apiClient: AxiosInstance = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: 10000,
});

// Add request interceptor for logging
apiClient.interceptors.response.use(
    (response) => response,
    (error) => {
        console.error('API Error:', error.response?.data || error.message);
        throw error;
    }
);

// ============================================
// Types
// ============================================

export interface Shop {
    id: string;
    name: string;  // Backend uses 'name' not 'shopName'
    ownerName: string;
    ownerPhone: string;
    locality: string;
    address: string;
    city: string;
    pincode: string;
    status: 'PENDING' | 'APPROVED' | 'SUSPENDED';  // Backend uses these statuses
    email?: string;
    createdAt: string;
    updatedAt: string;
    _count?: {
        inventoryItems: number;  // Backend uses 'inventoryItems'
        attributions: number;
    };
}

export interface AttributionStats {
    totalEvents: number;
    verifiedEvents: number;
    pendingEvents: number;
    totalRevenue: number;
    billedRevenue: number;
    pendingBilling: number;
}

export interface AttributionEvent {
    id: string;
    amount: number; // calculated/mapped
    verifiedAt: string;
    booking: {
        id: string;
        user: {
            name: string;
            phone: string;
        };
        inventoryItem: {
            name: string;
            shop: {
                name: string;
                locality: string;
            };
        };
    };
}

export interface DashboardStats {
    totalShops: number;
    activeShops: number;
    pendingApproval: number;
    suspendedShops: number;
    totalLeads: number;
    todaysLeads: number;
    totalRevenue: number;
    todaysRevenue: number;
}

export interface Booking {
    id: string;
    userId: string;
    inventoryItemId: string;
    status: string;
    qrCode: string;
    startDate: string;
    endDate: string;
    createdAt: string;
    user?: {
        name: string;
        phone: string;
    };
    inventoryItem?: {
        name: string;
        rentalPrice: number;
        shop: {
            shopName: string;
        };
    };
}

export interface BillingData {
    shopId: string;
    shopName: string;
    totalLeads: number;
    totalRevenue: number;
    pendingAmount: number;
    lastPaymentDate?: string;
}


// ============================================
// Shops API
// ============================================

export async function getAllShops(status?: string, page?: number, limit?: number): Promise<Shop[]> {
    const params: any = {};
    if (status) params.status = status;
    if (page) params.page = page;
    if (limit) params.limit = limit;

    const response = await apiClient.get('/shops/admin/list', { params });
    // Backend returns { shops: [...], pagination: {...} }
    return response.data.shops || response.data;
}

export async function getPendingShops(): Promise<Shop[]> {
    const response = await apiClient.get('/shops/admin/pending');
    return response.data;
}

export async function getShopById(shopId: string): Promise<Shop> {
    const response = await apiClient.get(`/shops/${shopId}`);
    return response.data;
}

export async function getShopDashboard(shopId: string) {
    const response = await apiClient.get(`/shops/${shopId}/dashboard`);
    return response.data;
}

export async function approveShop(shopId: string): Promise<Shop> {
    const response = await apiClient.patch(`/shops/admin/${shopId}/approve`);
    return response.data;
}

export async function suspendShop(shopId: string, reason: string): Promise<Shop> {
    const response = await apiClient.patch(`/shops/admin/${shopId}/suspend`, { reason });
    return response.data;
}

export async function rejectShop(shopId: string): Promise<void> {
    // Reject = suspend with reason "rejected"
    await apiClient.patch(`/shops/admin/${shopId}/suspend`, { reason: 'Application rejected' });
}

export async function reactivateShop(shopId: string): Promise<Shop> {
    const response = await apiClient.patch(`/shops/admin/${shopId}/reactivate`);
    return response.data;
}

// ============================================
// Attribution / Leads API
// ============================================

export async function getPlatformStats(startDate?: string, endDate?: string): Promise<AttributionStats> {
    const params: any = {};
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;

    const response = await apiClient.get('/attribution/admin/stats', { params });
    const data = response.data;

    // Map backend response to frontend interface
    return {
        totalEvents: data.totalLeads,
        verifiedEvents: data.totalBilled,
        pendingEvents: data.pendingLeads,
        totalRevenue: data.totalRevenue / 100, // Convert paise to rupees
        billedRevenue: (data.billedRevenue || data.totalRevenue) / 100,
        pendingBilling: (data.pendingBilling || 0) / 100,
    };
}

export async function getAttributionEvents(page?: number, limit?: number): Promise<AttributionEvent[]> {
    const params: any = {};
    if (page) params.page = page;
    if (limit) params.limit = limit;

    const response = await apiClient.get('/attribution/admin/events', { params });
    const events = response.data.events || [];

    // Transform backend events to AttributionEvent interface
    return events.map((e: any) => ({
        id: e.id,
        amount: (e.billedAmount || 0) / 100, // Convert paise to rupees
        verifiedAt: e.scannedAt || e.verifiedAt,
        booking: {
            ...e.booking,
            inventoryItem: e.booking.item, // Map 'item' to 'inventoryItem'
        },
    }));
}

export async function getShopAttributionStats(shopId: string, startDate?: string, endDate?: string) {
    const params: any = {};
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;

    const response = await apiClient.get(`/attribution/shop/${shopId}/stats`, { params });
    return response.data;
}

export async function getShopAttributionEvents(shopId: string, page?: number, limit?: number, billable?: boolean) {
    const params: any = {};
    if (page) params.page = page;
    if (limit) params.limit = limit;
    if (billable !== undefined) params.billable = billable;

    const response = await apiClient.get(`/attribution/shop/${shopId}/events`, { params });
    return response.data;
}

export async function markEventsBilled(eventIds: string[]): Promise<void> {
    await apiClient.post('/attribution/admin/mark-billed', { eventIds });
}

// ============================================
// Bookings API
// ============================================

export async function getShopHolds(shopId: string): Promise<Booking[]> {
    const response = await apiClient.get(`/bookings/shop/${shopId}/holds`);
    return response.data;
}

export async function getUserHolds(userId: string): Promise<Booking[]> {
    const response = await apiClient.get(`/bookings/user/${userId}/holds`);
    return response.data;
}

// ============================================
// Dashboard Stats (Aggregated)
// ============================================

export async function getDashboardStats(): Promise<DashboardStats> {
    try {
        // Fetch shops to calculate stats
        const shops = await getAllShops();
        const platformStats = await getPlatformStats().catch(() => null);

        const activeShops = shops.filter(s => s.status === 'APPROVED').length;
        const pendingApproval = shops.filter(s => s.status === 'PENDING').length;
        const suspendedShops = shops.filter(s => s.status === 'SUSPENDED').length;

        return {
            totalShops: shops.length,
            activeShops,
            pendingApproval,
            suspendedShops,
            totalLeads: platformStats?.totalEvents || 0,
            todaysLeads: platformStats?.verifiedEvents || 0,
            totalRevenue: platformStats?.totalRevenue || 0,
            todaysRevenue: platformStats?.billedRevenue || 0,
        };
    } catch (error) {
        console.error('Failed to fetch dashboard stats:', error);
        throw error;
    }
}

// ============================================
// Inventory API
// ============================================

export async function getInventoryItems(shopId?: string, page?: number, limit?: number) {
    const params: any = {};
    if (page) params.page = page;
    if (limit) params.limit = limit;

    let response;
    if (shopId) {
        response = await apiClient.get(`/inventory/shop/${shopId}`, { params });
    } else {
        response = await apiClient.get('/inventory/admin/list', { params });
    }

    // Backend returns { items: [...], pagination: {...} }
    return response.data.items || response.data;
}

export async function getInventoryItem(itemId: string) {
    const response = await apiClient.get(`/inventory/${itemId}`);
    return response.data;
}

// ============================================
// Users API (Customer Users)
// ============================================

export async function getAllCustomerUsers(page?: number, limit?: number) {
    const params: any = {};
    if (page) params.page = page;
    if (limit) params.limit = limit;

    const response = await apiClient.get('/auth/admin/users', { params });
    return response.data;
}

// ============================================
// Audit Log / Security API
// ============================================

export async function getAuditLogs(page?: number, limit?: number) {
    const params: any = {};
    if (page) params.page = page;
    if (limit) params.limit = limit;

    const response = await apiClient.get('/admin/audit-logs', { params });
    return response.data;
}

// ============================================
// Bookings / Holds API
// ============================================

export async function getHolds(page?: number, limit?: number) {
    const params: any = {};
    if (page) params.page = page;
    if (limit) params.limit = limit;

    const response = await apiClient.get('/bookings/admin/holds', { params });
    return response.data;
}

// ============================================
// Billing API
// ============================================

export async function getBillingData(): Promise<BillingData[]> {
    try {
        // Fetch all shops
        const shops = await getAllShops();

        // For each shop, fetch attribution stats
        const billingPromises = shops.map(async (shop) => {
            try {
                const stats = await getShopAttributionStats(shop.id);
                return {
                    shopId: shop.id,
                    shopName: shop.name,
                    totalLeads: stats.totalLeads || 0,
                    totalRevenue: (stats.totalRevenue || 0) / 100, // Convert paise to rupees
                    pendingAmount: (stats.pendingBilling || 0) / 100,
                    lastPaymentDate: stats.lastBilledAt || undefined,
                };
            } catch (error) {
                // If stats fetch fails, return zero values
                return {
                    shopId: shop.id,
                    shopName: shop.name,
                    totalLeads: 0,
                    totalRevenue: 0,
                    pendingAmount: 0,
                };
            }
        });

        const billingData = await Promise.all(billingPromises);
        return billingData;
    } catch (error) {
        console.error('Failed to fetch billing data:', error);
        return [];
    }
}


// ============================================
// Export default client for direct use
// ============================================

export default apiClient;
