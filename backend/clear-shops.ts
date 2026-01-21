import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('🗑️  Clearing all shops from database...\n');

    // Count existing records
    const shopCount = await prisma.shop.count();
    const itemCount = await prisma.inventoryItem.count();
    const bookingCount = await prisma.booking.count();

    console.log('📊 Current database state:');
    console.log(`   - Shops: ${shopCount}`);
    console.log(`   - Inventory Items: ${itemCount}`);
    console.log(`   - Bookings: ${bookingCount}\n`);

    if (shopCount === 0) {
        console.log('✅ No shops to delete. Database is already clean.');
        return;
    }

    // Delete all shops (cascades to inventory items and related data)
    console.log('🗑️  Deleting all shops and related data...');

    const deleted = await prisma.shop.deleteMany({});

    console.log(`✅ Deleted ${deleted.count} shop(s)`);

    // Verify deletion
    const remaining = await prisma.shop.count();
    const remainingItems = await prisma.inventoryItem.count();
    const remainingBookings = await prisma.booking.count();

    console.log('\n📊 Database state after cleanup:');
    console.log(`   - Shops: ${remaining}`);
    console.log(`   - Inventory Items: ${remainingItems}`);
    console.log(`   - Bookings: ${remainingBookings}`);

    console.log('\n🎉 Database cleanup completed successfully!');
    console.log('💡 Tip: Run "npx tsx seed-inventory.ts" to add test data back.');
}

main()
    .catch((e) => {
        console.error('❌ Error clearing shops:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
