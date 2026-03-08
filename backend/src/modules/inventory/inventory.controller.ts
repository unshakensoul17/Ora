import {
    Controller,
    Get,
    Post,
    Patch,
    Delete,
    Param,
    Body,
    Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { InventoryService } from './inventory.service';
import { Category, ItemStatus } from '@prisma/client';

@ApiTags('inventory')
@Controller('inventory')
export class InventoryController {
    constructor(private inventoryService: InventoryService) { }

    // ============================================
    // Public Endpoints (Marketplace)
    // ============================================

    @Get('marketplace')
    @ApiOperation({ summary: 'Browse marketplace items' })
    async browseMarketplace(
        @Query('category') category?: Category,
        @Query('size') size?: string,
        @Query('startDate') startDate?: string,
        @Query('endDate') endDate?: string,
        @Query('minPrice') minPrice?: number,
        @Query('maxPrice') maxPrice?: number,
        @Query('locality') locality?: string,
        @Query('page') page?: number,
        @Query('limit') limit?: number,
    ) {
        return this.inventoryService.getMarketplaceItems({
            category,
            size,
            startDate: startDate ? new Date(startDate) : undefined,
            endDate: endDate ? new Date(endDate) : undefined,
            minPrice,
            maxPrice,
            locality,
            page,
            limit,
        });
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get item details' })
    async getItem(@Param('id') id: string) {
        return this.inventoryService.findById(id);
    }

    @Get(':id/recommendations')
    @ApiOperation({ summary: 'Get recommended products' })
    async getRecommendations(@Param('id') id: string, @Query('limit') limit?: string) {
        const limitNum = limit ? parseInt(limit) : 6;
        return this.inventoryService.getRecommendations(id, limitNum);
    }

    // ============================================
    // Admin Endpoints
    // ============================================

    @Get('admin/list')
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Admin: List all inventory' })
    async listInventory(
        @Query('page') page?: number,
        @Query('limit') limit?: number,
    ) {
        return this.inventoryService.getInventoryForAdmin(page, limit);
    }

    // ============================================
    // Shop Endpoints
    // ============================================

    @Post('shop/:shopId')
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Add inventory item' })
    async create(@Param('shopId') shopId: string, @Body() data: any) {
        return this.inventoryService.create(shopId, data);
    }

    @Get('shop/:shopId')
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Get shop inventory' })
    async getShopInventory(
        @Param('shopId') shopId: string,
        @Query('category') category?: Category,
        @Query('status') status?: ItemStatus,
        @Query('search') search?: string,
        @Query('page') page?: number,
        @Query('limit') limit?: number,
    ) {
        return this.inventoryService.getShopInventory(shopId, {
            category,
            status,
            search,
            page,
            limit,
        });
    }

    @Patch(':id')
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Update inventory item' })
    async update(@Param('id') id: string, @Body() data: any) {
        return this.inventoryService.update(id, data);
    }

    @Delete(':id')
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Delete inventory item' })
    async delete(@Param('id') id: string) {
        return this.inventoryService.delete(id);
    }

    @Patch(':id/toggle-status')
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Toggle item availability (ACTIVE/INACTIVE)' })
    async toggleStatus(@Param('id') id: string) {
        return this.inventoryService.toggleStatus(id);
    }
}
