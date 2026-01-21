import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class AttributionService {
    private readonly LEAD_PRICE_PAISE = 5000; // ₹50 per verified lead

    constructor(private prisma: PrismaService) { }

    /**
     * Get attribution stats for a shop
     */
    async getShopStats(shopId: string, period?: { start: Date; end: Date }) {
        const where: any = { shopId, billable: true };

        if (period) {
            where.scannedAt = {
                gte: period.start,
                lte: period.end,
            };
        }

        const [totalLeads, billedLeads, pendingLeads] = await Promise.all([
            this.prisma.attributionEvent.count({ where }),
            this.prisma.attributionEvent.count({
                where: { ...where, billedAt: { not: null } },
            }),
            this.prisma.attributionEvent.count({
                where: { ...where, billedAt: null },
            }),
        ]);

        return {
            totalLeads,
            billedLeads,
            pendingLeads,
            pendingAmount: pendingLeads * this.LEAD_PRICE_PAISE,
            billedAmount: billedLeads * this.LEAD_PRICE_PAISE,
        };
    }

    /**
     * Get attribution event details
     */
    async getShopEvents(
        shopId: string,
        page = 1,
        limit = 20,
        billable?: boolean,
    ) {
        const where: any = { shopId };
        if (billable !== undefined) where.billable = billable;

        const pageNum = Number(page) || 1;
        const limitNum = Number(limit) || 20;
        const skip = (pageNum - 1) * limitNum;

        const [events, total] = await Promise.all([
            this.prisma.attributionEvent.findMany({
                where,
                include: {
                    booking: {
                        include: {
                            item: { // Map 'inventoryItem' in frontend
                                select: {
                                    name: true,
                                    shop: { select: { name: true, locality: true } },
                                },
                            },
                            user: { select: { name: true, phone: true } },
                        },
                    },
                },
                orderBy: { scannedAt: 'desc' },
                skip,
                take: limitNum,
            }),
            this.prisma.attributionEvent.count({ where }),
        ]);

        return {
            events,
            pagination: {
                page: pageNum,
                limit: limitNum,
                total,
                pages: Math.ceil(total / limitNum),
            },
        };
    }

    /**
     * Get all events for admin
     */
    async getAllEvents(
        page = 1,
        limit = 20,
    ) {
        const pageNum = Number(page) || 1;
        const limitNum = Number(limit) || 20;
        const skip = (pageNum - 1) * limitNum;

        const [events, total] = await Promise.all([
            this.prisma.attributionEvent.findMany({
                include: {
                    booking: {
                        include: {
                            item: {
                                select: {
                                    name: true,
                                    shop: { select: { name: true, locality: true } },
                                },
                            },
                            user: { select: { name: true, phone: true } },
                        },
                    },
                },
                orderBy: { scannedAt: 'desc' },
                skip,
                take: limitNum,
            }),
            this.prisma.attributionEvent.count(),
        ]);

        return {
            events,
            pagination: {
                page: pageNum,
                limit: limitNum,
                total,
                pages: Math.ceil(total / limitNum),
            },
        };
    }

    /**
     * Admin: Mark events as billed
     */
    async markBilled(eventIds: string[]) {
        await this.prisma.attributionEvent.updateMany({
            where: {
                id: { in: eventIds },
                billedAt: null,
            },
            data: {
                billedAt: new Date(),
                billedAmount: this.LEAD_PRICE_PAISE,
            },
        });

        return { billed: eventIds.length };
    }

    /**
     * Admin: Get platform-wide attribution stats
     */
    async getPlatformStats(period?: { start: Date; end: Date }) {
        const where: any = { billable: true };

        if (period) {
            where.scannedAt = {
                gte: period.start,
                lte: period.end,
            };
        }

        const [totalLeads, totalBilled, revenue] = await Promise.all([
            this.prisma.attributionEvent.count({ where }),
            this.prisma.attributionEvent.count({
                where: { ...where, billedAt: { not: null } },
            }),
            this.prisma.attributionEvent.aggregate({
                where: { ...where, billedAt: { not: null } },
                _sum: { billedAmount: true },
            }),
        ]);

        return {
            totalLeads,
            totalBilled,
            pendingLeads: totalLeads - totalBilled,
            totalRevenue: revenue._sum.billedAmount || 0,
            billedRevenue: revenue._sum.billedAmount || 0,
            pendingBilling: (totalLeads - totalBilled) * this.LEAD_PRICE_PAISE,
        };
    }
}
