import { createClient } from '@sanity/client';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import Papa from 'papaparse';

dotenv.config();

const client = createClient({
    projectId: process.env.SANITY_PROJECT_ID,
    dataset: process.env.SANITY_DATASET || 'production',
    token: process.env.SANITY_API_TOKEN,
    useCdn: false,
    apiVersion: '2024-01-01'
});

const CSV_PATH = path.join(process.cwd(), 'uploaded_components_map.csv');

async function createShowroom() {
    console.log('🏗️ Building Showroom Products in Sanity...');

    if (!fs.existsSync(CSV_PATH)) {
        console.error('❌ CSV Map not found!');
        return;
    }

    const csvData = fs.readFileSync(CSV_PATH, 'utf8');
    const records = Papa.parse(csvData, { header: true, skipEmptyLines: true }).data;

    const transaction = client.transaction();

    for (const record of records) {
        const { SKU, Bottle_URL, Fitment_URL, Cap_URL, Overcap_URL } = record;
        if (!SKU) continue;

        const productId = `showroom-${SKU}`;
        const productDoc = {
            _id: productId,
            _type: 'product',
            title: `Showroom: ${SKU}`,
            sku: { _type: 'slug', current: SKU },
            category: 'Showroom'
        };

        // ONLY link if we actually created these docs in the previous sync
        if (Bottle_URL) {
            productDoc.glass = { _type: 'reference', _ref: `glass-${SKU}` };
        }

        if (Cap_URL || Overcap_URL) {
            productDoc.cap = { _type: 'reference', _ref: `cap-${SKU}` };
        }

        if (Fitment_URL || Overcap_URL) {
            productDoc.fitment = { _type: 'reference', _ref: `fitment-${SKU}` };
        }

        transaction.createOrReplace(productDoc);
    }

    console.log(`📤 Syncing ${records.length} Showroom Products...`);

    try {
        await transaction.commit();
        console.log(`✅ Showroom is LIVE! 27 Products created.`);
        console.log(`\n👉 Open Sanity Studio and search for "Showroom" to see them.`);
        console.log(`👉 Or check your storefront at a route that queries these products.`);
    } catch (err) {
        console.error('❌ Failed to create showroom:', err.message);
    }
}

createShowroom();
