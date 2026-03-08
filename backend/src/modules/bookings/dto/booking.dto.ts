import { IsString, IsDateString, IsOptional, IsUUID, IsEnum, IsNumber, IsArray, ValidateNested, IsObject } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { PaymentMethod, PaymentType, DiscountType } from '@prisma/client';

export class CreateHoldDto {
    @ApiProperty({ description: 'User ID' })
    @IsUUID()
    userId: string;

    @ApiProperty({ description: 'Inventory item ID' })
    @IsUUID()
    itemId: string;

    @ApiProperty({ description: 'Rental start date', example: '2026-01-15' })
    @IsDateString()
    startDate: string;

    @ApiProperty({ description: 'Rental end date', example: '2026-01-17' })
    @IsDateString()
    endDate: string;
}

export class VerifyQRDto {
    @ApiProperty({ description: 'QR code hash from customer' })
    @IsString()
    qrCodeHash: string;

    @ApiProperty({ description: 'Shop ID performing verification' })
    @IsUUID()
    shopId: string;

    @ApiProperty({ description: 'Shop staff who scanned', required: false })
    @IsOptional()
    @IsString()
    scannedBy?: string;
}

export class CancelHoldDto {
    @ApiProperty({ description: 'Cancellation reason', required: false })
    @IsOptional()
    @IsString()
    reason?: string;
}

export class CustomerDto {
    @ApiProperty()
    @IsString()
    name: string;

    @ApiProperty()
    @IsString()
    phone: string;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    address?: string;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsUUID()
    id?: string;
}

export class PaymentDto {
    @ApiProperty({ enum: PaymentMethod })
    @IsEnum(PaymentMethod)
    method: PaymentMethod;

    @ApiProperty()
    @IsNumber()
    amount: number;

    @ApiProperty({ enum: PaymentType })
    @IsEnum(PaymentType)
    type: PaymentType;
}

export class DiscountDto {
    @ApiProperty({ enum: DiscountType })
    @IsEnum(DiscountType)
    type: DiscountType;

    @ApiProperty()
    @IsNumber()
    value: number;
}

export class CreateWalkInBookingDto {
    @ApiProperty()
    @IsUUID()
    itemId: string;

    @ApiProperty()
    @IsDateString()
    startDate: string;

    @ApiProperty()
    @IsDateString()
    endDate: string;

    @ApiProperty()
    @IsObject()
    @ValidateNested()
    @Type(() => CustomerDto)
    customer: CustomerDto;

    @ApiProperty()
    @IsObject()
    @ValidateNested()
    @Type(() => PaymentDto)
    payment: PaymentDto;

    @ApiProperty({ type: [String] })
    @IsArray()
    @IsString({ each: true })
    conditionImages: string[];

    @ApiProperty({ required: false })
    @IsOptional()
    @IsObject()
    @ValidateNested()
    @Type(() => DiscountDto)
    discount?: DiscountDto;
}
