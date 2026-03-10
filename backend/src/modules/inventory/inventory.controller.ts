import {
    Controller,
    Get,
    Post,
    Patch,
    Delete,
    Param,
    Body,
    Query,
    UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { InventoryService } from './inventory.service';
import { AuthGuard } from '@nestjs/passport';
import { Category, ItemStatus } from '@prisma/client';
import { CreateItemDto, UpdateInventoryDto } from './dto/inventory.dto';

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
    @UseGuards(AuthGuard('jwt'))
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
    @UseGuards(AuthGuard('jwt'))
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Add inventory item' })
    async create(@Param('shopId') shopId: string, @Body() data: CreateItemDto) {
        return this.inventoryService.create(shopId, data);
    }

    @Get('shop/:shopId')
    @UseGuards(AuthGuard('jwt'))
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
    @UseGuards(AuthGuard('jwt'))
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Update inventory item' })
    async update(@Param('id') id: string, @Body() data: UpdateInventoryDto) {
        return this.inventoryService.update(id, data);
    }

    @Delete(':id')
    @UseGuards(AuthGuard('jwt'))
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Delete inventory item' })
    async delete(@Param('id') id: string) {
        return this.inventoryService.delete(id);
    }

    @Patch(':id/toggle-status')
    @UseGuards(AuthGuard('jwt'))
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Toggle item availability (ACTIVE/INACTIVE)' })
    async toggleStatus(@Param('id') id: string) {
        return this.inventoryService.toggleStatus(id);
    }
}
