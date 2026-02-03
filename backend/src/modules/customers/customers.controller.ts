import { Controller, Get, Post, Patch, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { CustomersService } from './customers.service';
import { CreateCustomerDto, UpdateCustomerDto } from './dto/customer.dto';

@ApiTags('customers')
@Controller('customers')
@ApiBearerAuth()
export class CustomersController {
    constructor(private readonly customersService: CustomersService) { }

    @Get('shop/:shopId')
    @ApiOperation({ summary: 'Get all customers for a shop' })
    findAll(@Param('shopId') shopId: string, @Query('search') search?: string) {
        return this.customersService.findAll(shopId, search);
    }

    @Get(':id/shop/:shopId')
    @ApiOperation({ summary: 'Get a single customer' })
    findOne(@Param('id') id: string, @Param('shopId') shopId: string) {
        return this.customersService.findOne(id, shopId);
    }

    @Post('shop/:shopId')
    @ApiOperation({ summary: 'Add a new customer to shop' })
    create(@Param('shopId') shopId: string, @Body() dto: CreateCustomerDto) {
        return this.customersService.create(shopId, dto);
    }

    @Patch(':id/shop/:shopId')
    @ApiOperation({ summary: 'Update customer details' })
    update(@Param('id') id: string, @Param('shopId') shopId: string, @Body() dto: UpdateCustomerDto) {
        return this.customersService.update(id, shopId, dto);
    }

    @Delete(':id/shop/:shopId')
    @ApiOperation({ summary: 'Delete a customer' })
    remove(@Param('id') id: string, @Param('shopId') shopId: string) {
        return this.customersService.remove(id, shopId);
    }
}
