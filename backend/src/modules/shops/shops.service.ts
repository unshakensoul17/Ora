import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ShopStatus, PricingTier, BookingStatus } from '@prisma/client';
import { startOfMonth, endOfMonth, subMonths } from 'date-fns';

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
        const now = new Date();
        const startOfThisMonth = startOfMonth(now);
        const startOfLastMonth = startOfMonth(subMonths(now, 1));
        const endOfLastMonth = endOfMonth(subMonths(now, 1));
        const todayStart = new Date(now.setHours(0, 0, 0, 0));
        const todayEnd = new Date(now.setHours(23, 59, 59, 999));

        const [
            totalItems,
            activeItems,
            totalBookings,
            activeHolds,
            pendingPickups,
            activeRentals,
            verifiedLeads,
            revenueThisMonth,
            revenueLastMonth,
            itemStats,
            pickupsToday,
            returnsToday
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
            // Revenue This Month
            this.prisma.payment.aggregate({
                where: {
                    Booking: { shopId },
                    status: 'SUCCESS', // Schema has SUCCESS and COMPLETED, let's check
                    recordedAt: { gte: startOfThisMonth }
                },
                _sum: { amount: true }
            }),
            // Revenue Last Month
            this.prisma.payment.aggregate({
                where: {
                    Booking: { shopId },
                    status: 'SUCCESS',
                    recordedAt: { gte: startOfLastMonth, lte: endOfLastMonth }
                },
                _sum: { amount: true }
            }),
            // Popular categories
            this.prisma.inventoryItem.findMany({
                where: { shopId },
                select: { category: true, timesRented: true }
            }),
            // Pickups Today
            this.prisma.booking.count({
                where: {
                    item: { shopId },
                    status: { in: ['CONFIRMED', 'HOLD'] },
                    startDate: { gte: todayStart, lte: todayEnd }
                }
            }),
            // Returns Today
            this.prisma.booking.count({
                where: {
                    item: { shopId },
                    status: 'RENTED',
                    endDate: { gte: todayStart, lte: todayEnd }
                }
            })
        ]);

        // Aggregate category stats in JS
        const categoryMap: Record<string, number> = {};
        itemStats.forEach(item => {
            categoryMap[item.category] = (categoryMap[item.category] || 0) + item.timesRented;
        });
        const topCategories = Object.entries(categoryMap)
            .map(([name, count]) => ({ name, count }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 3);

        const revThis = revenueThisMonth._sum.amount || 0;
        const revLast = revenueLastMonth._sum.amount || 0;
        const revenueGrowth = revLast > 0 ? ((revThis - revLast) / revLast) * 100 : 0;

        return {
            inventory: {
                total: totalItems,
                active: activeItems,
                utilization: totalItems > 0 ? Math.round((activeRentals / totalItems) * 100) : 0
            },
            bookings: {
                total: totalBookings,
                activeHolds,
                pendingPickups,
                activeRentals,
                pickupsToday,
                returnsToday
            },
            revenue: {
                thisMonth: revThis,
                lastMonth: revLast,
                growth: Math.round(revenueGrowth)
            },
            analysis: {
                topCategories,
                verifiedLeads,
                efficiency: {
                    avgRentalPrice: totalBookings > 0 ? Math.round(revThis / totalBookings) : 0
                }
            },
            // Flatten for backward compatibility
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
