const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testConnection() {
    try {
        console.log('Testing database connection...');
        await prisma.$connect();
        console.log('✅ Database connected successfully!');

        // Try a simple query
        const count = await prisma.shop.count();
        console.log(`✅ Found ${count} shops in database`);

        await prisma.$disconnect();
        console.log('✅ Connection test complete!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Database connection failed:', error.message);
        process.exit(1);
    }
}

testConnection();
