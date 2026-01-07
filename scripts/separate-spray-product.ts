
import { createClient } from '@sanity/client';
import 'dotenv/config';

const client = createClient({
    projectId: 'gv4os6ef',
    dataset: 'production',
    token: 'skPqfKB1P6JF1OlIMIMpAbLcgPSvltCDk6Ssc0uDW7tgNcSEH611KPBilAjNMlpZYk0WqGVyLFXNvknwnQ36lz781ieZdbEdNcIMbzlL2XQ4ds5DxuRnFyw1ykB2O2kziCHk5q2YFmQnb4H7DCYhQKXrSD068QqaIeWNJ8BEwpU44FPQOf0H',
    apiVersion: '2024-01-01',
    useCdn: false,
});

async function main() {
    console.log('🚀 Creating Separate Spray Collection Product...\n');

    // 1. First, get the existing glass options from the Roll-On product
    const rollOnProduct = await client.fetch(`*[_id == "product-master-cyl-5ml"][0]{
        glassOptions,
        defaultGlass
    }`);

    // 2. Define the Spray Collection product
    const sprayProduct = {
        _id: 'product-master-cyl-5ml-spray',
        _type: 'product',
        title: '5ml Spray Collection',
        slug: { _type: 'slug', current: '5ml-spray-collection' },
        basePrice: 0.55,
        sku: 'CYL5SPRY',

        // Reuse the same glass options
        defaultGlass: rollOnProduct?.defaultGlass,
        glassOptions: rollOnProduct?.glassOptions || [],

        // Only include SPRAYER fitments (no rollers)
        fitmentVariants: [
            { _type: 'reference', _ref: 'fitment-cyl-5ml-spryblk', _key: 'spryblk' },
            { _type: 'reference', _ref: 'fitment-cyl-5ml-spryblu', _key: 'spryblu' },
            { _type: 'reference', _ref: 'fitment-cyl-5ml-spryglsh', _key: 'spryglsh' },
            { _type: 'reference', _ref: 'fitment-cyl-5ml-spryglmt', _key: 'spryglmt' },
            { _type: 'reference', _ref: 'fitment-cyl-5ml-spryslmt', _key: 'spryslmt' },
        ],

        // Sprayers don't need separate cap options (overcap is included)
        capOptions: [],
    };

    await client.createOrReplace(sprayProduct);
    console.log('✅ Created: 5ml Spray Collection');

    // 3. Update the Roll-On product to REMOVE sprayers (keep only rollers)
    console.log('\n🔧 Cleaning up Roll-On product (removing sprayers)...');

    // Get only roller fitments
    const rollerFitments = [
        { _type: 'reference', _ref: 'fitment-cyl-5ml-plsroll', _key: 'plsroll' },
        { _type: 'reference', _ref: 'fitment-cyl-5ml-mtlroll', _key: 'mtlroll' },
    ];

    await client.patch('product-master-cyl-5ml')
        .set({
            title: '5ml Roll-On Collection',
            fitmentVariants: rollerFitments
        })
        .commit();

    console.log('✅ Updated: 5ml Roll-On Collection (rollers only)');

    console.log('\n✨ Product Separation Complete!');
    console.log('   - Roll-On: /demo/mvp (5ml-cylinder-master)');
    console.log('   - Spray:   /demo/mvp-spray (5ml-spray-collection)');
}

main().catch(console.error);
