import {
    IsString,
    IsEmail,
    IsOptional,
    IsNumber,
    IsArray,
    MinLength,
    MaxLength,
    Matches,
    IsLatitude,
    IsLongitude,
    IsObject,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * DTO for shop registration
 */
export class CreateShopDto {
    @ApiProperty({ example: 'Royal Lehenga House' })
    @IsString()
    @MinLength(3, { message: 'Shop name must be at least 3 characters' })
    @MaxLength(100, { message: 'Shop name must not exceed 100 characters' })
    name: string;

    @ApiProperty({ example: 'Rahul Sharma' })
    @IsString()
    @MinLength(2, { message: 'Owner name must be at least 2 characters' })
    @MaxLength(100, { message: 'Owner name must not exceed 100 characters' })
    ownerName: string;

    @ApiProperty({ example: '9876543210' })
    @IsString()
    @Matches(/^[6-9]\d{9}$/, { message: 'Invalid Indian phone number' })
    ownerPhone: string;

    @ApiPropertyOptional({ example: 'shop@example.com' })
    @IsOptional()
    @IsEmail({}, { message: 'Invalid email address' })
    email?: string;

    @ApiProperty({ example: '123 MG Road, Near Clock Tower' })
    @IsString()
    @MinLength(10, { message: 'Address must be at least 10 characters' })
    @MaxLength(500, { message: 'Address must not exceed 500 characters' })
    address: string;

    @ApiProperty({ example: 'Vijay Nagar' })
    @IsString()
    @MinLength(2, { message: 'Locality must be at least 2 characters' })
    @MaxLength(100, { message: 'Locality must not exceed 100 characters' })
    locality: string;

    @ApiPropertyOptional({ example: 'Indore', default: 'Indore' })
    @IsOptional()
    @IsString()
    @MaxLength(100)
    city?: string;

    @ApiProperty({ example: '452001' })
    @IsString()
    @Matches(/^\d{6}$/, { message: 'Invalid Indian pincode (must be 6 digits)' })
    pincode: string;

    @ApiProperty({ example: 22.7196 })
    @IsNumber()
    @IsLatitude({ message: 'Invalid latitude' })
    lat: number;

    @ApiProperty({ example: 75.8577 })
    @IsNumber()
    @IsLongitude({ message: 'Invalid longitude' })
    lng: number;

    @ApiPropertyOptional({ example: 'Premium designer lehenga and sherwani rental boutique' })
    @IsOptional()
    @IsString()
    @MaxLength(1000, { message: 'Description must not exceed 1000 characters' })
    description?: string;
}

/**
 * DTO for updating shop profile
 */
export class UpdateShopDto {
    @ApiPropertyOptional({ example: 'Royal Lehenga House' })
    @IsOptional()
    @IsString()
    @MinLength(3, { message: 'Shop name must be at least 3 characters' })
    @MaxLength(100, { message: 'Shop name must not exceed 100 characters' })
    name?: string;

    @ApiPropertyOptional({ example: 'Rahul Sharma' })
    @IsOptional()
    @IsString()
    @MinLength(2, { message: 'Owner name must be at least 2 characters' })
    @MaxLength(100, { message: 'Owner name must not exceed 100 characters' })
    ownerName?: string;

    @ApiPropertyOptional({ example: 'shop@example.com' })
    @IsOptional()
    @IsEmail({}, { message: 'Invalid email address' })
    email?: string;

    @ApiPropertyOptional({ example: '123 MG Road, Near Clock Tower' })
    @IsOptional()
    @IsString()
    @MinLength(10, { message: 'Address must be at least 10 characters' })
    @MaxLength(500, { message: 'Address must not exceed 500 characters' })
    address?: string;

    @ApiPropertyOptional({ example: 'Vijay Nagar' })
    @IsOptional()
    @IsString()
    @MinLength(2, { message: 'Locality must be at least 2 characters' })
    @MaxLength(100, { message: 'Locality must not exceed 100 characters' })
    locality?: string;

    @ApiPropertyOptional({ example: 'Premium designer lehenga and sherwani rental boutique' })
    @IsOptional()
    @IsString()
    @MaxLength(1000, { message: 'Description must not exceed 1000 characters' })
    description?: string;

    @ApiPropertyOptional({
        example: { mon: { open: '10:00', close: '20:00' }, tue: { open: '10:00', close: '20:00' } },
    })
    @IsOptional()
    @IsObject({ message: 'Operating hours must be an object' })
    operatingHours?: Record<string, { open: string; close: string }>;

    @ApiPropertyOptional({ example: ['https://storage.example.com/shop1.jpg'] })
    @IsOptional()
    @IsArray({ message: 'Images must be an array' })
    @IsString({ each: true, message: 'Each image must be a URL string' })
    images?: string[];
}

/**
 * DTO for changing shop password
 */
export class ChangePasswordDto {
    @ApiProperty({ example: 'oldPass123!' })
    @IsString()
    @MinLength(8, { message: 'Current password must be at least 8 characters' })
    currentPassword: string;

    @ApiProperty({ example: 'newSecure@Pass456' })
    @IsString()
    @MinLength(8, { message: 'New password must be at least 8 characters' })
    @MaxLength(128, { message: 'Password must not exceed 128 characters' })
    @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/, {
        message: 'Password must contain uppercase, lowercase, number, and special character',
    })
    newPassword: string;
}

/**
 * DTO for suspending a shop (admin)
 */
export class SuspendShopDto {
    @ApiProperty({ example: 'Violation of platform guidelines' })
    @IsString()
    @MinLength(10, { message: 'Suspension reason must be at least 10 characters' })
    @MaxLength(500, { message: 'Suspension reason must not exceed 500 characters' })
    reason: string;
}
