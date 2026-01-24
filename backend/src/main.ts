import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
    const app = await NestFactory.create(AppModule);

    // Global prefix
    app.setGlobalPrefix('api/v1');

    // CORS - Load from environment variable
    const corsOrigins = process.env.CORS_ORIGINS
        ? process.env.CORS_ORIGINS.split(',').map(origin => origin.trim())
        : [
            'http://localhost:3001', // User web
            'http://localhost:3002', // Admin
            'http://10.204.162.252:3000', // Local Network Access
            'http://10.204.162.252:8081', // Expo Bundler
        ];

    console.log('🌐 CORS enabled for origins:', corsOrigins);

    app.enableCors({
        origin: corsOrigins,
        credentials: true,
    });

    // Validation pipe
    app.useGlobalPipes(
        new ValidationPipe({
            whitelist: true,
            forbidNonWhitelisted: true,
            transform: true,
            transformOptions: {
                enableImplicitConversion: true,
            },
        }),
    );

    // Swagger API documentation
    const config = new DocumentBuilder()
        .setTitle('Fashcycle API')
        .setDescription('Vertical SaaS + O2O Marketplace for Fashion Rental')
        .setVersion('1.0')
        .addBearerAuth()
        .addTag('auth', 'Authentication endpoints')
        .addTag('shops', 'Shop management')
        .addTag('inventory', 'Inventory management')
        .addTag('bookings', 'Booking and holds')
        .addTag('search', 'Product search')
        .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api/docs', app, document);

    const port = process.env.PORT || 3000;
    await app.listen(port, '0.0.0.0');

    console.log(`🚀 Fashcycle API running on http://localhost:${port}`);
    console.log(`📚 API Docs available at http://localhost:${port}/api/docs`);
}

bootstrap();
