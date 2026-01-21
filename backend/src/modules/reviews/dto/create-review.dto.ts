import { IsInt, IsNotEmpty, IsOptional, IsString, IsUUID, Max, Min } from 'class-validator';

export class CreateReviewDto {
    @IsInt()
    @Min(1)
    @Max(5)
    rating: number;

    @IsOptional()
    @IsString()
    comment?: string;

    @IsUUID()
    @IsNotEmpty()
    bookingId: string;

    @IsOptional()
    @IsString({ each: true })
    images?: string[];
}
