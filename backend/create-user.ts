
import { PrismaClient, ShopStatus, PricingTier } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const userId = 'f47ac10b-58cc-4372-a567-0e02b2c3d479';
    console.log(`Creating user: ${userId}`);

    try {
        const user = await prisma.user.upsert({
            where: { id: userId },
            update: {},
            create: {
                id: userId,
                phone: '+919999999999',
                name: 'Demo User',
                isVerified: true,
            },
        });
        console.log('✅ User created/found:', user);

        // Ensure at least one shop exists too
        const shop = await prisma.shop.upsert({
            where: { ownerPhone: '+918888888888' },
            update: {},
            create: {
                name: "Demo Shop",
                ownerName: "Shop Owner",
                ownerPhone: "+918888888888",
                email: "demoshop@test.com",
                passwordHash: "$2b$10$SOuF3wVuD9xp2gvIZ06nWOy8D0n5xLlEi7B.etooDoviKAox67dVa", // password123
                address: "123 Fashion St",
                locality: "Indore",
                pincode: "452001",
                lat: 22.7,
                lng: 75.8,
                status: ShopStatus.APPROVED,
                tier: PricingTier.PRO
            }
        });
        console.log('✅ Shop ensured:', shop.id);

    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
