import {
    Injectable,
    ConflictException,
    NotFoundException,
    BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { RedisService } from '../../redis/redis.service';
import { CalendarService } from '../calendar/calendar.service';
import { BookingStatus } from '@prisma/client';
import { format, addDays, eachDayOfInterval, addHours } from 'date-fns';
import * as crypto from 'crypto';
import * as QRCode from 'qrcode';

@Injectable()
export class BookingsService {
    private readonly HOLD_TTL_SECONDS = 4 * 60 * 60; // 4 hours

    constructor(
        private prisma: PrismaService,
        private redis: RedisService,
        private calendar: CalendarService,
    ) { }

    /**
     * Calculate total rental price based on duration
     * @param dailyPrice - Per-day rental price in paise
     * @param startDate - Start date
     * @param endDate - End date
     * @returns Total price in paise (excluding deposit)
     */
    private calculateRentalPrice(
        dailyPrice: number,
        startDate: Date,
        endDate: Date,
    ): number {
        // Calculate number of days (inclusive of both dates)
        const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

        // Minimum 1 day rental
        const rentalDays = Math.max(diffDays, 1);

        return dailyPrice * rentalDays;
    }

    /**
     * Create a hold (Reserve for Trial)
     * This is the core O2O flow entry point
     */
    async createHold(
        userId: string,
        itemId: string,
        startDate: Date,
        endDate: Date,
    ) {
        // 1. Validate item exists and is active
        const item = await this.prisma.inventoryItem.findUnique({
            where: { id: itemId },
            include: { shop: true },
        });

        if (!item) {
            throw new NotFoundException('Item not found');
        }

        if (item.status !== 'ACTIVE') {
            throw new BadRequestException('Item is not available for rental');
        }

        // 2. Check calendar availability (includes buffer days)
        const isAvailable = await this.calendar.isAvailable(
            itemId,
            startDate,
            endDate,
        );

        if (!isAvailable) {
            throw new ConflictException('Item is not available for selected dates');
        }

        // 3. Get all dates that need to be locked (including buffers)
        const allDates = this.getDateStrings(startDate, endDate, true);

        // 4. Acquire Redis lock
        const lockAcquired = await this.redis.acquireHoldLock(
            itemId,
            allDates,
            userId,
            this.HOLD_TTL_SECONDS,
        );

        if (!lockAcquired) {
            throw new ConflictException(
                'Item is currently being held by another user',
            );
        }

        try {
            // 5. Generate unique QR code hash
            const qrCodeHash = crypto.randomBytes(16).toString('hex');

            // 6. Create booking with HOLD status (without QR URL first)
            const booking = await this.prisma.booking.create({
                data: {
                    userId,
                    itemId,
                    shopId: item.shopId,
                    startDate,
                    endDate,
                    status: BookingStatus.HOLD,
                    qrCodeHash,
                    qrCodeUrl: null, // Will update after generating QR
                    holdExpiresAt: addHours(new Date(), 4),
                    platformPrice: this.calculateRentalPrice(
                        item.rentalPrice,
                        startDate,
                        endDate,
                    ),
                    depositAmount: item.securityDeposit,
                },
                include: {
                    item: {
                        include: {
                            shop: {
                                select: {
                                    id: true,
                                    name: true,
                                    locality: true,
                                    address: true,
                                    lat: true,
                                    lng: true,
                                },
                            },
                        },
                    },
                },
            });

            // 7. Generate QR code with URL format that Shop App expects
            const qrData = `fashcycle://booking/${booking.id}?hash=${qrCodeHash}`;
            const qrCodeUrl = await QRCode.toDataURL(qrData, {
                width: 300,
                margin: 2,
                color: {
                    dark: '#022b1e',
                    light: '#ffffff',
                },
            });

            // 8. Update booking with QR code URL
            await this.prisma.booking.update({
                where: { id: booking.id },
                data: { qrCodeUrl },
            });

            // 8. Create availability blocks in database
            await this.calendar.createBookingBlocks(
                itemId,
                startDate,
                endDate,
                booking.id,
                true, // isHold = true
            );

            return {
                bookingId: booking.id,
                qrCodeHash: booking.qrCodeHash,
                qrCodeUrl: booking.qrCodeUrl,
                expiresAt: booking.holdExpiresAt,
                item: {
                    id: item.id,
                    name: item.name,
                    images: item.images,
                    rentalPrice: item.rentalPrice,
                    securityDeposit: item.securityDeposit,
                },
                shop: booking.item.shop,
                dates: {
                    start: startDate,
                    end: endDate,
                },
            };
        } catch (error) {
            // On any error, release the lock
            await this.redis.releaseHoldLock(itemId, allDates);
            throw error;
        }
    }

    /**
     * Verify QR code (Shop scans customer's QR)
     * This is the O2O handshake - confirms walk-in
     */
    async verifyQRCode(qrCodeHash: string, shopId: string, scannedBy?: string) {
        // 1. Find booking by QR hash
        const booking = await this.prisma.booking.findUnique({
            where: { qrCodeHash },
            include: {
                item: { include: { shop: true } },
                user: true,
            },
        });

        if (!booking) {
            throw new NotFoundException('Invalid QR code');
        }

        // 2. Validate booking is a hold and not expired
        if (booking.status !== BookingStatus.HOLD) {
            throw new BadRequestException(
                `Booking is not a hold (status: ${booking.status})`,
            );
        }

        if (booking.holdExpiresAt && booking.holdExpiresAt < new Date()) {
            throw new BadRequestException('Hold has expired');
        }

        // 3. Validate shop matches
        if (booking.item.shop.id !== shopId) {
            throw new BadRequestException('QR code belongs to a different shop');
        }

        // 4. Update booking to CONFIRMED
        const updatedBooking = await this.prisma.booking.update({
            where: { id: booking.id },
            data: {
                status: BookingStatus.CONFIRMED,
                verifiedAt: new Date(),
            },
        });

        // 5. Convert hold blocks to rental blocks
        await this.calendar.confirmHoldBlocks(booking.id);

        // 6. Create attribution event (billable lead)
        const attribution = await this.prisma.attributionEvent.create({
            data: {
                bookingId: booking.id,
                shopId,
                scannedBy,
                billable: true,
                billedAmount: 5000, // ₹50 in paise
            },
        });

        // 7. Release Redis lock (no longer needed after verification)
        const allDates = this.getDateStrings(
            booking.startDate,
            booking.endDate,
            true,
        );
        await this.redis.releaseHoldLock(booking.itemId, allDates);

        return {
            verified: true,
            bookingId: booking.id,
            customer: {
                name: booking.user.name,
                phone: booking.user.phone,
            },
            item: {
                id: booking.item.id,
                name: booking.item.name,
            },
            dates: {
                start: booking.startDate,
                end: booking.endDate,
            },
            pricing: {
                rentalPrice: booking.platformPrice,
                securityDeposit: booking.depositAmount,
            },
            attributionId: attribution.id,
        };
    }

    /**
     * Cancel a hold (user cancels or timeout)
     */
    async cancelHold(bookingId: string, reason?: string) {
        const booking = await this.prisma.booking.findUnique({
            where: { id: bookingId },
        });

        if (!booking) {
            throw new NotFoundException('Booking not found');
        }

        if (booking.status !== BookingStatus.HOLD) {
            throw new BadRequestException('Only holds can be cancelled');
        }

        // 1. Update booking status
        await this.prisma.booking.update({
            where: { id: bookingId },
            data: {
                status: BookingStatus.CANCELLED,
                cancelledAt: new Date(),
                cancelReason: reason || 'User cancelled',
            },
        });

        // 2. Remove availability blocks
        await this.calendar.removeBookingBlocks(bookingId);

        // 3. Release Redis lock
        const allDates = this.getDateStrings(
            booking.startDate,
            booking.endDate,
            true,
        );
        await this.redis.releaseHoldLock(booking.itemId, allDates);

        return { cancelled: true };
    }

    /**
     * Mark item as picked up
     */
    async markPickedUp(bookingId: string) {
        const booking = await this.prisma.booking.findUnique({
            where: { id: bookingId },
        });

        if (!booking) {
            throw new NotFoundException('Booking not found');
        }

        // Allow pickup for both HOLD and CONFIRMED bookings
        if (booking.status !== BookingStatus.CONFIRMED && booking.status !== BookingStatus.HOLD) {
            throw new BadRequestException(
                `Booking must be in HOLD or CONFIRMED status for pickup (current status: ${booking.status})`,
            );
        }

        return this.prisma.booking.update({
            where: { id: bookingId },
            data: {
                status: BookingStatus.RENTED,
                pickedUpAt: new Date(),
                depositPaid: true,
                verifiedAt: booking.verifiedAt || new Date(), // Set verifiedAt if not already set
            },
        });
    }

    /**
     * Mark item as returned
     */
    async markReturned(bookingId: string) {
        const booking = await this.prisma.booking.findUnique({
            where: { id: bookingId },
            include: { item: true },
        });

        if (!booking) {
            throw new NotFoundException('Booking not found');
        }

        if (booking.status !== BookingStatus.RENTED) {
            throw new BadRequestException('Item must be rented before return');
        }

        // Update booking
        const updatedBooking = await this.prisma.booking.update({
            where: { id: bookingId },
            data: {
                status: BookingStatus.RETURNED,
                returnedAt: new Date(),
            },
        });

        // Update item stats
        await this.prisma.inventoryItem.update({
            where: { id: booking.itemId },
            data: {
                timesRented: { increment: 1 },
                lastRentedAt: new Date(),
            },
        });

        return updatedBooking;
    }

    /**
     * Cancel a booking/hold
     */
    async cancelBooking(bookingId: string) {
        const booking = await this.prisma.booking.findUnique({
            where: { id: bookingId },
        });

        if (!booking) {
            throw new NotFoundException('Booking not found');
        }

        // Can only cancel HOLD or CONFIRMED bookings
        if (booking.status !== BookingStatus.HOLD && booking.status !== BookingStatus.CONFIRMED) {
            throw new BadRequestException('Only pending holds can be cancelled');
        }

        // Update booking status to CANCELLED
        const updatedBooking = await this.prisma.booking.update({
            where: { id: bookingId },
            data: {
                status: BookingStatus.CANCELLED,
            },
        });

        return updatedBooking;
    }

    /**
     * Get user's active holds
     */
    async getUserHolds(userId: string) {
        return this.prisma.booking.findMany({
            where: {
                userId,
                status: BookingStatus.HOLD,
                holdExpiresAt: { gt: new Date() },
            },
            include: {
                item: {
                    include: {
                        shop: {
                            select: {
                                id: true,
                                name: true,
                                locality: true,
                                address: true,
                                lat: true,
                                lng: true,
                            },
                        },
                    },
                },
            },
            orderBy: { createdAt: 'desc' },
        });
    }

    /**
     * Get user's past bookings (My Orders)
     */
    async getUserBookings(userId: string) {
        return this.prisma.booking.findMany({
            where: {
                userId,
                status: { not: BookingStatus.HOLD }, // Everything except active holds
            },
            include: {
                item: {
                    include: {
                        shop: true,
                    },
                },
                review: true, // successful join after schema update
            },
            orderBy: { createdAt: 'desc' },
        });
    }

    /**
     * Get shop's pending holds
     */
    async getShopHolds(shopId: string) {
        return this.prisma.booking.findMany({
            where: {
                item: { shopId },
                status: BookingStatus.HOLD,
                holdExpiresAt: { gt: new Date() },
            },
            include: {
                item: true,
                user: {
                    select: { id: true, name: true, phone: true },
                },
            },
            orderBy: { holdExpiresAt: 'asc' },
        });
    }

    /**
     * Get all shop bookings (for calendar)
     */
    async getShopBookings(shopId: string) {
        return this.prisma.booking.findMany({
            where: {
                item: { shopId },
                // Don't filter by status, get everything except maybe cancelled if desirable? 
                // Let's get everything for now to show full history
            },
            include: {
                item: true,
                user: {
                    select: { id: true, name: true, phone: true },
                },
            },
            orderBy: { startDate: 'asc' },
        });
    }

    /**
     * Helper: Get date strings for locking
     */
    private getDateStrings(
        startDate: Date,
        endDate: Date,
        includeBuffers: boolean,
    ): string[] {
        const start = includeBuffers
            ? addDays(startDate, -1)
            : startDate;
        const end = includeBuffers ? addDays(endDate, 1) : endDate;

        return eachDayOfInterval({ start, end }).map((d) =>
            format(d, 'yyyy-MM-dd'),
        );
    }

    /**
     * Admin: Get all holds
     */
    async getAllHolds(page = 1, limit = 20) {
        const pageNum = Number(page) || 1;
        const limitNum = Number(limit) || 20;
        const skip = (pageNum - 1) * limitNum;

        const [bookings, total] = await Promise.all([
            this.prisma.booking.findMany({
                where: {
                    status: BookingStatus.HOLD,
                },
                include: {
                    item: {
                        include: {
                            shop: {
                                select: {
                                    id: true,
                                    name: true,
                                    locality: true,
                                },
                            },
                        },
                    },
                    user: {
                        select: {
                            id: true,
                            name: true,
                            phone: true,
                        },
                    },
                },
                orderBy: { createdAt: 'desc' },
                skip,
                take: limitNum,
            }),
            this.prisma.booking.count({
                where: { status: BookingStatus.HOLD },
            }),
        ]);

        return {
            bookings,
            pagination: {
                page: pageNum,
                limit: limitNum,
                total,
                pages: Math.ceil(total / limitNum),
            },
        };
    }

    /**
     * Get shop's pending holds (awaiting pickup)
     */
    async getShopPendingHolds(shopId: string) {
        return this.prisma.booking.findMany({
            where: {
                item: { shopId },
                status: {
                    in: [BookingStatus.HOLD, BookingStatus.CONFIRMED],
                },
            },
            include: {
                item: {
                    select: {
                        id: true,
                        name: true,
                        images: true,
                        category: true,
                    },
                },
                user: {
                    select: { id: true, name: true, phone: true },
                },
            },
            orderBy: { createdAt: 'desc' },
        });
    }

    /**
     * Get shop's active rentals (currently rented out)
     */
    async getShopActiveRentals(shopId: string) {
        return this.prisma.booking.findMany({
            where: {
                item: { shopId },
                status: BookingStatus.RENTED,
            },
            include: {
                item: {
                    select: {
                        id: true,
                        name: true,
                        images: true,
                        category: true,
                    },
                },
                user: {
                    select: { id: true, name: true, phone: true },
                },
            },
            orderBy: { startDate: 'asc' },
        });
    }

    /**
     * Get shop's booking history
     */
    async getShopBookingHistory(shopId: string, page = 1, limit = 20) {
        const skip = (page - 1) * limit;

        const [bookings, total] = await Promise.all([
            this.prisma.booking.findMany({
                where: {
                    item: { shopId },
                    status: {
                        in: [BookingStatus.RETURNED, BookingStatus.CANCELLED],
                    },
                },
                include: {
                    item: {
                        select: {
                            id: true,
                            name: true,
                            images: true,
                            category: true,
                        },
                    },
                    user: {
                        select: { id: true, name: true, phone: true },
                    },
                },
                orderBy: { updatedAt: 'desc' },
                skip,
                take: limit,
            }),
            this.prisma.booking.count({
                where: {
                    item: { shopId },
                    status: {
                        in: [BookingStatus.RETURNED, BookingStatus.CANCELLED],
                    },
                },
            }),
        ]);

        return {
            bookings,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit),
            },
        };
    }

    /**
     * Scan QR code and return booking details
     */
    async scanQR(qrCodeHash: string, shopId: string) {
        const booking = await this.prisma.booking.findFirst({
            where: { qrCodeHash },
            include: {
                item: {
                    include: {
                        shop: { select: { id: true, name: true } },
                    },
                },
                user: {
                    select: { id: true, name: true, phone: true, email: true },
                },
            },
        });

        if (!booking) {
            throw new NotFoundException('Invalid QR code');
        }

        // Verify this QR belongs to shop's inventory
        if (booking.item.shop.id !== shopId) {
            throw new BadRequestException('This booking does not belong to your shop');
        }

        return {
            booking: {
                id: booking.id,
                status: booking.status,
                user: {
                    name: booking.user.name,
                    phone: booking.user.phone,
                },
                item: {
                    name: booking.item.name,
                    rentalPrice: booking.item.rentalPrice,
                    securityDeposit: booking.item.securityDeposit,
                },
                dates: {
                    start: booking.startDate.toISOString(),
                    end: booking.endDate.toISOString(),
                },
            },
            canPickup: booking.status === BookingStatus.CONFIRMED || booking.status === BookingStatus.HOLD,
            canReturn: booking.status === BookingStatus.RENTED,
        };
    }
}
