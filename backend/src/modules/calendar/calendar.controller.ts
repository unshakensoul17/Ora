import { Controller, Get, Post, Delete, Param, Query, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { CalendarService } from './calendar.service';

@ApiTags('calendar')
@Controller('calendar')
export class CalendarController {
    constructor(private calendarService: CalendarService) { }

    @Get('item/:itemId')
    @ApiOperation({ summary: 'Get calendar for an inventory item' })
    async getItemCalendar(
        @Param('itemId') itemId: string,
        @Query('month') month: number,
        @Query('year') year: number,
    ) {
        return this.calendarService.getItemCalendar(itemId, month, year);
    }

    @Get('item/:itemId/availability')
    @ApiOperation({ summary: 'Check availability for date range' })
    async checkAvailability(
        @Param('itemId') itemId: string,
        @Query('startDate') startDate: string,
        @Query('endDate') endDate: string,
    ) {
        const isAvailable = await this.calendarService.isAvailable(
            itemId,
            new Date(startDate),
            new Date(endDate),
        );

        return { available: isAvailable };
    }

    @Get('item/:itemId/blocks')
    @ApiOperation({ summary: 'Get blocked dates for an item' })
    async getBlockedDates(
        @Param('itemId') itemId: string,
        @Query('startDate') startDate: string,
        @Query('endDate') endDate: string,
    ) {
        return this.calendarService.getBlockedDates(
            itemId,
            new Date(startDate),
            new Date(endDate),
        );
    }

    @Post('item/:itemId/maintenance')
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Add maintenance block (shop only)' })
    async addMaintenanceBlock(
        @Param('itemId') itemId: string,
        @Body() body: { date: string; notes?: string },
    ) {
        await this.calendarService.createMaintenanceBlock(
            itemId,
            new Date(body.date),
            body.notes,
        );
        return { success: true };
    }

    @Delete('item/:itemId/maintenance')
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Remove maintenance block (shop only)' })
    async removeMaintenanceBlock(
        @Param('itemId') itemId: string,
        @Query('date') date: string,
    ) {
        await this.calendarService.removeMaintenanceBlock(itemId, new Date(date));
        return { success: true };
    }
}
