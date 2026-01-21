import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateReviewDto } from './dto/create-review.dto';

@Injectable()
export class ReviewsService {
    constructor(private prisma: PrismaService) { }

    async create(userId: string, dto: CreateReviewDto) {
        // 1. Validate Booking
        const booking = await this.prisma.booking.findUnique({
            where: { id: dto.bookingId },
            include: { item: true },
        });

        if (!booking) {
            throw new NotFoundException('Booking not found');
        }

        // 2. Check ownership
        if (booking.userId !== userId) {
            throw new BadRequestException('You can only review your own bookings');
        }

        // 3. Check if already reviewed
        const existingReview = await this.prisma.review.findUnique({
            where: { bookingId: dto.bookingId },
        });

        if (existingReview) {
            throw new BadRequestException('You have already reviewed this booking');
        }

        // 4. Create Review
        return this.prisma.review.create({
            data: {
                rating: dto.rating,
                comment: dto.comment,
                userId: userId,
                shopId: booking.item.shopId, // Link review to the shop
                itemId: booking.itemId,      // Link to the specific item
                bookingId: dto.bookingId,
                images: dto.images || [],
            },
        });
    }

    async findByShopId(shopId: string) {
        return this.prisma.review.findMany({
            where: { shopId },
            include: {
                user: {
                    select: { name: true },
                },
            },
            orderBy: { createdAt: 'desc' },
        });
    }
    async getGalleryReviews() {
        return this.prisma.review.findMany({
            where: {
                images: {
                    isEmpty: false, // Only reviews with images
                },
            },
            include: {
                user: {
                    select: { name: true },
                },
                item: {
                    select: {
                        name: true,
                        shop: {
                            select: { name: true, locality: true },
                        },
                    },
                },
            },
            take: 20, // Limit for now
            orderBy: { createdAt: 'desc' },
        });
    }

    async findByItemId(itemId: string) {
        const reviews = await this.prisma.review.findMany({
            where: { itemId },
            include: {
                user: {
                    select: { name: true },
                },
                booking: {
                    select: { createdAt: true },
                },
            },
            orderBy: { createdAt: 'desc' },
        });

        const stats = await this.calculateReviewStats(itemId);

        return {
            reviews,
            stats,
        };
    }

    async calculateReviewStats(itemId: string) {
        const reviews = await this.prisma.review.findMany({
            where: { itemId },
            select: { rating: true },
        });

        const totalReviews = reviews.length;
        const avgRating = totalReviews > 0
            ? reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews
            : 0;

        // Calculate distribution for each star rating (5 to 1)
        const distribution = [5, 4, 3, 2, 1].map(rating => ({
            rating,
            count: reviews.filter(r => r.rating === rating).length,
        }));

        return {
            totalReviews,
            avgRating: Math.round(avgRating * 10) / 10, // Round to 1 decimal
            distribution,
        };
    }
}
