import { Module } from '@nestjs/common';
import { BookingsService } from './bookings.service';
import { BookingsController } from './bookings.controller';
import { CalendarModule } from '../calendar/calendar.module';

@Module({
    imports: [CalendarModule],
    providers: [BookingsService],
    controllers: [BookingsController],
    exports: [BookingsService],
})
export class BookingsModule { }
