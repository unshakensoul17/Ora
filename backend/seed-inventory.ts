import { PrismaClient, Category, ItemStatus, ItemCondition } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Seeding test inventory data...');

    // First, create a test shop if it doesn't exist
    const shop = await prisma.shop.upsert({
        where: { email: 'testshop@fashcycle.com' },
        update: {},
        create: {
            name: 'Elegant Boutique',
            ownerName: 'Raj Sharma',
            ownerPhone: '+919876543210',
            email: 'testshop@fashcycle.com',
            passwordHash: 'test-hash', // In real app, this would be bcrypt hashed
            address: '123 Fashion Street',
            locality: 'Vijay Nagar',
            city: 'Indore',
            pincode: '452001',
            lat: 22.7196,
            lng: 75.8577,
            status: 'APPROVED',
        },
    });

    console.log('✅ Shop created:', shop.name);

    // Create sample inventory items
    const items = [
        {
            name: 'Royal Red Bridal Lehenga',
            description: 'Stunning bridal lehenga with intricate zardozi embroidery. Perfect for your wedding day. Features heavy work on raw silk with traditional red and gold color combination.',
            category: Category.LEHENGA,
            subcategory: 'Bridal',
            color: 'Red',
            size: 'M',
            brand: 'Sabyasachi Inspired',
            rentalPrice: 350000, // ₹3,500 in paise
            retailPrice: 6500000, // ₹65,000 in paise
            securityDeposit: 1000000, // ₹10,000 in paise
            status: ItemStatus.ACTIVE,
            condition: ItemCondition.EXCELLENT,
            occasion: ['wedding', 'reception'],
            images: [], // Will add actual images later
        },
        {
            name: 'Blush Pink Floral Lehenga',
            description: 'Elegant floral embroidered lehenga in blush pink. Perfect for sangeet or mehendi ceremonies. Lightweight and comfortable.',
            category: Category.LEHENGA,
            subcategory: 'Party',
            color: 'Pink',
            size: 'S',
            brand: 'Manish Malhotra Inspired',
            rentalPrice: 280000,
            retailPrice: 4800000,
            securityDeposit: 800000,
            status: ItemStatus.ACTIVE,
            condition: ItemCondition.EXCELLENT,
            occasion: ['sangeet', 'mehendi', 'engagement'],
            images: [],
        },
        {
            name: 'Ivory Regal Sherwani',
            description: 'Classic ivory sherwani with subtle gold embroidery. Timeless elegance for the modern groom.',
            category: Category.SHERWANI,
            subcategory: 'Wedding',
            color: 'Ivory',
            size: 'L',
            brand: 'Designer Collection',
            rentalPrice: 220000,
            retailPrice: 3800000,
            securityDeposit: 600000,
            status: ItemStatus.ACTIVE,
            condition: ItemCondition.EXCELLENT,
            occasion: ['wedding', 'reception'],
            images: [],
        },
        {
            name: 'Maroon Velvet Sherwani',
            description: 'Rich maroon velvet sherwani with intricate thread work. Perfect for winter weddings.',
            category: Category.SHERWANI,
            subcategory: 'Wedding',
            color: 'Maroon',
            size: 'XL',
            brand: 'Premium Menswear',
            rentalPrice: 250000,
            retailPrice: 4200000,
            securityDeposit: 700000,
            status: ItemStatus.ACTIVE,
            condition: ItemCondition.EXCELLENT,
            occasion: ['wedding', 'reception'],
            images: [],
        },
        {
            name: 'Emerald Green Anarkali',
            description: 'Flowing emerald green anarkali suit with delicate golden work. Graceful and elegant.',
            category: Category.ANARKALI,
            subcategory: 'Party',
            color: 'Green',
            size: 'M',
            brand: 'Ethnic Couture',
            rentalPrice: 180000,
            retailPrice: 2800000,
            securityDeposit: 500000,
            status: ItemStatus.ACTIVE,
            condition: ItemCondition.GOOD,
            occasion: ['party', 'engagement', 'reception'],
            images: [],
        },
        {
            name: 'Navy Indo-Western Suit',
            description: 'Contemporary navy blue indo-western suit. Modern cuts with traditional touches.',
            category: Category.INDO_WESTERN,
            subcategory: 'Party',
            color: 'Navy',
            size: 'M',
            brand: 'Contemporary Fusion',
            rentalPrice: 200000,
            retailPrice: 3200000,
            securityDeposit: 550000,
            status: ItemStatus.ACTIVE,
            condition: ItemCondition.EXCELLENT,
            occasion: ['party', 'engagement'],
            images: [],
        },
        {
            name: 'Champagne Gold Lehenga',
            description: 'Luxurious champagne gold lehenga with pearl work. Sophisticated and glamorous.',
            category: Category.LEHENGA,
            subcategory: 'Bridal',
            color: 'Gold',
            size: 'L',
            brand: 'Bridal Couture',
            rentalPrice: 320000,
            retailPrice: 5800000,
            securityDeposit: 950000,
            status: ItemStatus.ACTIVE,
            condition: ItemCondition.EXCELLENT,
            occasion: ['wedding', 'reception'],
            images: [],
        },
        {
            name: 'Purple Royale Anarkali Gown',
            description: 'Royal purple anarkali gown with silver embellishments. Regal and majestic.',
            category: Category.ANARKALI,
            subcategory: 'Party',
            color: 'Purple',
            size: 'S',
            brand: 'Royal Collection',
            rentalPrice: 210000,
            retailPrice: 3500000,
            securityDeposit: 600000,
            status: ItemStatus.ACTIVE,
            condition: ItemCondition.GOOD,
            occasion: ['party', 'reception'],
            images: [],
        },
    ];

    for (const item of items) {
        const created = await prisma.inventoryItem.create({
            data: {
                ...item,
                shopId: shop.id,
            },
        });
        console.log(`✅ Created: ${created.name}`);
    }

    console.log('\n🎉 Seeding completed successfully!');
}

main()
    .catch((e) => {
        console.error('❌ Error seeding data:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
