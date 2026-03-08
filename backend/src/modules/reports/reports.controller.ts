import { Controller, Get, Query, Res, UseGuards } from '@nestjs/common';
import { Response } from 'express';
import { ReportsService } from './reports.service';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';

@ApiTags('reports')
@Controller('reports')
@UseGuards(AuthGuard('jwt'))
@ApiBearerAuth()
export class ReportsController {
    constructor(private reportsService: ReportsService) { }

    @Get('sales')
    @ApiOperation({ summary: 'Export sales report to Excel' })
    @ApiQuery({ name: 'shopId', required: true })
    @ApiQuery({ name: 'startDate', required: false })
    @ApiQuery({ name: 'endDate', required: false })
    async exportSales(
        @Query('shopId') shopId: string,
        @Query('startDate') startDate: string,
        @Query('endDate') endDate: string,
        @Res() res: Response,
    ) {
        const buffer = await this.reportsService.getSalesReport(
            shopId,
            startDate ? new Date(startDate) : undefined,
            endDate ? new Date(endDate) : undefined,
        );

        res.set({
            'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'Content-Disposition': `attachment; filename=Sales_Report_${new Date().getTime()}.xlsx`,
            'Content-Length': buffer.length,
        });

        res.end(buffer);
    }

    @Get('inventory')
    @ApiOperation({ summary: 'Export inventory report to Excel' })
    @ApiQuery({ name: 'shopId', required: true })
    async exportInventory(@Query('shopId') shopId: string, @Res() res: Response) {
        const buffer = await this.reportsService.getInventoryReport(shopId);

        res.set({
            'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'Content-Disposition': `attachment; filename=Inventory_Report_${new Date().getTime()}.xlsx`,
            'Content-Length': buffer.length,
        });

        res.end(buffer);
    }

    @Get('customers')
    @ApiOperation({ summary: 'Export customer report to Excel' })
    @ApiQuery({ name: 'shopId', required: true })
    async exportCustomers(@Query('shopId') shopId: string, @Res() res: Response) {
        const buffer = await this.reportsService.getCustomerReport(shopId);

        res.set({
            'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'Content-Disposition': `attachment; filename=Customer_Report_${new Date().getTime()}.xlsx`,
            'Content-Length': buffer.length,
        });

        res.end(buffer);
    }
}
