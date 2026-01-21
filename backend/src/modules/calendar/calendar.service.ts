import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { BlockReason } from '@prisma/client';
import { addDays, subDays, eachDayOfInterval, format } from 'date-fns';

@Injectable()
export class CalendarService {
    constructor(private prisma: PrismaService) { }

    /**
     * Core Availability Rule:
     * If a date exists in availability_blocks for an item, that item is UNAVAILABLE on that date.
     */

    /**
     * Check if an item is available for a date range
     */
    async isAvailable(
        itemId: string,
        startDate: Date,
        endDate: Date,
        includeBuffers: boolean = true,
    ): Promise<boolean> {
        // Calculate the full range including buffers
        const checkStart = includeBuffers ? subDays(startDate, 1) : startDate;
        const checkEnd = includeBuffers ? addDays(endDate, 1) : endDate;

        const conflictingBlocks = await this.prisma.availabilityBlock.findMany({
            where: {
                itemId,
                date: {
                    gte: checkStart,
                    lte: checkEnd,
                },
            },
        });

        return conflictingBlocks.length === 0;
    }

    /**
     * Get all blocked dates for an item in a date range
     */
    async getBlockedDates(
        itemId: string,
        startDate: Date,
        endDate: Date,
    ): Promise<{ date: Date; reason: BlockReason }[]> {
        const blocks = await this.prisma.availabilityBlock.findMany({
            where: {
                itemId,
                date: {
                    gte: startDate,
                    lte: endDate,
                },
            },
            select: {
                date: true,
                reason: true,
            },
            orderBy: {
                date: 'asc',
            },
        });

        return blocks;
    }

    /**
     * Create availability blocks for a booking
     * Blocks: D-1 (pickup) + rental period + D+1 (return/laundry)
     */
    async createBookingBlocks(
        itemId: string,
        startDate: Date,
        endDate: Date,
        bookingId: string,
        isHold: boolean = false,
    ): Promise<void> {
        const blocks: {
            itemId: string;
            date: Date;
            reason: BlockReason;
            bookingId: string;
        }[] = [];

        // D-1: Pickup buffer
        blocks.push({
            itemId,
            date: subDays(startDate, 1),
            reason: BlockReason.PICKUP,
            bookingId,
        });

        // D to endDate: Rental period (or hold)
        const rentalDates = eachDayOfInterval({ start: startDate, end: endDate });
        for (const date of rentalDates) {
            blocks.push({
                itemId,
                date,
                reason: isHold ? BlockReason.HOLD : BlockReason.RENTAL,
                bookingId,
            });
        }

        // D+1: Return/laundry buffer
        blocks.push({
            itemId,
            date: addDays(endDate, 1),
            reason: BlockReason.RETURN,
            bookingId,
        });

        // Create all blocks (skip if date already blocked - shouldn't happen due to prior checks)
        await this.prisma.availabilityBlock.createMany({
            data: blocks,
            skipDuplicates: true,
        });
    }

    /**
     * Remove all blocks associated with a booking
     */
    async removeBookingBlocks(bookingId: string): Promise<void> {
        await this.prisma.availabilityBlock.deleteMany({
            where: { bookingId },
        });
    }

    /**
     * Convert hold blocks to rental blocks (after QR verification)
     */
    async confirmHoldBlocks(bookingId: string): Promise<void> {
        await this.prisma.availabilityBlock.updateMany({
            where: {
                bookingId,
                reason: BlockReason.HOLD,
            },
            data: {
                reason: BlockReason.RENTAL,
            },
        });
    }

    /**
     * Create maintenance block (shop-initiated)
     */
    async createMaintenanceBlock(
        itemId: string,
        date: Date,
        notes?: string,
    ): Promise<void> {
        await this.prisma.availabilityBlock.create({
            data: {
                itemId,
                date,
                reason: BlockReason.MAINTENANCE,
                notes,
            },
        });
    }

    /**
     * Remove maintenance block
     */
    async removeMaintenanceBlock(itemId: string, date: Date): Promise<void> {
        await this.prisma.availabilityBlock.deleteMany({
            where: {
                itemId,
                date,
                reason: BlockReason.MAINTENANCE,
            },
        });
    }

    /**
     * Get calendar view for an item (for shop dashboard)
     */
    async getItemCalendar(
        itemId: string,
        month: number,
        year: number,
    ): Promise<{
        date: string;
        status: 'available' | 'blocked' | 'hold' | 'maintenance';
        reason?: string;
        bookingId?: string;
    }[]> {
        const startDate = new Date(year, month - 1, 1);
        const endDate = new Date(year, month, 0); // Last day of month

        const allDates = eachDayOfInterval({ start: startDate, end: endDate });
        const blocks = await this.getBlockedDates(itemId, startDate, endDate);

        const blockMap = new Map(
            blocks.map((b) => [format(b.date, 'yyyy-MM-dd'), b]),
        );

        return allDates.map((date) => {
            const dateStr = format(date, 'yyyy-MM-dd');
            const block = blockMap.get(dateStr);

            if (!block) {
                return { date: dateStr, status: 'available' as const };
            }

            const status =
                block.reason === BlockReason.MAINTENANCE
                    ? 'maintenance'
                    : block.reason === BlockReason.HOLD
                        ? 'hold'
                        : 'blocked';

            return {
                date: dateStr,
                status: status as 'available' | 'blocked' | 'hold' | 'maintenance',
                reason: block.reason,
            };
        });
    }
}
