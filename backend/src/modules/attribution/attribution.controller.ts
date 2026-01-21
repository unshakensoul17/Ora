import { Controller, Get, Post, Body, Param, Query, BadRequestException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AttributionService } from './attribution.service';
import { PrismaService } from '../../prisma/prisma.service';

@ApiTags('attribution')
@Controller('attribution')
export class AttributionController {
    constructor(
        private attributionService: AttributionService,
        private prisma: PrismaService,
    ) { }

    @Get('shop/:shopId/stats')
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Get shop attribution stats' })
    async getShopStats(
        @Param('shopId') shopId: string,
        @Query('startDate') startDate?: string,
        @Query('endDate') endDate?: string,
    ) {
        const period =
            startDate && endDate
                ? { start: new Date(startDate), end: new Date(endDate) }
                : undefined;

        return this.attributionService.getShopStats(shopId, period);
    }

    @Post('scan')
    @ApiOperation({ summary: 'Scan QR code to verify booking' })
    async scanQRCode(
        @Body('bookingId') bookingId: string,
        @Body('qrCodeHash') qrCodeHash: string,
        @Body('shopId') shopId: string,
    ) {
        try {
            console.log('[SCAN] Received:', { bookingId, qrCodeHash, shopId });

            const booking = await this.prisma.booking.findUnique({
                where: { id: bookingId },
                include: {
                    user: { select: { id: true, name: true, phone: true } },
                    item: {
                        select: {
                            id: true,
                            name: true,
                            category: true,
                            rentalPrice: true,
                            securityDeposit: true,
                            shopId: true,
                        },
                    },
                },
            });

            console.log('[SCAN] Booking found:', booking ? 'Yes' : 'No');

            if (!booking) {
                throw new BadRequestException('Booking not found');
            }

            if (booking.item.shopId !== shopId) {
                throw new BadRequestException('This booking is not for your shop');
            }

            // Verify QR code hash matches
            if (booking.qrCodeHash !== qrCodeHash) {
                throw new BadRequestException('Invalid QR code');
            }

            // If booking is still in HOLD status, confirm it
            if (booking.status === 'HOLD') {
                await this.prisma.booking.update({
                    where: { id: bookingId },
                    data: {
                        status: 'CONFIRMED',
                        verifiedAt: new Date(),
                    },
                });

                // Create attribution event (billable lead)
                await this.prisma.attributionEvent.create({
                    data: {
                        bookingId: booking.id,
                        shopId,
                        billable: true,
                        billedAmount: 5000, // ₹50 in paise
                    },
                });

                console.log('[SCAN] Booking confirmed and attribution created');
            }

            return {
                success: true,
                booking: {
                    id: booking.id,
                    status: 'CONFIRMED', // Return confirmed status
                    user: booking.user,
                    item: booking.item,
                    dates: {
                        start: booking.startDate,
                        end: booking.endDate,
                    },
                },
            };
        } catch (error) {
            console.error('[SCAN] Error:', error);
            throw error;
        }
    }

    @Get('shop/:shopId/events')
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Get shop attribution events' })
    async getShopEvents(
        @Param('shopId') shopId: string,
        @Query('page') page?: number,
        @Query('limit') limit?: number,
        @Query('billable') billable?: boolean,
    ) {
        return this.attributionService.getShopEvents(shopId, page, limit, billable);
    }

    // Admin endpoints
    @Get('admin/events')
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Admin: Get all attribution events' })
    async getAdminEvents(
        @Query('page') page?: number,
        @Query('limit') limit?: number,
    ) {
        return this.attributionService.getAllEvents(page, limit);
    }

    @Get('admin/stats')
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Admin: Get platform attribution stats' })
    async getPlatformStats(
        @Query('startDate') startDate?: string,
        @Query('endDate') endDate?: string,
    ) {
        const period =
            startDate && endDate
                ? { start: new Date(startDate), end: new Date(endDate) }
                : undefined;

        return this.attributionService.getPlatformStats(period);
    }

    @Post('admin/mark-billed')
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Admin: Mark events as billed' })
    async markBilled(@Body('eventIds') eventIds: string[]) {
        return this.attributionService.markBilled(eventIds);
    }
}
