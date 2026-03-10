import {
    Injectable,
    ConflictException,
    NotFoundException,
    BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { RedisService } from '../../redis/redis.service';
import { CalendarService } from '../calendar/calendar.service';
import { BookingStatus, BookingSource, PaymentMethod, PaymentType, PaymentStatus, DiscountType, ImageConditionType } from '@prisma/client';
import { format, addDays, eachDayOfInterval, addHours, isSameDay } from 'date-fns';
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
     * Create Walk-In Booking
     * Direct booking creation for shop staff
     */
    async createWalkInBooking(
        shopId: string,
        data: {
            itemId: string;
            startDate: Date;
            endDate: Date;
            customer: {
                name: string;
                phone: string;
                address?: string; // Optional address
                id?: string; // If selecting existing
            };
            payment: {
                method: PaymentMethod;
                amount: number; // Amount PAID NOW
                type: PaymentType; // ADVANCE or FULL
            };
            conditionImages: string[];
            discount?: {
                type: DiscountType;
                value: number; // Percentage or Flat amount
            };
        },
    ) {
        const { itemId, startDate, endDate, customer, payment, conditionImages, discount } = data;

        // 1. Validate item exists and belongs to shop
        const item = await this.prisma.inventoryItem.findUnique({
            where: { id: itemId },
            include: { shop: true },
        });

        if (!item) {
            throw new NotFoundException('Item not found');
        }

        if (item.shopId !== shopId) {
            throw new BadRequestException('Item does not belong to this shop');
        }

        // 2. Check calendar availability
        const isAvailable = await this.calendar.isAvailable(
            itemId,
            startDate,
            endDate,
        );

        if (!isAvailable) {
            throw new ConflictException('Item is not available for selected dates');
        }

        // 3. Handle Customer (Find or Create)
        let customerId = customer.id;

        if (!customerId) {
            // Check by phone within shop context
            const existingCustomer = await this.prisma.customer.findUnique({
                where: {
                    phone: customer.phone,
                },
            });

            if (existingCustomer) {
                customerId = existingCustomer.id;
                // Update details if needed
                if (existingCustomer.name !== customer.name) {
                    await this.prisma.customer.update({
                        where: { id: customerId },
                        data: { name: customer.name },
                    });
                }
            } else {
                // Create new customer
                const newCustomer = await this.prisma.customer.create({
                    data: {
                        shopId,
                        name: customer.name,
                        phone: customer.phone,
                        notes: customer.address ? `Address: ${customer.address}` : undefined,
                    },
                });
                customerId = newCustomer.id;
            }
        }

        // 4. Calculate Financials
        const baseRentalPrice = this.calculateRentalPrice(item.rentalPrice, startDate, endDate);
        let discountAmount = 0;

        if (discount) {
            if (discount.type === DiscountType.PERCENTAGE) {
                discountAmount = Math.round((baseRentalPrice * discount.value) / 100);
            } else {
                discountAmount = discount.value * 100; // Assuming input is in Rupees, convert to paise? Or input is paise?
                // Let's assume Backend expects paise. If frontend sends rupees, it should convert.
                // Wait, typically API expects consistent units.
                // Given `rentalPrice` is in paise. `discount.value` should be in paise if FLAT.
                // I will assume input is ALREADY converted to appropriate unit by controller/frontend.
                // However, safe to assume it's direct value.
                discountAmount = discount.value;
            }
        }

        const totalAmount = Math.max(0, baseRentalPrice - discountAmount);
        const paidAmount = payment.amount;
        const pendingAmount = Math.max(0, totalAmount - paidAmount);
        const paymentStatus = pendingAmount === 0 ? PaymentStatus.SUCCESS : PaymentStatus.PENDING;

        // 5. Generate QR Hash
        const qrCodeHash = crypto.randomBytes(16).toString('hex');

        // 6. Create Booking wrapped in transaction
        // Ideally we should use prisma.$transaction but logic is complex.
        // For now, linear execution.

        // Create Booking
        const booking = await this.prisma.booking.create({
            data: {
                shopId,
                itemId,
                customerId,
                startDate,
                endDate,
                status: BookingStatus.CONFIRMED, // Walk-in is confirmed immediately
                source: BookingSource.WALK_IN,
                qrCodeHash,

                // Financials
                platformPrice: baseRentalPrice,

                discountAmount,
                discountType: discount?.type,
                discountValue: discount?.value,

                depositAmount: item.securityDeposit,
                depositPaid: false, // Walk-in might pay deposit separately or included? Assuming rental only for now.

                verifiedAt: new Date(), // Auto-verified

                // Relations
                payments: {
                    create: {
                        amount: paidAmount,
                        method: payment.method,
                        type: payment.type,
                        status: PaymentStatus.SUCCESS,
                        referenceId: `WALKIN-${Date.now()}`,
                    },
                },
                conditionImages: {
                    create: conditionImages.map(url => ({
                        url,
                        type: ImageConditionType.PRE_RENTAL,
                    })),
                },
            },
        });

        // 7. Generate QR URL
        const qrData = `fashcycle://booking/${booking.id}?hash=${qrCodeHash}`;
        const qrCodeUrl = await QRCode.toDataURL(qrData, { width: 300 });

        await this.prisma.booking.update({
            where: { id: booking.id },
            data: { qrCodeUrl },
        });

        // 8. Block Calendar
        await this.calendar.createBookingBlocks(
            itemId,
            startDate,
            endDate,
            booking.id,
            false, // isHold = false, it's confirmed
        );

        return booking;
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
            const qrData = `ora://booking/${booking.id}?hash=${qrCodeHash}`;
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
                name: booking.user?.name ?? 'Unknown',
                phone: booking.user?.phone ?? 'Unknown',
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

        const updatedBooking = await this.prisma.booking.update({
            where: { id: bookingId },
            data: {
                status: BookingStatus.RENTED,
                pickedUpAt: new Date(),
                depositPaid: true,
                verifiedAt: booking.verifiedAt || new Date(), // Set verifiedAt if not already set
            },
        });

        // Ensure calendar blocks are confirmed as RENTAL
        await this.calendar.confirmHoldBlocks(bookingId);

        return updatedBooking;
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
                cancelledAt: new Date(),
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
                shopId,
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
        try {
            const bookings = await this.prisma.booking.findMany({
                where: {
                    shopId,
                },
                include: {
                    item: true,
                    user: {
                        select: { id: true, name: true, phone: true },
                    },
                    customer: {
                        select: { id: true, name: true, phone: true },
                    },
                },
                orderBy: { startDate: 'asc' },
            });
            return bookings;
        } catch (error) {
            console.error(`[BookingsService] Error fetching bookings for shop ${shopId}:`, error);
            // If it's the "null userId" issue or similar data inconsistency, return empty array
            // so the frontend doesn't crash, but log it so we can fix it.
            return [];
        }
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
                shopId,
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
                shopId,
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
                    shopId,
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
                    shopId,
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
     * Get shop's bookings starting today (pickups)
     */
    async getShopTodayPickups(shopId: string) {
        const now = new Date();
        const todayStart = new Date(now.setHours(0, 0, 0, 0));
        const todayEnd = new Date(now.setHours(23, 59, 59, 999));

        return this.prisma.booking.findMany({
            where: {
                shopId,
                status: {
                    in: [BookingStatus.HOLD, BookingStatus.CONFIRMED],
                },
                startDate: { gte: todayStart, lte: todayEnd },
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
                customer: {
                    select: { id: true, name: true, phone: true },
                },
            },
            orderBy: { createdAt: 'desc' },
        });
    }

    /**
     * Get shop's bookings ending today (returns)
     */
    async getShopTodayReturns(shopId: string) {
        const now = new Date();
        const todayStart = new Date(now.setHours(0, 0, 0, 0));
        const todayEnd = new Date(now.setHours(23, 59, 59, 999));

        return this.prisma.booking.findMany({
            where: {
                shopId,
                status: BookingStatus.RENTED,
                endDate: { gte: todayStart, lte: todayEnd },
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
                customer: {
                    select: { id: true, name: true, phone: true },
                },
            },
            orderBy: { endDate: 'asc' },
        });
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
                    name: booking.user?.name ?? 'Unknown',
                    phone: booking.user?.phone ?? 'Unknown',
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
