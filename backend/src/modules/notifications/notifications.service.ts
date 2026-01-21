import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { NotificationType } from '@prisma/client';

@Injectable()
export class NotificationsService {
    constructor(private prisma: PrismaService) { }

    /**
     * Get or create notification preferences for a shop
     */
    async getPreferences(shopId: string) {
        let preferences = await this.prisma.notificationPreference.findUnique({
            where: { shopId },
        });

        if (!preferences) {
            // Create default preferences
            preferences = await this.prisma.notificationPreference.create({
                data: { shopId },
            });
        }

        return preferences;
    }

    /**
     * Update notification preferences
     */
    async updatePreferences(shopId: string, data: {
        pushEnabled?: boolean;
        emailEnabled?: boolean;
        smsEnabled?: boolean;
        newHolds?: boolean;
        pickups?: boolean;
        returns?: boolean;
        marketing?: boolean;
    }) {
        // Get or create first
        await this.getPreferences(shopId);

        // Then update
        return this.prisma.notificationPreference.update({
            where: { shopId },
            data,
        });
    }

    /**
     * Create a notification for a shop
     */
    async createNotification(shopId: string, data: {
        type: NotificationType;
        title: string;
        message: string;
    }) {
        return this.prisma.notification.create({
            data: {
                shopId,
                type: data.type,
                title: data.title,
                message: data.message,
            },
        });
    }

    /**
     * Get notifications for a shop
     */
    async getNotifications(shopId: string, limit: number = 50) {
        return this.prisma.notification.findMany({
            where: { shopId },
            orderBy: { createdAt: 'desc' },
            take: limit,
        });
    }

    /**
     * Get unread notifications count
     */
    async getUnreadCount(shopId: string) {
        return this.prisma.notification.count({
            where: {
                shopId,
                isRead: false,
            },
        });
    }

    /**
     * Mark notification as read
     */
    async markAsRead(notificationId: string, shopId: string) {
        return this.prisma.notification.updateMany({
            where: {
                id: notificationId,
                shopId: shopId,
            },
            data: {
                isRead: true,
            },
        });
    }

    /**
     * Mark all notifications as read
     */
    async markAllAsRead(shopId: string) {
        return this.prisma.notification.updateMany({
            where: {
                shopId,
                isRead: false,
            },
            data: {
                isRead: true,
            },
        });
    }

    /**
     * Delete old notifications (cleanup job)
     */
    async deleteOldNotifications(daysOld: number = 30) {
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - daysOld);

        return this.prisma.notification.deleteMany({
            where: {
                createdAt: {
                    lt: cutoffDate,
                },
                isRead: true,
            },
        });
    }

    /**
     * Send notification (checks preferences and creates notification)
     */
    async sendNotification(shopId: string, data: {
        type: NotificationType;
        title: string;
        message: string;
    }) {
        const preferences = await this.getPreferences(shopId);

        // Check if this type of notification is enabled
        const shouldSend = this.shouldSendNotification(preferences, data.type);

        if (!shouldSend) {
            return null;
        }

        // Create the notification
        const notification = await this.createNotification(shopId, data);

        // TODO: Send push notification if pushEnabled
        // TODO: Send email if emailEnabled
        // TODO: Send SMS if smsEnabled

        return notification;
    }

    /**
     * Check if notification should be sent based on preferences
     */
    private shouldSendNotification(preferences: any, type: NotificationType): boolean {
        switch (type) {
            case 'NEW_HOLD':
                return preferences.newHolds;
            case 'PICKUP_REMINDER':
                return preferences.pickups;
            case 'RETURN_REMINDER':
                return preferences.returns;
            case 'MARKETING':
                return preferences.marketing;
            default:
                return true; // System updates and payments always sent
        }
    }
}
