import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { PrismaModule } from './prisma/prisma.module';
import { RedisModule } from './redis/redis.module';
import { SupabaseModule } from './supabase/supabase.module';
import { PaymentsModule } from './payments/payments.module';
import { UploadsModule } from './uploads/uploads.module';
import { AuthModule } from './modules/auth/auth.module';
import { ShopsModule } from './modules/shops/shops.module';
import { InventoryModule } from './modules/inventory/inventory.module';
import { CalendarModule } from './modules/calendar/calendar.module';
import { BookingsModule } from './modules/bookings/bookings.module';
import { SearchModule } from './modules/search/search.module';
import { AttributionModule } from './modules/attribution/attribution.module';
import { AdminModule } from './modules/admin/admin.module';
import { ReviewsModule } from './modules/reviews/reviews.module';
import { SupportModule } from './modules/support/support.module';
import { NotificationsModule } from './modules/notifications/notifications.module';

@Module({
    imports: [
        // Configuration
        ConfigModule.forRoot({
            isGlobal: true,
            envFilePath: ['.env.local', '.env'],
        }),

        // Rate limiting (100 requests per minute per IP)
        ThrottlerModule.forRoot([{
            ttl: 60000,
            limit: 100,
        }]),

        // Infrastructure (Free Stack)
        PrismaModule,
        RedisModule,      // Upstash Redis
        SupabaseModule,   // Supabase PostgreSQL + Storage
        PaymentsModule,   // Razorpay
        UploadsModule,    // Supabase Storage uploads

        // Feature modules
        AuthModule,
        ShopsModule,
        InventoryModule,
        CalendarModule,
        BookingsModule,
        SupportModule,
        NotificationsModule,
        AttributionModule,
        AdminModule,
        ReviewsModule,
        SearchModule,     // Add search module
    ],
    providers: [
        // Enable global rate limiting
        {
            provide: APP_GUARD,
            useClass: ThrottlerGuard,
        },
    ],
})
export class AppModule { }
