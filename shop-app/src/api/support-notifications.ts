// Support and Notifications API endpoints
// Appended to endpoints.ts

import apiClient from './client';
// ============================================
// Support Tickets
// ============================================

/**
 * Create a new support ticket
 */
export async function createSupportTicket(shopId: string, data: {
    category: 'GENERAL' | 'TECHNICAL' | 'BILLING' | 'OTHER';
    subject: string;
    message: string;
}) {
    const response = await apiClient.post('/support/tickets', {
        shopId,
        ...data,
    });
    return response.data;
}

/**
 * Get all support tickets for a shop
 */
export async function getShopTickets(shopId: string) {
    const response = await apiClient.get(`/support/tickets/shop/${shopId}`);
    return response.data;
}

/**
 * Get ticket statistics
 */
export async function getTicketStats(shopId: string) {
    const response = await apiClient.get(`/support/tickets/shop/${shopId}/stats`);
    return response.data;
}

// ============================================
// Notifications
// ============================================

/**
 * Get notification preferences
 */
export async function getNotificationPreferences(shopId: string) {
    const response = await apiClient.get(`/notifications/preferences/${shopId}`);
    return response.data;
}

/**
 * Update notification preferences
 */
export async function updateNotificationPreferences(shopId: string, data: {
    pushEnabled?: boolean;
    emailEnabled?: boolean;
    smsEnabled?: boolean;
    newHolds?: boolean;
    pickups?: boolean;
    returns?: boolean;
    marketing?: boolean;
}) {
    const response = await apiClient.put(`/notifications/preferences/${shopId}`, data);
    return response.data;
}

/**
 * Get notifications feed
 */
export async function getNotifications(shopId: string, limit: number = 50) {
    const response = await apiClient.get(`/notifications/${shopId}`, {
        params: { limit },
    });
    return response.data;
}

/**
 * Get unread notifications count
 */
export async function getUnreadCount(shopId: string) {
    const response = await apiClient.get(`/notifications/${shopId}/unread-count`);
    return response.data;
}

/**
 * Mark notification as read
 */
export async function markNotificationAsRead(notificationId: string, shopId: string) {
    const response = await apiClient.post(`/notifications/${notificationId}/read`, { shopId });
    return response.data;
}

/**
 * Mark all notifications as read
 */
export async function markAllNotificationsAsRead(shopId: string) {
    const response = await apiClient.post(`/notifications/shop/${shopId}/read-all`);
    return response.data;
}
