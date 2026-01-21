import { Body, Controller, Get, Param, Post, UseGuards, Request, UseInterceptors, UploadedFile, BadRequestException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { FileInterceptor } from '@nestjs/platform-express';
import { ReviewsService } from './reviews.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { UploadsService, StorageBucket } from '../../uploads/uploads.service';

@Controller('reviews')
export class ReviewsController {
    constructor(
        private readonly reviewsService: ReviewsService,
        private readonly uploadsService: UploadsService,
    ) { }

    @Post()
    @UseGuards(AuthGuard('jwt'))
    create(@Request() req: any, @Body() createReviewDto: CreateReviewDto) {
        return this.reviewsService.create(req.user.id, createReviewDto);
    }

    @Post('upload-image')
    @UseGuards(AuthGuard('jwt'))
    @UseInterceptors(FileInterceptor('file'))
    async uploadImage(@UploadedFile() file: Express.Multer.File) {
        if (!file) {
            throw new BadRequestException('No file provided');
        }

        return this.uploadsService.uploadFile(
            file.buffer,
            file.originalname,
            file.mimetype,
            StorageBucket.REVIEW_IMAGES,
        );
    }

    @Get('gallery')
    async getGallery() {
        return this.reviewsService.getGalleryReviews();
    }

    @Get('item/:itemId')
    async getItemReviews(@Param('itemId') itemId: string) {
        return this.reviewsService.findByItemId(itemId);
    }
}

@Controller('shops')
export class ShopReviewsController {
    constructor(private readonly reviewsService: ReviewsService) { }

    @Get(':id/reviews')
    getShopReviews(@Param('id') id: string) {
        return this.reviewsService.findByShopId(id);
    }
}
