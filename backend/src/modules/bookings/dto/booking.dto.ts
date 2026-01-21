import { IsString, IsDateString, IsOptional, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

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
