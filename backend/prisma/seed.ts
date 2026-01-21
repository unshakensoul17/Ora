import { PrismaClient, ShopStatus, Category, ItemStatus } from '@prisma/client';

const prisma = new PrismaClient();

// Indore localities
const localities = [
    'Vijay Nagar',
    'Sapna Sangeeta',
    'Palasia',
    'Rajwada',
    'MG Road',
    'South Tukoganj',
    'New Palasia',
    'Bhawarkuan',
    'Bhanwar Kuwa',
    'Ring Road',
];

// Sample shop data
const shopsData = [
    {
        name: 'Empress Fashion House',
        ownerName: 'Priya Sharma',
        ownerPhone: '+919876543001',
        locality: 'Vijay Nagar',
        address: '45, Scheme No. 54, Vijay Nagar, Indore',
        lat: 22.7533,
        lng: 75.8937,
    },
    {
        name: 'Royal Wardrobe',
        ownerName: 'Rahul Joshi',
        ownerPhone: '+919876543002',
        locality: 'Sapna Sangeeta',
        address: '23, Sapna Sangeeta Road, Indore',
        lat: 22.7196,
        lng: 75.8577,
    },
    {
        name: 'Shree Laxmi Rentals',
        ownerName: 'Meera Patel',
        ownerPhone: '+919876543003',
        locality: 'Rajwada',
        address: 'Near Rajwada Palace, Indore',
        lat: 22.7179,
        lng: 75.8567,
    },
    {
        name: 'Glamour Studio',
        ownerName: 'Vikram Singh',
        ownerPhone: '+919876543004',
        locality: 'Palasia',
        address: '78, Palasia Square, Indore',
        lat: 22.7241,
        lng: 75.8839,
    },
    {
        name: 'Wedding Bells',
        ownerName: 'Anita Gupta',
        ownerPhone: '+919876543005',
        locality: 'MG Road',
        address: '12, MG Road, Indore',
        lat: 22.7185,
        lng: 75.8545,
    },
    {
        name: 'Designer Dreams',
        ownerName: 'Sanjay Agarwal',
        ownerPhone: '+919876543006',
        locality: 'South Tukoganj',
        address: 'South Tukoganj, Indore',
        lat: 22.7155,
        lng: 75.8835,
    },
    {
        name: 'Bridal Bliss',
        ownerName: 'Kavita Verma',
        ownerPhone: '+919876543007',
        locality: 'New Palasia',
        address: 'New Palasia, Indore',
        lat: 22.7235,
        lng: 75.8825,
    },
    {
        name: 'Heritage Fashions',
        ownerName: 'Deepak Jain',
        ownerPhone: '+919876543008',
        locality: 'Bhawarkuan',
        address: 'Bhawarkuan Main Road, Indore',
        lat: 22.7350,
        lng: 75.8650,
    },
    {
        name: 'Regal Attire',
        ownerName: 'Sunita Saxena',
        ownerPhone: '+919876543009',
        locality: 'Ring Road',
        address: 'Ring Road, Indore',
        lat: 22.7450,
        lng: 75.8750,
    },
    {
        name: 'Elegance Rentals',
        ownerName: 'Amit Sharma',
        ownerPhone: '+919876543010',
        locality: 'Vijay Nagar',
        address: 'Scheme 78, Vijay Nagar, Indore',
        lat: 22.7520,
        lng: 75.8950,
    },
];

// Sample inventory items
const inventoryTemplates = [
    { name: 'Royal Red Bridal Lehenga', category: Category.LEHENGA, brand: 'Sabyasachi Replica', size: 'M', rentalPrice: 350000, retailPrice: 6500000, securityDeposit: 1000000, subcategory: 'Bridal', color: 'Red', occasion: ['wedding'] },
    { name: 'Blush Pink Floral Lehenga', category: Category.LEHENGA, brand: 'Manish Malhotra Inspired', size: 'S', rentalPrice: 280000, retailPrice: 4800000, securityDeposit: 800000, subcategory: 'Reception', color: 'Pink', occasion: ['reception', 'sangeet'] },
    { name: 'Champagne Gold Lehenga', category: Category.LEHENGA, brand: 'Bridal Couture', size: 'L', rentalPrice: 320000, retailPrice: 5800000, securityDeposit: 900000, subcategory: 'Bridal', color: 'Gold', occasion: ['wedding', 'reception'] },
    { name: 'Ivory Regal Sherwani', category: Category.SHERWANI, brand: 'Designer Collection', size: 'L', rentalPrice: 220000, retailPrice: 3800000, securityDeposit: 600000, subcategory: 'Wedding', color: 'Ivory', occasion: ['wedding'] },
    { name: 'Maroon Velvet Sherwani', category: Category.SHERWANI, brand: 'Premium Menswear', size: 'XL', rentalPrice: 250000, retailPrice: 4200000, securityDeposit: 700000, subcategory: 'Wedding', color: 'Maroon', occasion: ['wedding', 'reception'] },
    { name: 'Navy Indo-Western', category: Category.INDO_WESTERN, brand: 'Contemporary Fusion', size: 'M', rentalPrice: 200000, retailPrice: 3200000, securityDeposit: 500000, subcategory: 'Party', color: 'Navy', occasion: ['reception', 'party'] },
    { name: 'Emerald Green Anarkali', category: Category.ANARKALI, brand: 'Ethnic Couture', size: 'M', rentalPrice: 180000, retailPrice: 2800000, securityDeposit: 400000, subcategory: 'Sangeet', color: 'Green', occasion: ['sangeet', 'mehendi'] },
    { name: 'Purple Royale Anarkali Gown', category: Category.ANARKALI, brand: 'Royal Collection', size: 'S', rentalPrice: 210000, retailPrice: 3500000, securityDeposit: 550000, subcategory: 'Party', color: 'Purple', occasion: ['party', 'reception'] },
    { name: 'Traditional Banarasi Saree', category: Category.SAREE, brand: 'Heritage Weaves', size: 'Free', rentalPrice: 150000, retailPrice: 2500000, securityDeposit: 350000, subcategory: 'Wedding', color: 'Red', occasion: ['wedding', 'pooja'] },
    { name: 'Designer Silk Saree', category: Category.SAREE, brand: 'South Silks', size: 'Free', rentalPrice: 120000, retailPrice: 2000000, securityDeposit: 300000, subcategory: 'Reception', color: 'Magenta', occasion: ['reception', 'party'] },
    { name: 'Cream Kurta Pajama Set', category: Category.KURTA_PAJAMA, brand: 'Classic Menswear', size: 'L', rentalPrice: 80000, retailPrice: 1200000, securityDeposit: 200000, subcategory: 'Haldi', color: 'Cream', occasion: ['haldi', 'mehendi'] },
    { name: 'Midnight Blue Gown', category: Category.GOWN, brand: 'Evening Elegance', size: 'M', rentalPrice: 250000, retailPrice: 4000000, securityDeposit: 600000, subcategory: 'Party', color: 'Blue', occasion: ['reception', 'party'] },
];

async function seed() {
    console.log('🌱 Starting seed...');

    // Create sample user
    const user = await prisma.user.upsert({
        where: { phone: '+919876543000' },
        update: {},
        create: {
            phone: '+919876543000',
            name: 'Test User',
            isVerified: true,
        },
    });
    console.log(`✅ Created user: ${user.name}`);

    // Create shops
    for (const shopData of shopsData) {
        const shop = await prisma.shop.upsert({
            where: { ownerPhone: shopData.ownerPhone },
            update: {},
            create: {
                ...shopData,
                email: `${shopData.ownerPhone.replace('+91', '')}@test.com`,
                passwordHash: '$2b$10$SOuF3wVuD9xp2gvIZ06nWOy8D0n5xLlEi7B.etooDoviKAox67dVa', // password123
                city: 'Indore',
                pincode: '452001',
                status: ShopStatus.APPROVED,
                verifiedAt: new Date(),
            },
        });

        // Create billing record
        await prisma.shopBilling.upsert({
            where: { shopId: shop.id },
            update: {},
            create: { shopId: shop.id },
        });

        // Create inventory items (random selection, 5-10 per shop)
        const numItems = 5 + Math.floor(Math.random() * 6);
        const shuffled = [...inventoryTemplates].sort(() => Math.random() - 0.5);
        const selectedItems = shuffled.slice(0, numItems);

        for (const itemData of selectedItems) {
            // Add some variation
            const priceVariation = 0.8 + Math.random() * 0.4; // 80% - 120%

            await prisma.inventoryItem.create({
                data: {
                    shopId: shop.id,
                    name: itemData.name,
                    category: itemData.category,
                    subcategory: itemData.subcategory,
                    brand: itemData.brand,
                    size: itemData.size,
                    color: itemData.color,
                    rentalPrice: Math.round(itemData.rentalPrice * priceVariation),
                    retailPrice: itemData.retailPrice,
                    securityDeposit: itemData.securityDeposit,
                    occasion: itemData.occasion,
                    status: ItemStatus.ACTIVE,
                    images: [],
                    description: `Beautiful ${itemData.name} available for rent. Perfect for ${itemData.occasion.join(', ')} occasions.`,
                },
            });
        }

        console.log(`✅ Created shop: ${shop.name} with ${numItems} items`);
    }

    console.log('\n🎉 Seed completed!');
    console.log(`   📦 ${shopsData.length} shops created`);
    console.log(`   👗 Multiple inventory items per shop`);
    console.log(`   👤 1 test user created`);
}

seed()
    .catch((e) => {
        console.error('❌ Seed failed:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
