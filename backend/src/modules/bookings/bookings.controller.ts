import {
    Controller,
    Get,
    Post,
    Patch,
    Param,
    Body,
    Query,
    UseGuards,
    Req,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { BookingsService } from './bookings.service';
import { CreateHoldDto, VerifyQRDto, CreateWalkInBookingDto } from './dto/booking.dto';
import { AuthGuard } from '@nestjs/passport';

@ApiTags('bookings')
@Controller('bookings')
@UseGuards(AuthGuard('jwt'))
@ApiBearerAuth()
export class BookingsController {
    constructor(private bookingsService: BookingsService) { }

    // ============================================
    // User Endpoints
    // ============================================

    @Post('shop/:shopId/walk-in')
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Create a walk-in booking' })
    async createWalkInBooking(
        @Param('shopId') shopId: string,
        @Body() dto: CreateWalkInBookingDto,
    ) {
        return this.bookingsService.createWalkInBooking(shopId, {
            ...dto,
            startDate: new Date(dto.startDate),
            endDate: new Date(dto.endDate),
        });
    }

    @Post('hold')
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Create a hold (Reserve for Trial)' })
    async createHold(@Body() dto: CreateHoldDto) {
        return this.bookingsService.createHold(
            dto.userId,
            dto.itemId,
            new Date(dto.startDate),
            new Date(dto.endDate),
        );
    }

    @Get('user/:userId/holds')
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Get user active holds' })
    async getUserHolds(@Param('userId') userId: string) {
        return this.bookingsService.getUserHolds(userId);
    }

    @Get('user/my-orders')
    @ApiBearerAuth()
    @UseGuards(AuthGuard('jwt'))
    @ApiOperation({ summary: 'Get user past orders' })
    async getUserBookings(@Req() req: any) {
        return this.bookingsService.getUserBookings(req.user.id);
    }

    @Patch(':bookingId/cancel')
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Cancel a hold' })
    async cancelHold(
        @Param('bookingId') bookingId: string,
        @Body('reason') reason?: string,
    ) {
        return this.bookingsService.cancelHold(bookingId, reason);
    }

    // ============================================
    // Shop Endpoints
    // ============================================

    @Post('verify-qr')
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Verify QR code (O2O handshake)' })
    async verifyQR(@Body() dto: VerifyQRDto) {
        return this.bookingsService.verifyQRCode(
            dto.qrCodeHash,
            dto.shopId,
            dto.scannedBy,
        );
    }

    @Get('shop/:shopId/holds')
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Get shop pending holds' })
    async getShopHolds(@Param('shopId') shopId: string) {
        return this.bookingsService.getShopHolds(shopId);
    }

    @Get('shop/:shopId/all')
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Get all shop bookings (calendar)' })
    async getShopBookings(@Param('shopId') shopId: string) {
        try {
            return await this.bookingsService.getShopBookings(shopId);
        } catch (error) {
            const fs = require('fs');
            fs.appendFileSync('debug_error.log', `[${new Date().toISOString()}] Error in getShopBookings: ${error.message}\nStack: ${error.stack}\n`);
            throw error;
        }
    }

    @Patch(':bookingId/pickup')
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Mark item as picked up' })
    async markPickedUp(@Param('bookingId') bookingId: string) {
        return this.bookingsService.markPickedUp(bookingId);
    }

    @Patch(':bookingId/return')
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Mark item as returned' })
    async markReturned(@Param('bookingId') bookingId: string) {
        return this.bookingsService.markReturned(bookingId);
    }

    @Patch(':bookingId/cancel')
    @ApiOperation({ summary: 'Cancel a booking/hold' })
    async cancelBooking(@Param('bookingId') bookingId: string) {
        return this.bookingsService.cancelBooking(bookingId);
    }

    @Get('shop/:shopId/pending-holds')
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Get pending holds awaiting pickup' })
    async getShopPendingHolds(@Param('shopId') shopId: string) {
        return this.bookingsService.getShopPendingHolds(shopId);
    }

    @Get('shop/:shopId/active-rentals')
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Get currently active rentals' })
    async getShopActiveRentals(@Param('shopId') shopId: string) {
        return this.bookingsService.getShopActiveRentals(shopId);
    }
    @Get('shop/:shopId/today-pickups')
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Get shop bookings starting today' })
    async getShopTodayPickups(@Param('shopId') shopId: string) {
        return this.bookingsService.getShopTodayPickups(shopId);
    }

    @Get('shop/:shopId/today-returns')
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Get shop bookings ending today' })
    async getShopTodayReturns(@Param('shopId') shopId: string) {
        return this.bookingsService.getShopTodayReturns(shopId);
    }

    @Get('shop/:shopId/history')
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Get completed/cancelled booking history' })
    async getShopBookingHistory(
        @Param('shopId') shopId: string,
        @Query('page') page?: number,
        @Query('limit') limit?: number,
    ) {
        return this.bookingsService.getShopBookingHistory(shopId, page, limit);
    }

    @Post('scan-qr')
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Scan QR code to verify booking' })
    async scanQR(@Body() dto: { qrCodeHash: string; shopId: string }) {
        return this.bookingsService.scanQR(dto.qrCodeHash, dto.shopId);
    }

    // ============================================
    // Admin Endpoints
    // ============================================

    @Get('admin/holds')
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Admin: Get all holds' })
    async getAllHolds(
        @Query('page') page?: number,
        @Query('limit') limit?: number,
    ) {
        return this.bookingsService.getAllHolds(page, limit);
    }
}
