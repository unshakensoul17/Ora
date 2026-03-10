import {
    IsString,
    IsOptional,
    IsEnum,
    IsNumber,
    IsPositive,
    IsArray,
    Min,
    IsNotEmpty
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Category, ItemStatus } from '@prisma/client';

export class CreateItemDto {
    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    name: string;

    @ApiPropertyOptional()
    @IsString()
    @IsOptional()
    description?: string;

    @ApiProperty({ enum: Category })
    @IsEnum(Category)
    @IsNotEmpty()
    category: Category;

    @ApiPropertyOptional()
    @IsString()
    @IsOptional()
    subcategory?: string;

    @ApiPropertyOptional()
    @IsString()
    @IsOptional()
    color?: string;

    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    size: string;

    @ApiPropertyOptional()
    @IsOptional()
    sizeDetails?: any;

    @ApiProperty()
    @IsNumber()
    @IsPositive()
    rentalPrice: number;

    @ApiPropertyOptional()
    @IsNumber()
    @IsPositive()
    @IsOptional()
    retailPrice?: number;

    @ApiProperty()
    @IsNumber()
    @Min(0)
    securityDeposit: number;

    @ApiProperty({ type: [String] })
    @IsArray()
    @IsString({ each: true })
    images: string[];

    @ApiPropertyOptional({ type: [String] })
    @IsArray()
    @IsString({ each: true })
    @IsOptional()
    occasion?: string[];

    @ApiPropertyOptional()
    @IsString()
    @IsOptional()
    brand?: string;

    @ApiPropertyOptional()
    @IsString()
    @IsOptional()
    sku?: string;
}

export class UpdateInventoryDto {
    @ApiPropertyOptional()
    @IsString()
    @IsOptional()
    name?: string;

    @ApiPropertyOptional()
    @IsString()
    @IsOptional()
    description?: string;

    @ApiPropertyOptional({ enum: Category })
    @IsEnum(Category)
    @IsOptional()
    category?: Category;

    @ApiPropertyOptional()
    @IsString()
    @IsOptional()
    subcategory?: string;

    @ApiPropertyOptional()
    @IsString()
    @IsOptional()
    color?: string;

    @ApiPropertyOptional()
    @IsString()
    @IsOptional()
    size?: string;

    @ApiPropertyOptional()
    @IsOptional()
    sizeDetails?: any;

    @ApiPropertyOptional()
    @IsNumber()
    @IsPositive()
    @IsOptional()
    rentalPrice?: number;

    @ApiPropertyOptional()
    @IsNumber()
    @IsPositive()
    @IsOptional()
    retailPrice?: number;

    @ApiPropertyOptional()
    @IsNumber()
    @Min(0)
    @IsOptional()
    securityDeposit?: number;

    @ApiPropertyOptional({ type: [String] })
    @IsArray()
    @IsString({ each: true })
    @IsOptional()
    images?: string[];

    @ApiPropertyOptional({ type: [String] })
    @IsArray()
    @IsString({ each: true })
    @IsOptional()
    occasion?: string[];

    @ApiPropertyOptional()
    @IsString()
    @IsOptional()
    brand?: string;

    @ApiPropertyOptional({ enum: ItemStatus })
    @IsEnum(ItemStatus)
    @IsOptional()
    status?: ItemStatus;
}
