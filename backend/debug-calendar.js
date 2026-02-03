
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
    const shopId = 'f61a105c-0289-4c41-b3a8-9cc1fc95f41e'; // From user logs
    console.log(`Testing connection and query for shopId: ${shopId}`);

    try {
        // 1. Simple count query first
        const count = await prisma.booking.count();
        console.log(`Total bookings in DB: ${count}`);

        // 2. Test the specific problematic query
        console.log('Running getShopBookings query...');
        const bookings = await prisma.booking.findMany({
            where: {
                shopId: shopId,
            },
            include: {
                item: true,
                user: {
                    select: { id: true, name: true, phone: true },
                },
            },
            orderBy: { startDate: 'asc' },
        });

        console.log(`Successfully fetched ${bookings.length} bookings.`);
        if (bookings.length > 0) {
            console.log('Sample booking:', JSON.stringify(bookings[0], null, 2));
        }

    } catch (error) {
        console.error('ERROR OCCURRED:');
        console.error(error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
