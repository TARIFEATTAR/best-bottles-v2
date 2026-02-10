
import { createClient } from '@sanity/client';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import Papa from 'papaparse';

dotenv.config({ path: '../best-bottles-v2/.env' }); // Load from the main project's .env

const client = createClient({
    projectId: process.env.VITE_SANITY_PROJECT_ID,
    dataset: process.env.VITE_SANITY_DATASET,
    token: process.env.SANITY_API_TOKEN,
    apiVersion: '2024-01-01',
    useCdn: false,
});

const CONSOLIDATED_CSV = path.join(process.cwd(), 'bestbottles_consolidated_inventory.csv');

async function uploadImageToSanity(url, filename) {
    if (!url) return null;
    console.log(`   🎨 Uploading image to Sanity: ${filename}...`);
    try {
        const response = await fetch(url);
        const blob = await response.blob();
        const asset = await client.assets.upload('image', blob, { filename });
        return {
            _type: 'image',
            asset: {
                _type: 'reference',
                _ref: asset._id,
            },
        };
    } catch (error) {
        console.error(`   ❌ Failed to upload ${url}:`, error.message);
        return null;
    }
}

async function run() {
    console.log('🚀 Starting Sanity Sync...');

    if (!fs.existsSync(CONSOLIDATED_CSV)) {
        console.error('❌ Consolidated CSV not found! Run "npm run consolidate" first.');
        return;
    }

    const csvData = fs.readFileSync(CONSOLIDATED_CSV, 'utf8');
    const products = Papa.parse(csvData, { header: true, skipEmptyLines: true }).data;
    console.log(`📄 Loaded ${products.length} products to sync.`);

    for (const row of products) {
        const sku = row.SKU;
        if (!sku) continue;

        console.log(`\n📦 Syncing SKU: ${sku}...`);

        try {
            // 1. Create Glass Option
            let glassRef = null;
            if (row.Bottle_Image_URL) {
                const glassImage = await uploadImageToSanity(row.Bottle_Image_URL, `${sku}_glass.png`);
                const glassDoc = {
                    _type: 'glassOption',
                    _id: `glass-${sku.toLowerCase().replace(/[^a-z0-9]/g, '-')}`,
                    name: `${row.Description.split(',')[0]} (Glass)`,
                    layerImage: glassImage,
                    priceModifier: 0,
                };
                const createdGlass = await client.createOrReplace(glassDoc);
                glassRef = { _type: 'reference', _ref: createdGlass._id };
                console.log(`   ✅ Glass Option Created: ${createdGlass._id}`);
            }

            // 2. Create Cap Option
            let capRef = null;
            if (row.Cap_Image_URL) {
                const capImage = await uploadImageToSanity(row.Cap_Image_URL, `${sku}_cap.png`);
                const capDoc = {
                    _type: 'capOption',
                    _id: `cap-${sku.toLowerCase().replace(/[^a-z0-9]/g, '-')}`,
                    name: `${row.Included_Component || 'Standard Cap'}`,
                    layerImage: capImage,
                    assemblyOffsetY: 0,
                    assemblyOffsetX: 0,
                };
                const createdCap = await client.createOrReplace(capDoc);
                capRef = { _type: 'reference', _ref: createdCap._id };
                console.log(`   ✅ Cap Option Created: ${createdCap._id}`);
            }

            // 3. Create Fitment Variant (Roller/Spray/Pump)
            let fitmentRef = null;
            if (row.Fitment_Image_URL) {
                const fitmentImage = await uploadImageToSanity(row.Fitment_Image_URL, `${sku}_fitment.png`);

                let fitmentType = 'Roller';
                if (sku.toLowerCase().includes('spry')) fitmentType = 'Spray';
                if (sku.toLowerCase().includes('pump')) fitmentType = 'Pump';

                const fitmentDoc = {
                    _type: 'fitmentVariant',
                    _id: `fitment-${sku.toLowerCase().replace(/[^a-z0-9]/g, '-')}`,
                    name: row.Included_Component || `${fitmentType}`,
                    type: fitmentType,
                    layerImage: fitmentImage,
                };
                const createdFitment = await client.createOrReplace(fitmentDoc);
                fitmentRef = { _type: 'reference', _ref: createdFitment._id };
                console.log(`   ✅ Fitment Variant Created: ${createdFitment._id} (${fitmentType})`);
            }

            // 4. Create Product Document
            const productDoc = {
                _type: 'product',
                _id: `product-${sku.toLowerCase().replace(/[^a-z0-9]/g, '-')}`,
                title: row.Description.split(',')[0] || sku,
                slug: { _type: 'slug', current: sku.toLowerCase().replace(/[^a-z0-9]/g, '-') },
                sku: sku,
                status: 'product_published',
                basePrice: parseFloat(row.Price_1pc?.replace('$', '')) || 0,
                defaultGlass: glassRef,
                defaultCap: capRef,
                glassOptions: glassRef ? [glassRef] : [],
                capOptions: capRef ? [capRef] : [],
                fitmentVariants: fitmentRef ? [fitmentRef] : [],
                specifications: {
                    capacity: row.Capacity,
                    material: row.Item_Type,
                },
            };

            await client.createOrReplace(productDoc);
            console.log(`   🚀 Product Synced: ${sku}`);

        } catch (err) {
            console.error(`   ❌ Failed to sync ${sku}:`, err.message);
        }
    }

    console.log('\n✨ Sanity Sync Complete!');
}

run().catch(err => {
    console.error('❌ Sync failed:', err);
});
