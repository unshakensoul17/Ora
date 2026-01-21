import { Module } from '@nestjs/common';
import { AttributionService } from './attribution.service';
import { AttributionController } from './attribution.controller';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
    imports: [PrismaModule],
    providers: [AttributionService],
    controllers: [AttributionController],
    exports: [AttributionService],
})
export class AttributionModule { }
