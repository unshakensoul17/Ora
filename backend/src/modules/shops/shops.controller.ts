import {
    Controller,
    Get,
    Post,
    Patch,
    Param,
    Body,
    Query,
    ParseUUIDPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiParam, ApiQuery } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { ShopsService } from './shops.service';
import { ShopStatus } from '@prisma/client';
import {
    CreateShopDto,
    UpdateShopDto,
    ChangePasswordDto,
    SuspendShopDto,
} from './dto';

@ApiTags('shops')
@Controller('shops')
export class ShopsController {
    constructor(private shopsService: ShopsService) { }

    /**
     * Register a new shop - stricter rate limit (5 per minute)
     */
    @Post('register')
    @Throttle({ default: { limit: 5, ttl: 60000 } })
    @ApiOperation({ summary: 'Register a new shop' })
    async register(@Body() data: CreateShopDto) {
        return this.shopsService.register(data);
    }

    /**
     * Get shop by ID
     */
    @Get(':id')
    @ApiOperation({ summary: 'Get shop by ID' })
    @ApiParam({ name: 'id', description: 'Shop UUID' })
    async getShop(@Param('id', ParseUUIDPipe) id: string) {
        return this.shopsService.findById(id);
    }

    /**
     * Get shop dashboard stats
     */
    @Get(':id/dashboard')
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Get shop dashboard stats' })
    @ApiParam({ name: 'id', description: 'Shop UUID' })
    async getDashboard(@Param('id', ParseUUIDPipe) id: string) {
        return this.shopsService.getDashboardStats(id);
    }

    /**
     * Update shop profile
     */
    @Patch(':id')
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Update shop profile' })
    @ApiParam({ name: 'id', description: 'Shop UUID' })
    async updateProfile(
        @Param('id', ParseUUIDPipe) id: string,
        @Body() data: UpdateShopDto,
    ) {
        return this.shopsService.updateProfile(id, data);
    }

    /**
     * Change shop password - stricter rate limit (3 per minute)
     */
    @Post(':id/change-password')
    @Throttle({ default: { limit: 3, ttl: 60000 } })
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Change shop password' })
    @ApiParam({ name: 'id', description: 'Shop UUID' })
    async changePassword(
        @Param('id', ParseUUIDPipe) id: string,
        @Body() data: ChangePasswordDto,
    ) {
        return this.shopsService.changePassword(id, data.currentPassword, data.newPassword);
    }

    // ============================================
    // Admin Endpoints
    // ============================================

    /**
     * Admin: List all shops
     */
    @Get('admin/list')
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Admin: List all shops' })
    @ApiQuery({ name: 'status', required: false, enum: ShopStatus })
    @ApiQuery({ name: 'page', required: false, type: Number })
    @ApiQuery({ name: 'limit', required: false, type: Number })
    async listShops(
        @Query('status') status?: ShopStatus,
        @Query('page') page?: number,
        @Query('limit') limit?: number,
    ) {
        return this.shopsService.getShopsForAdmin(status, page, limit);
    }

    /**
     * Admin: Get pending shops
     */
    @Get('admin/pending')
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Admin: Get pending shops' })
    async getPending() {
        return this.shopsService.getPendingShops();
    }

    /**
     * Admin: Approve shop
     */
    @Patch('admin/:id/approve')
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Admin: Approve shop' })
    @ApiParam({ name: 'id', description: 'Shop UUID' })
    async approve(@Param('id', ParseUUIDPipe) id: string) {
        return this.shopsService.approveShop(id);
    }

    /**
     * Admin: Suspend shop
     */
    @Patch('admin/:id/suspend')
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Admin: Suspend shop' })
    @ApiParam({ name: 'id', description: 'Shop UUID' })
    async suspend(
        @Param('id', ParseUUIDPipe) id: string,
        @Body() data: SuspendShopDto,
    ) {
        return this.shopsService.suspendShop(id, data.reason);
    }

    /**
     * Admin: Reactivate suspended shop
     */
    @Patch('admin/:id/reactivate')
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Admin: Reactivate suspended shop' })
    @ApiParam({ name: 'id', description: 'Shop UUID' })
    async reactivate(@Param('id', ParseUUIDPipe) id: string) {
        return this.shopsService.reactivateShop(id);
    }
}

