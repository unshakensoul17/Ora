import { PrismaClient } from '@prisma/client';
import { MeiliSearch } from 'meilisearch';

const prisma = new PrismaClient();

async function main() {
    console.log('🔄 Reindexing all inventory items in Meilisearch...');

    // Connect to Meilisearch
    const client = new MeiliSearch({
        host: process.env.MEILISEARCH_URL || 'http://localhost:7700',
        apiKey: process.env.MEILISEARCH_API_KEY || 'fashcycle-dev-key',
    });

    const itemsIndex = client.index('items');

    // Configure index settings
    console.log('⚙️  Configuring index settings...');
    await itemsIndex.updateSettings({
        searchableAttributes: [
            'name',
            'description',
            'category',
            'subcategory',
            'brand',
            'color',
            'occasion',
        ],
        filterableAttributes: [
            'category',
            'size',
            'rentalPrice',
            'status',
            'shopId',
            'locality',
        ],
        sortableAttributes: ['rentalPrice', 'createdAt', 'timesRented'],
    });

    // Fetch all active items
    const items = await prisma.inventoryItem.findMany({
        where: {
            status: 'ACTIVE',
        },
        include: {
            shop: {
                select: {
                    locality: true,
                },
            },
        },
    });

    console.log(`📦 Found ${items.length} items to index`);

    // Prepare items for Meilisearch
    const documents = items.map((item) => ({
        id: item.id,
        name: item.name,
        description: item.description,
        category: item.category,
        subcategory: item.subcategory,
        brand: item.brand,
        color: item.color,
        size: item.size,
        rentalPrice: item.rentalPrice,
        occasion: item.occasion,
        status: item.status,
        shopId: item.shopId,
        locality: item.shop?.locality,
        images: item.images,
        createdAt: item.createdAt.getTime(),
        timesRented: item.timesRented,
    }));

    // Index all documents
    console.log('📤 Indexing documents...');
    const task = await itemsIndex.addDocuments(documents, { primaryKey: 'id' });
    console.log(`✅ Indexing task queued: ${task.taskUid}`);

    // Wait for task to complete
    console.log('⏳ Waiting for indexing to complete...');
    await client.waitForTask(task.taskUid);

    console.log(`\n🎉 Successfully reindexed ${items.length} items!`);

    // Test search
    console.log('\n🔍 Testing search...');
    const results = await itemsIndex.search('lehenga', { limit: 3 });
    console.log(`Found ${results.hits.length} results for "lehenga"`);
    results.hits.forEach((hit: any) => {
        console.log(`  - ${hit.name} (${hit.category})`);
    });
}

main()
    .catch((e) => {
        console.error('❌ Error reindexing:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
