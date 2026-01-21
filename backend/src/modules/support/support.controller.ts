import { Controller, Post, Get, Body, Param, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { SupportService } from './support.service';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('Support')
@Controller('support')
@UseGuards(AuthGuard('jwt'))
@ApiBearerAuth()
export class SupportController {
    constructor(private supportService: SupportService) { }

    @Post('tickets')
    @ApiOperation({ summary: 'Create a new support ticket' })
    async createTicket(@Body() body: {
        shopId: string;
        category: 'GENERAL' | 'TECHNICAL' | 'BILLING' | 'OTHER';
        subject: string;
        message: string;
    }) {
        return this.supportService.createTicket(body.shopId, {
            category: body.category,
            subject: body.subject,
            message: body.message,
        });
    }

    @Get('tickets/shop/:shopId')
    @ApiOperation({ summary: 'Get all tickets for a shop' })
    async getShopTickets(@Param('shopId') shopId: string) {
        return this.supportService.getShopTickets(shopId);
    }

    @Get('tickets/:ticketId/shop/:shopId')
    @ApiOperation({ summary: 'Get a specific ticket' })
    async getTicket(
        @Param('ticketId') ticketId: string,
        @Param('shopId') shopId: string,
    ) {
        return this.supportService.getTicket(ticketId, shopId);
    }

    @Get('tickets/shop/:shopId/stats')
    @ApiOperation({ summary: 'Get ticket statistics for a shop' })
    async getTicketStats(@Param('shopId') shopId: string) {
        return this.supportService.getTicketStats(shopId);
    }
}
