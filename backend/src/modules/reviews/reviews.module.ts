import { Module } from '@nestjs/common';
import { ReviewsService } from './reviews.service';
import { ReviewsController, ShopReviewsController } from './reviews.controller';
import { PrismaModule } from '../../prisma/prisma.module';
import { UploadsModule } from '../../uploads/uploads.module';

@Module({
    imports: [PrismaModule, UploadsModule],
    controllers: [ReviewsController, ShopReviewsController],
    providers: [ReviewsService],
    exports: [ReviewsService],
})
export class ReviewsModule { }
