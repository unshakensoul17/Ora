import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MeiliSearch, Index } from 'meilisearch';
import { InventoryItem } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class SearchService implements OnModuleInit {
    private client: MeiliSearch;
    private itemsIndex: Index;

    constructor(
        private configService: ConfigService,
        private prisma: PrismaService,
    ) {
        this.client = new MeiliSearch({
            host: this.configService.get('MEILISEARCH_URL', 'http://localhost:7700'),
            apiKey: this.configService.get('MEILISEARCH_API_KEY'),
        });
    }

    async onModuleInit() {
        try {
            // Create or get items index
            this.itemsIndex = this.client.index('items');

            // Configure searchable attributes
            await this.itemsIndex.updateSettings({
                searchableAttributes: [
                    'name',
                    'description',
                    'category',
                    'subcategory',
                    'brand',
                    'color',
                    'occasion',
                ],
                filterableAttributes: [
                    'category',
                    'size',
                    'rentalPrice',
                    'status',
                    'shopId',
                    'locality',
                ],
                sortableAttributes: ['rentalPrice', 'createdAt', 'timesRented'],
            });

            console.log('✅ MeiliSearch initialized');
        } catch (error) {
            console.error('❌ Failed to initialize MeiliSearch:', error);
        }
    }

    /**
     * Index an inventory item
     */
    async indexItem(item: InventoryItem & { shop?: { locality?: string } }) {
        try {
            await this.itemsIndex.addDocuments([
                {
                    id: item.id,
                    name: item.name,
                    description: item.description,
                    category: item.category,
                    subcategory: item.subcategory,
                    brand: item.brand,
                    color: item.color,
                    size: item.size,
                    rentalPrice: item.rentalPrice,
                    occasion: item.occasion,
                    status: item.status,
                    shopId: item.shopId,
                    locality: item.shop?.locality,
                    images: item.images,
                    createdAt: item.createdAt.getTime(),
                    timesRented: item.timesRented,
                },
            ], { primaryKey: 'id' });
        } catch (error) {
            console.error('Failed to index item:', error);
        }
    }

    /**
     * Remove item from index
     */
    async removeItem(itemId: string) {
        try {
            await this.itemsIndex.deleteDocument(itemId);
        } catch (error) {
            console.error('Failed to remove item from index:', error);
        }
    }

    /**
     * Search items with filters
     */
    async search(query: string, filters: {
        category?: string;
        size?: string;
        minPrice?: number;
        maxPrice?: number;
        locality?: string;
        page?: number;
        limit?: number;
    } = {}) {
        const page = filters.page || 1;
        const limit = filters.limit || 20;

        // Build filter array
        const filterConditions: string[] = ['status = "ACTIVE"'];

        if (filters.category) {
            filterConditions.push(`category = "${filters.category}"`);
        }
        if (filters.size) {
            filterConditions.push(`size = "${filters.size}"`);
        }
        if (filters.minPrice !== undefined) {
            filterConditions.push(`rentalPrice >= ${filters.minPrice}`);
        }
        if (filters.maxPrice !== undefined) {
            filterConditions.push(`rentalPrice <= ${filters.maxPrice}`);
        }
        if (filters.locality) {
            filterConditions.push(`locality = "${filters.locality}"`);
        }

        try {
            console.log('🔍 Attempting MeiliSearch query:', query, filters);
            const results = await this.itemsIndex.search(query, {
                filter: filterConditions.join(' AND '),
                offset: (page - 1) * limit,
                limit,
                sort: ['timesRented:desc'],
            });

            console.log(`📊 MeiliSearch results: ${results.hits.length} items found`);

            // If MeiliSearch returns no results, try database fallback
            if (results.hits.length === 0) {
                console.log('⚠️ MeiliSearch returned 0 results, trying database fallback');
                return this.fallbackDatabaseSearch(query, filters);
            }

            return {
                items: results.hits,
                pagination: {
                    page,
                    limit,
                    total: results.estimatedTotalHits,
                    processingTimeMs: results.processingTimeMs,
                },
            };
        } catch (error) {
            console.warn('⚠️ MeiliSearch error:', error.message);
            console.log('🔄 Falling back to database search');

            // Fallback to database search using marketplace items
            return this.fallbackDatabaseSearch(query, filters);
        }
    }

    /**
     * Fallback search using Prisma when MeiliSearch is unavailable
     */
    private async fallbackDatabaseSearch(query: string, filters: {
        category?: string;
        size?: string;
        minPrice?: number;
        maxPrice?: number;
        locality?: string;
        page?: number;
        limit?: number;
    }) {
        console.log('💾 Using database fallback search');
        const page = filters.page || 1;
        const limit = filters.limit || 20;
        const skip = (page - 1) * limit;

        const where: any = {
            status: 'ACTIVE',
            shop: { status: 'APPROVED' },
        };

        // Text search on name and description
        if (query) {
            where.OR = [
                { name: { contains: query, mode: 'insensitive' } },
                { description: { contains: query, mode: 'insensitive' } },
                { brand: { contains: query, mode: 'insensitive' } },
            ];
        }

        if (filters.category) where.category = filters.category;
        if (filters.size) where.size = filters.size;

        if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
            where.rentalPrice = {};
            if (filters.minPrice !== undefined) where.rentalPrice.gte = filters.minPrice;
            if (filters.maxPrice !== undefined) where.rentalPrice.lte = filters.maxPrice;
        }

        if (filters.locality) {
            where.shop = { ...where.shop, locality: filters.locality };
        }

        try {
            const [items, total] = await Promise.all([
                this.prisma.inventoryItem.findMany({
                    where,
                    include: {
                        shop: {
                            select: { locality: true },
                        },
                    },
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
        } catch (dbError) {
            console.error('❌ Database fallback also failed:', dbError);
            return {
                items: [],
                pagination: { page, limit, total: 0 },
                error: 'Search unavailable',
            };
        }
    }

    /**
     * Get search suggestions (autocomplete)
     */
    async getSuggestions(query: string, limit = 5) {
        try {
            const results = await this.itemsIndex.search(query, {
                limit,
                attributesToRetrieve: ['name', 'category', 'brand'],
            });

            return results.hits.map((hit) => ({
                name: hit.name,
                category: hit.category,
                brand: hit.brand,
            }));
        } catch (error) {
            return [];
        }
    }
}
