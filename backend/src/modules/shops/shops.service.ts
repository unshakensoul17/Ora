import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ShopStatus, PricingTier } from '@prisma/client';

@Injectable()
export class ShopsService {
    constructor(private prisma: PrismaService) { }

    /**
     * Register a new shop
     */
    async register(data: {
        name: string;
        ownerName: string;
        ownerPhone: string;
        email?: string;
        address: string;
        locality: string;
        city?: string;
        pincode: string;
        lat: number;
        lng: number;
        description?: string;
    }) {
        // Check if phone already registered
        const existing = await this.prisma.shop.findUnique({
            where: { ownerPhone: data.ownerPhone },
        });

        if (existing) {
            throw new BadRequestException('Phone number already registered');
        }

        const shop = await this.prisma.shop.create({
            data: {
                ...data,
                email: data.email || `${data.ownerPhone}@temp.com`, // Temporary email
                passwordHash: 'LEGACY_SHOP', // Legacy shops don't have passwords
                city: data.city || 'Indore',
                status: ShopStatus.PENDING,
                tier: PricingTier.STARTER,
            },
        });

        // Create billing record
        await this.prisma.shopBilling.create({
            data: { shopId: shop.id },
        });

        return shop;
    }

    /**
     * Get shop by ID
     */
    async findById(id: string) {
        const shop = await this.prisma.shop.findUnique({
            where: { id },
            include: {
                _count: { select: { inventoryItems: true } },
            },
        });

        if (!shop) {
            throw new NotFoundException('Shop not found');
        }

        return shop;
    }

    /**
     * Get shop dashboard stats
     */
    async getDashboardStats(shopId: string) {
        const [
            totalItems,
            activeItems,
            totalBookings,
            activeHolds,
            pendingPickups,
            activeRentals,
            verifiedLeads,
        ] = await Promise.all([
            this.prisma.inventoryItem.count({ where: { shopId } }),
            this.prisma.inventoryItem.count({
                where: { shopId, status: 'ACTIVE' },
            }),
            this.prisma.booking.count({
                where: { item: { shopId } },
            }),
            this.prisma.booking.count({
                where: {
                    item: { shopId },
                    status: 'HOLD',
                    holdExpiresAt: { gt: new Date() },
                },
            }),
            this.prisma.booking.count({
                where: {
                    item: { shopId },
                    status: 'CONFIRMED',
                },
            }),
            this.prisma.booking.count({
                where: {
                    item: { shopId },
                    status: 'RENTED',
                },
            }),
            this.prisma.attributionEvent.count({
                where: { shopId, billable: true },
            }),
        ]);

        return {
            inventory: {
                total: totalItems,
                active: activeItems,
            },
            bookings: {
                total: totalBookings,
                activeHolds,
                pendingPickups,
                activeRentals,
            },
            // Flatten for easier access in Shop App
            activeHolds,
            pendingPickups,
            activeRentals,
            totalItems,
            verifiedLeads,
        };
    }

    /**
     * Update shop profile
     */
    async updateProfile(
        shopId: string,
        data: Partial<{
            name: string;
            ownerName: string;
            email: string;
            address: string;
            locality: string;
            description: string;
            operatingHours: any;
            images: string[];
        }>,
    ) {
        return this.prisma.shop.update({
            where: { id: shopId },
            data,
        });
    }

    /**
     * Change shop password
     */
    async changePassword(shopId: string, currentPassword: string, newPassword: string) {
        const shop = await this.prisma.shop.findUnique({
            where: { id: shopId },
            select: { id: true, passwordHash: true },
        });

        if (!shop) {
            throw new NotFoundException('Shop not found');
        }

        // Import bcrypt
        const bcrypt = await import('bcrypt');

        // Verify current password
        const isValid = await bcrypt.compare(currentPassword, shop.passwordHash);
        if (!isValid) {
            throw new BadRequestException('Current password is incorrect');
        }

        // Hash new password
        const newPasswordHash = await bcrypt.hash(newPassword, 10);

        // Update password
        await this.prisma.shop.update({
            where: { id: shopId },
            data: { passwordHash: newPasswordHash },
        });

        return { message: 'Password changed successfully' };
    }

    // ============================================
    // Admin Operations
    // ============================================

    /**
     * Approve shop
     */
    async approve(shopId: string) {
        return this.prisma.shop.update({
            where: { id: shopId },
            data: {
                status: ShopStatus.APPROVED,
                verifiedAt: new Date(),
            },
        });
    }

    /**
     * Suspend shop
     */
    async suspend(shopId: string, reason: string) {
        return this.prisma.shop.update({
            where: { id: shopId },
            data: {
                status: ShopStatus.SUSPENDED,
                suspendedAt: new Date(),
                suspendReason: reason,
            },
        });
    }

    /**
     * Get all pending shops
     */
    async getPendingShops() {
        return this.prisma.shop.findMany({
            where: { status: ShopStatus.PENDING },
            orderBy: { createdAt: 'asc' },
        });
    }

    /**
     * Get shops for admin listing
     */
    async getShopsForAdmin(
        status?: ShopStatus,
        page?: number,
        limit?: number,
    ) {
        const where = status ? { status } : {};
        const pageNum = Number(page) || 1;
        const limitNum = Number(limit) || 20;
        const skip = (pageNum - 1) * limitNum;

        const [shops, total] = await Promise.all([
            this.prisma.shop.findMany({
                where,
                include: {
                    _count: { select: { inventoryItems: true, attributions: true } },
                },
                orderBy: { createdAt: 'desc' },
                skip,
                take: limitNum,
            }),
            this.prisma.shop.count({ where }),
        ]);

        return {
            shops,
            pagination: {
                page: pageNum,
                limit: limitNum,
                total,
                pages: Math.ceil(total / limitNum),
            },
        };
    }

    /**
     * Admin: Approve a pending shop
     */
    async approveShop(shopId: string) {
        const shop = await this.prisma.shop.update({
            where: { id: shopId },
            data: {
                status: ShopStatus.APPROVED,
                verifiedAt: new Date(),
            },
        });
        return shop;
    }

    /**
     * Admin: Suspend a shop
     */
    async suspendShop(shopId: string, reason?: string) {
        const shop = await this.prisma.shop.update({
            where: { id: shopId },
            data: {
                status: ShopStatus.SUSPENDED,
                suspendedAt: new Date(),
                suspendReason: reason || 'Suspended by admin',
            },
        });
        return shop;
    }

    /**
     * Admin: Reactivate a suspended shop
     */
    async reactivateShop(shopId: string) {
        const shop = await this.prisma.shop.update({
            where: { id: shopId },
            data: {
                status: ShopStatus.APPROVED,
                suspendedAt: null,
                suspendReason: null,
            },
        });
        return shop;
    }
}
