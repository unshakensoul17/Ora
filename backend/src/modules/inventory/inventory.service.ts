import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { SearchService } from '../search/search.service';
import { Category, ItemStatus } from '@prisma/client';

@Injectable()
export class InventoryService {
    constructor(
        private prisma: PrismaService,
        private search: SearchService,
    ) { }

    /**
     * Create inventory item
     */
    async create(
        shopId: string,
        data: {
            name: string;
            description?: string;
            category: Category;
            subcategory?: string;
            color?: string;
            size: string;
            sizeDetails?: any;
            rentalPrice: number;
            retailPrice?: number;
            securityDeposit: number;
            images: string[];
            occasion?: string[];
            brand?: string;
            sku?: string;
        },
    ) {
        // Check shop inventory limit for STARTER tier
        const shop = await this.prisma.shop.findUnique({
            where: { id: shopId },
            include: { _count: { select: { inventoryItems: true } } },
        });

        if (!shop) {
            throw new NotFoundException('Shop not found');
        }

        if (shop.tier === 'STARTER' && shop._count.inventoryItems >= 50) {
            throw new BadRequestException(
                'Starter tier limit reached (50 items). Upgrade to Pro for unlimited inventory.',
            );
        }

        const item = await this.prisma.inventoryItem.create({
            data: {
                ...data,
                shopId,
                status: ItemStatus.ACTIVE,
            },
        });

        // Index in MeiliSearch
        await this.search.indexItem(item);

        return item;
    }

    /**
     * Get item by ID
     */
    async findById(id: string) {
        const item = await this.prisma.inventoryItem.findUnique({
            where: { id },
            include: {
                shop: {
                    select: {
                        id: true,
                        name: true,
                        locality: true,
                        lat: true,
                        lng: true,
                    },
                },
            },
        });

        if (!item) {
            throw new NotFoundException('Item not found');
        }

        return item;
    }

    /**
     * Get shop inventory
     */
    async getShopInventory(
        shopId: string,
        filters?: {
            category?: Category;
            status?: ItemStatus;
            page?: number;
            limit?: number;
        },
    ) {
        const page = filters?.page || 1;
        const limit = filters?.limit || 20;
        const skip = (page - 1) * limit;

        const where: any = { shopId };
        if (filters?.category) where.category = filters.category;
        if (filters?.status) where.status = filters.status;

        const [items, total] = await Promise.all([
            this.prisma.inventoryItem.findMany({
                where,
                orderBy: { createdAt: 'desc' },
                skip,
                take: limit,
            }),
            this.prisma.inventoryItem.count({ where }),
        ]);

        return {
            items,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit),
            },
        };
    }

    /**
     * Update item
     */
    async update(
        itemId: string,
        data: Partial<{
            name: string;
            description: string;
            category: Category;
            color: string;
            size: string;
            sizeDetails: any;
            rentalPrice: number;
            securityDeposit: number;
            images: string[];
            occasion: string[];
            status: ItemStatus;
        }>,
    ) {
        const item = await this.prisma.inventoryItem.update({
            where: { id: itemId },
            data,
        });

        // Re-index in search
        await this.search.indexItem(item);

        return item;
    }

    /**
     * Delete item (soft delete - mark as retired)
     */
    async delete(itemId: string) {
        const item = await this.prisma.inventoryItem.update({
            where: { id: itemId },
            data: { status: ItemStatus.RETIRED },
        });

        // Remove from search index
        await this.search.removeItem(itemId);

        return item;
    }

    /**
     * Toggle item status (ACTIVE <-> INACTIVE)
     */
    async toggleStatus(itemId: string) {
        const item = await this.prisma.inventoryItem.findUnique({
            where: { id: itemId },
        });

        if (!item) {
            throw new NotFoundException('Item not found');
        }

        const newStatus = item.status === ItemStatus.ACTIVE
            ? ItemStatus.MAINTENANCE
            : ItemStatus.ACTIVE;

        const updatedItem = await this.prisma.inventoryItem.update({
            where: { id: itemId },
            data: { status: newStatus },
        });

        // Re-index in search
        if (newStatus === ItemStatus.ACTIVE) {
            await this.search.indexItem(updatedItem);
        } else {
            await this.search.removeItem(itemId);
        }

        return updatedItem;
    }

    /**
     * Get items for marketplace (public, masked shop info)
     */
    async getMarketplaceItems(filters: {
        category?: Category;
        size?: string;
        startDate?: Date;
        endDate?: Date;
        minPrice?: number;
        maxPrice?: number;
        locality?: string;
        page?: number;
        limit?: number;
    }) {
        const page = filters.page || 1;
        const limit = filters.limit || 20;
        const skip = (page - 1) * limit;

        const where: any = {
            status: ItemStatus.ACTIVE,
            shop: { status: 'APPROVED' },
        };

        if (filters.category) where.category = filters.category;
        if (filters.size) where.size = filters.size;
        if (filters.minPrice || filters.maxPrice) {
            where.rentalPrice = {};
            if (filters.minPrice) where.rentalPrice.gte = filters.minPrice;
            if (filters.maxPrice) where.rentalPrice.lte = filters.maxPrice;
        }
        if (filters.locality) {
            where.shop.locality = filters.locality;
        }

        const [items, total] = await Promise.all([
            this.prisma.inventoryItem.findMany({
                where,
                include: {
                    shop: {
                        select: {
                            locality: true, // Only locality, not shop name (masked)
                        },
                    },
                },
                orderBy: { createdAt: 'desc' },
                skip,
                take: limit,
            }),
            this.prisma.inventoryItem.count({ where }),
        ]);

        // Mask shop identity - only show locality
        const maskedItems = items.map((item) => ({
            ...item,
            shop: {
                locality: item.shop.locality,
            },
        }));

        return {
            items: maskedItems,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit),
            },
        };
    }
    /**
     * Get inventory for admin listing
     */
    async getInventoryForAdmin(
        page = 1,
        limit = 20,
    ) {
        const pageNum = Number(page) || 1;
        const limitNum = Number(limit) || 20;
        const skip = (pageNum - 1) * limitNum;

        const [items, total] = await Promise.all([
            this.prisma.inventoryItem.findMany({
                include: {
                    shop: {
                        select: {
                            id: true,
                            name: true,
                        },
                    },
                },
                orderBy: { createdAt: 'desc' },
                skip,
                take: limitNum,
            }),
            this.prisma.inventoryItem.count(),
        ]);

        return {
            items,
            pagination: {
                page: pageNum,
                limit: limitNum,
                total,
                pages: Math.ceil(total / limitNum),
            },
        };
    }

    /**
     * Get product recommendations for an item
     */
    async getRecommendations(itemId: string, limit = 6) {
        const item = await this.prisma.inventoryItem.findUnique({
            where: { id: itemId },
            select: { category: true, occasion: true, shopId: true },
        });

        if (!item) {
            return [];
        }

        return this.prisma.inventoryItem.findMany({
            where: {
                id: { not: itemId },
                status: ItemStatus.ACTIVE,
                shop: { status: 'APPROVED' },
                OR: [
                    { category: item.category },
                    { occasion: { hasSome: item.occasion || [] } },
                ],
            },
            include: {
                shop: {
                    select: {
                        locality: true,
                    },
                },
            },
            take: limit,
            orderBy: { createdAt: 'desc' },
        });
    }
}
